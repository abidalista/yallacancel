"use client";

import { useEffect } from "react";
import { initPostHog } from "@/lib/analytics";

export default function PostHogInit() {
  useEffect(() => {
    initPostHog();
  }, []);
  return null;
}
