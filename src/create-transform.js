/**
 * This file has been copied from redux-persist.
 * The intention being to support as much of the redux-persist API as possible.
 */

export function createTransform(inbound, outbound, config = {}) {
  const whitelist = config.whitelist || null;
  const blacklist = config.blacklist || null;

  function whitelistBlacklistCheck(key) {
    if (whitelist && whitelist.indexOf(key) === -1) return true;
    if (blacklist && blacklist.indexOf(key) !== -1) return true;
    return false;
  }

  return {
    in: (data, key, fullState) =>
      !whitelistBlacklistCheck(key) && inbound
        ? inbound(data, key, fullState)
        : data,
    out: (data, key, fullState) =>
      !whitelistBlacklistCheck(key) && outbound
        ? outbound(data, key, fullState)
        : data,
  };
}
