/**
 * Prepend the Astro base path to a site-relative path.
 * In dev, BASE_URL is "/"; in prod with base: "/yulan", it is "/yulan/".
 */
export function withBase(path: string): string {
  const base: string = import.meta.env.BASE_URL ?? '/';
  const clean = path.replace(/^\/+/, '');
  return `${base}${clean ? '/' + clean : ''}`.replace(/\/+/g, '/');
}

/**
 * Fix paths from JSON data files that contain "/public" prefix.
 * Strips "/public" then applies withBase.
 */
export function fixPublicPath(path: string): string {
  const clean = (path || '').replace(/^\/public/, '');
  return withBase(clean);
}
