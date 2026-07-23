/** 相談CTA。未設定時は null（非表示）。 */
export function getContactUrl(): string | null {
  const raw = import.meta.env.VITE_CONTACT_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}
