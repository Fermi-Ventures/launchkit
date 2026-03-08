/**
 * URL building utilities for multi-tenant applications.
 *
 * Extracted from launch-lab. Provides helpers for constructing URLs
 * in multi-tenant contexts (with slug-based routing or custom domains).
 *
 * @example
 * ```ts
 * // Build a tenant-scoped URL
 * const url = tenantUrl('acme-corp', '/settings');
 * // Returns: /acme-corp/settings
 *
 * // Build OG image URL
 * const ogUrl = buildOgImageUrl(host, 'acme-corp', isPlatformDomain);
 * ```
 */

/**
 * Build a tenant-scoped URL path.
 * @param slug - Tenant slug
 * @param path - Path within tenant (with leading slash)
 */
export function tenantUrl(slug: string, path: string = ""): string {
  return `/${slug}${path}`;
}

/**
 * Build a tenant resource URL path.
 * @param slug - Tenant slug
 * @param resourceType - Resource type (e.g., 'projects', 'ventures')
 * @param resourceId - Resource ID
 * @param subpath - Optional subpath (with leading slash)
 */
export function tenantResourceUrl(
  slug: string,
  resourceType: string,
  resourceId: string,
  subpath: string = ""
): string {
  return `/${slug}/${resourceType}/${resourceId}${subpath}`;
}

/**
 * Build OG image URL for a tenant.
 * @param host - Request hostname
 * @param tenantSlug - Tenant slug
 * @param isPlatformDomain - Whether the host is the platform domain (vs custom domain)
 */
export function buildOgImageUrl(
  host: string,
  tenantSlug: string,
  isPlatformDomain: boolean
): string {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const origin = `${protocol}://${host}`;
  const pathPrefix = isPlatformDomain ? `/${tenantSlug}` : "";
  return `${origin}${pathPrefix}/og-image`;
}

/**
 * Build platform-level OG image URL.
 * @param host - Request hostname
 */
export function buildPlatformOgImageUrl(host: string): string {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://${host}/og-image`;
}
