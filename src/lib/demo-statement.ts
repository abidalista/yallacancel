/** Bundled sample statement for the landing "try a ready example" path. */

export const DEMO_STATEMENT_URL = "/test-statement.csv";
export const DEMO_STATEMENT_FILENAME = "demo-statement.csv";
export const DEMO_STATEMENT_MIME = "text/csv";

export function demoStatementFile(source: Blob | string): File {
  const blob =
    typeof source === "string"
      ? new Blob([source], { type: DEMO_STATEMENT_MIME })
      : source;
  return new File([blob], DEMO_STATEMENT_FILENAME, { type: DEMO_STATEMENT_MIME });
}
