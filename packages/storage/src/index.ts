/**
 * Storage Abstraction Layer
 *
 * Provider-agnostic blob storage for Fermi Ventures projects.
 *
 * Key design decisions:
 * - Returns opaque blob IDs, not full URLs (enables provider switching)
 * - Auto-selects provider based on environment (local dev vs production)
 * - Lazy-loads provider dependencies to avoid bundling unused code
 *
 * Usage:
 * ```typescript
 * import { createStorageService } from '@fermi-ventures/launchkit/storage';
 *
 * const storage = createStorageService();
 * const blob = await storage.upload(file, { access: 'public' });
 * const url = storage.getUrl(blob.id);
 * ```
 *
 * @see ADR: Blob Storage Abstraction Strategy
 */

export type {
  StorageService,
  StoredBlob,
  UploadOptions,
  GetUrlOptions,
  StorageConfig,
} from './types.js';

export { VercelBlobProvider } from './providers/vercel-blob.js';
export { LocalFSProvider, type LocalFSProviderConfig } from './providers/local.js';
export { R2Provider } from './providers/r2.js';

import type { StorageService, StorageConfig } from './types.js';
import { VercelBlobProvider } from './providers/vercel-blob.js';
import { LocalFSProvider } from './providers/local.js';
import { R2Provider } from './providers/r2.js';

/**
 * Create a storage service based on configuration or environment.
 *
 * Provider selection (in order of precedence):
 * 1. Explicit `config.provider` option
 * 2. `STORAGE_PROVIDER` environment variable
 * 3. Auto-detect: 'vercel' if BLOB_READ_WRITE_TOKEN is set, else 'local'
 *
 * @param config - Optional configuration
 * @returns Configured StorageService instance
 *
 * @example
 * // Auto-detect provider
 * const storage = createStorageService();
 *
 * @example
 * // Force local provider
 * const storage = createStorageService({ provider: 'local' });
 *
 * @example
 * // Configure local provider paths
 * const storage = createStorageService({
 *   provider: 'local',
 *   localDir: './uploads',
 *   localBaseUrl: '/api/files',
 * });
 */
export function createStorageService(config: StorageConfig = {}): StorageService {
  const provider = resolveProvider(config);

  switch (provider) {
    case 'vercel':
      return new VercelBlobProvider();

    case 'local':
      return new LocalFSProvider({
        directory: config.localDir,
        baseUrl: config.localBaseUrl,
      });

    case 'r2':
      return new R2Provider();

    default:
      throw new Error(
        `Unknown storage provider: "${provider}". ` +
          'Valid options: vercel, local, r2'
      );
  }
}

/**
 * Resolve which provider to use based on config and environment.
 */
function resolveProvider(config: StorageConfig): string {
  // 1. Explicit config
  if (config.provider) {
    return config.provider;
  }

  // 2. Environment variable
  const envProvider = process.env.STORAGE_PROVIDER;
  if (envProvider) {
    return envProvider;
  }

  // 3. Auto-detect
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return 'vercel';
  }

  // Default to local for development
  return 'local';
}

/**
 * Check if a blob ID belongs to a specific provider.
 *
 * Useful for migration scripts or debugging.
 */
export function getBlobProvider(blobId: string): 'vercel' | 'local' | 'r2' | 'unknown' {
  if (blobId.startsWith('vercel:')) return 'vercel';
  if (blobId.startsWith('local:')) return 'local';
  if (blobId.startsWith('r2:')) return 'r2';
  return 'unknown';
}

/**
 * Check if a string looks like a legacy full URL (not an opaque ID).
 *
 * Useful for migration scripts to identify data that needs conversion.
 */
export function isLegacyUrl(value: string): boolean {
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/')
  );
}

/**
 * Convert a legacy Vercel Blob URL to an opaque ID.
 *
 * @example
 * const id = legacyUrlToId('https://abc.public.blob.vercel-storage.com/path/file.png');
 * // Returns: 'vercel:path/file.png'
 */
export function legacyVercelUrlToId(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove leading slash from pathname
    const pathname = parsed.pathname.startsWith('/')
      ? parsed.pathname.slice(1)
      : parsed.pathname;
    return `vercel:${pathname}`;
  } catch {
    // Not a valid URL, return as-is
    return url;
  }
}
