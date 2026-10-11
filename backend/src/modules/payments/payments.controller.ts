import type { Request, Response } from "express";
import { logSecurityEvent } from "../../shared/logger.js";
import type { InitiatePaymentInput } from "./payments.schemas.js";
import * as paymentsService from "./payments.service.js";

export async function listMethods(_req: Request, res: Response): Promise<void> {
  const methods = await paymentsService.listEnabledMethods();
  res.status(200).json({ success: true, data: methods });
}

export async function create(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const result = await paymentsService.initiatePayment(userId, req.body as InitiatePaymentInput);
  res.status(200).json({ success: true, data: result });
}

/**
 * Provider settlement notification (FR-008).
 *
 * Not a customer endpoint: no session, no CSRF exemption of its own (it is mounted
 * before the guard instead), and its authenticity is the provider signature.
 *
 * Response discipline (research D-3): anything authentic — applied, duplicate,
 * review-worthy, or unrecognised — answers 200, because a non-2xx would provoke a
 * retry storm for a message that is already correct. Only an unverifiable
 * signature is 401 and only an unusable body is 400. No internal detail and no
 * provider payload is echoed back.
 */
export async function webhook(req: Request, res: Response): Promise<void> {
  const rawBody = paymentsService.assertRawBodyPresent(
    (req as Request & { rawBody?: Buffer }).rawBody,
  );

  try {
    // The service owns the logging: it holds the order/attempt correlation and
    // already records processed, duplicate, ignored, and review outcomes. This
    // layer only maps an authentication failure onto a status code.
    await paymentsService.handleWebhook({
      rawBody,
      headers: req.headers,
      payload: req.body,
      query: req.query as Record<string, string | undefined>,
    });

    res.status(200).json({ success: true, data: { received: true } });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "WEBHOOK_SIGNATURE_INVALID") {
      logSecurityEvent("payment.webhook.rejected", "rejected", "WEBHOOK_SIGNATURE_INVALID", {
        detail: { path: req.path },
      });
      res.status(401).json({
        success: false,
        error: { message: "Invalid payment notification", code: "WEBHOOK_SIGNATURE_INVALID" },
      });
      return;
    }
    throw error;
  }
}