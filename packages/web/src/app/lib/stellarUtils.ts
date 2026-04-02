export function parseUsdcAmount(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Amount is required.");
  }

  if (!/^\d+(\.\d{1,7})?$/.test(trimmed)) {
    throw new Error("Amount must be a positive number with up to 7 decimals.");
  }

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  if (numeric > 1000) {
    throw new Error("Amount is too large for demo mode.");
  }

  const [whole, decimals = ""] = trimmed.split(".");
  return decimals.length > 0 ? `${whole}.${decimals.padEnd(7, "0")}` : `${whole}.0000000`;
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) {
    return address;
  }
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
