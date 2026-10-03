import type { Request, Response } from "express";
import { UnauthorizedError } from "../../shared/errors.js";
import type { AuthenticatedUser } from "../../shared/middleware/auth.js";
import type { CreateAddressInput, UpdateAddressInput, UpdateProfileInput } from "./users.schema.js";
import * as usersService from "./users.service.js";

function currentUser(req: Request): AuthenticatedUser {
  const user = req.user;
  if (!user) throw new UnauthorizedError("Authentication required");
  return user;
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: { user: await usersService.getProfile(currentUser(req).id) } });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const user = await usersService.updateProfile(currentUser(req), req.body as UpdateProfileInput);
  res.json({ success: true, data: { user } });
}

export async function listAddresses(req: Request, res: Response): Promise<void> {
  // An account with no saved addresses returns an empty list, never null.
  res.json({ success: true, data: { addresses: await usersService.listAddresses(currentUser(req).id) } });
}

export async function createAddress(req: Request, res: Response): Promise<void> {
  const address = await usersService.createAddress(currentUser(req), req.body as CreateAddressInput);
  res.status(201).json({ success: true, data: { address } });
}

export async function updateAddress(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const address = await usersService.updateAddress(currentUser(req), id, req.body as UpdateAddressInput);
  res.json({ success: true, data: { address } });
}

export async function deleteAddress(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  await usersService.deleteAddress(currentUser(req), id);
  res.json({ success: true, data: { deleted: true } });
}
