/**
 * Whop self-hosted Apple Pay domain association.
 * Serve the decoded JSON (not the hex dump). Hex was breaking verification.
 */
const ASSOCIATION_JSON =
  '{"version":1,"pspId":"646A8BB624914FB2E855B9D516FB5503381A2DDF85EAFCF60236D80A0DCB53F2","createdOn":1760664777432}';

export async function onRequest(): Promise<Response> {
  return new Response(ASSOCIATION_JSON, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
