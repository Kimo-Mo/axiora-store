/**
 * Register the Phase 10 payment module alongside the existing namespaces.
 * Explicit imports (no globbing) so a missing or misnamed file fails the build
 * rather than silently producing an untranslated key at runtime.
 */
import nav from './nav.json';
import footer from './footer.json';
import common from './common.json';
import auth from './auth.json';
import cart from './cart.json';
import errors from './errors.json';
import store from './store.json';
import catalog from './catalog.json';
import product from './product.json';
import account from './account.json';
import checkout from './checkout.json';
import orders from './orders.json';
import verification from './verification.json';
import payment from './payment.json';
import admin from './admin.json';

const ar = {
  nav,
  footer,
  common,
  auth,
  cart,
  errors,
  store,
  catalog,
  product,
  account,
  checkout,
  orders,
  verification,
  payment,
  admin,
};

export default ar;