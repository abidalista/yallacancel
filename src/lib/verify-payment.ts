/**
 * Verify payment receipt with the server.
 */
export async function verifyPaymentReceipt(receiptId: string): Promise<boolean> {
  const res = await fetch("/api/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ receiptId }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  return Boolean(data.valid);
}
