/**
 * Build customer-facing trial portal URL (Studio /trial).
 * Passes demo id + return URL so the portal can show demo-specific copy
 * and a "back to demo" link — ready for mass-demo rollout.
 */
export function buildTrialPortalUrl(options: {
  baseUrl: string;
  demoId: string;
  returnUrl?: string;
}): string {
  const base = options.baseUrl.trim() || "http://localhost:3000/trial";
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    url = new URL("http://localhost:3000/trial");
  }
  // If env points at host root, ensure /trial path
  if (!url.pathname || url.pathname === "/") {
    url.pathname = "/trial";
  }
  url.searchParams.set("demo", options.demoId);
  if (options.returnUrl) {
    url.searchParams.set("return", options.returnUrl);
  }
  return url.toString();
}

export const DEFAULT_TRIAL_PORTAL_BASE =
  import.meta.env.VITE_TRIAL_PORTAL_URL?.trim() ||
  "http://localhost:3000/trial";

/** ISO product_flow demo id in Studio demo-catalog */
export const ISO_DEMO_CATALOG_ID = "iso-chat";
