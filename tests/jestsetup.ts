import axios from "axios";
import Adapter from "axios-mock-adapter";
import "mutationobserver-shim";
import "jest-canvas-mock";

declare var global: any;
global.MutationObserver = (window as any).MutationObserver;

const adapter = new Adapter(axios);
adapter.onAny().reply((config) => {
  config.method = config.method || "unknown";
  config.url = config.url || "unknown";
  throw new Error(`No mock defined for config [${config.method.toUpperCase()}] ${config.url}\n`);
});
