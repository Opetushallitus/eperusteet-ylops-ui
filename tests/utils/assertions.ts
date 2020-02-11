import { delay } from "@shared/utils/delay";

/**
 * By default this function tries to assert given function for one second.
 *
 * @param fn Function to do assertions in that are catched
 * @param times How many times test should try asserting
 * @param delay How many milliseconds should be between iterations
 */
export async function expectEventually (fn: any, times = 10, ms = 100) {
  let err: any = null;
  for (let idx = 0; idx < times; ++idx) {
    try {
      fn();
      return;
    } catch (error) {
      err = error;
    }
    await delay(ms);
  }
  if (err) {
    throw err;
  }
}
