import axios from "axios";
import Adapter from "axios-mock-adapter";
import "mutationobserver-shim";

declare var global: any;
global.MutationObserver = (window as any).MutationObserver;

const adapter = new Adapter(axios);
adapter.onAny().reply((config) => {
  const method = config.method || "unknown";
  const url = config.url || "unknown";
  throw new Error(`No mock defined for config [${method.toUpperCase()}] ${url}\n`);
});

window.scrollTo = () => {};
