/**
 * Provider-agnostic client analytics.
 * No-ops unless NEXT_PUBLIC_AMPLITUDE_API_KEY is set. Amplitude SDK is not
 * bundled; when the key is present this calls window.amplitude.track if loaded.
 */

export type TrackProps = Record<string, string | number | boolean | null | undefined>;

type AmplitudeWindow = Window & {
  amplitude?: { track?: (event: string, props?: TrackProps) => void };
};

function getAmplitudeKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY?.trim();
  return key || undefined;
}

export function track(event: string, props?: TrackProps): void {
  if (typeof window === "undefined") return;
  if (!event) return;
  if (!getAmplitudeKey()) return;
  try {
    const amplitude = (window as AmplitudeWindow).amplitude;
    amplitude?.track?.(event, props);
  } catch {
    // Analytics must never break checkout.
  }
}
