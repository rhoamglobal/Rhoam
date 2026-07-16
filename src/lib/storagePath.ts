/**
 * Given a Supabase Storage public URL, returns the internal storage path
 * (e.g. "properties/1720800000000.webp") so it can be passed to
 * `.storage.from(bucket).remove([...])`.
 *
 * Returns null for anything that isn't actually a Supabase-hosted image
 * for the `property-images` bucket — e.g. external URLs (Unsplash, etc,
 * which next.config.ts's remotePatterns allows). Only ever try to delete
 * images we actually host; never touch an external URL.
 */
export function extractStoragePath(url: string): string | null {
  const marker = "/storage/v1/object/public/property-images/";
  const index = url.indexOf(marker);

  if (index === -1) return null;

  const path = url.slice(index + marker.length);

  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}
