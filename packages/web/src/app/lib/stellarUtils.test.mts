import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseUsdcAmount, shortenAddress } from "./stellarUtils.ts";

describe("parseUsdcAmount", () => {
  it("normalizes integer amount to 7 decimals", () => {
    assert.equal(parseUsdcAmount("1"), "1.0000000");
  });

  it("keeps valid decimal precision", () => {
    assert.equal(parseUsdcAmount("0.01"), "0.0100000");
  });

  it("throws on invalid value", () => {
    assert.throws(() => parseUsdcAmount("0"));
    assert.throws(() => parseUsdcAmount("abc"));
    assert.throws(() => parseUsdcAmount("1.12345678"));
  });
});

describe("shortenAddress", () => {
  it("shortens long addresses", () => {
    const value = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
    assert.match(shortenAddress(value, 4), /^GAAA\.\.\..+WHF$/);
  });
});
