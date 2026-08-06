/**
 * Verify payment receipt with the server.
 * Retries when Whop has not settled the payment yet (202 pending).
 */

const MAX_ATTEMPTS = 6;
const BASE_DELAY_MS = 400;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function verifyPaymentReceipt(receiptId: string): Promise<boolean> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptId }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        valid?: boolean;
        pending?: boolean;
      };

      if (res.ok && data.valid) return true;

      const pending = res.status === 202 || data.pending === true;
      if (pending && attempt < MAX_ATTEMPTS - 1) {
        await sleep(BASE_DELAY_MS * (attempt + 1));
        continue;
      }

      return false;
    } catch {
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(BASE_DELAY_MS * (attempt + 1));
        continue;
      }
      return false;
    }
  }

  return false;
}
