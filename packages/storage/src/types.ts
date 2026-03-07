/**
 * Storage Abstraction Types
 *
 * Defines the interface for provider-agnostic blob storage. Consumers store
 * opaque blob IDs (not full URLs) and resolve them at render time via getUrl().
 *
 * This abstraction enables:
 * - Swapping storage providers without data migration
 * - Local development without cloud credentials
 * - Future signed URL support (R2)
 *
 * @see ADR: Blob Storage Abstraction Strategy
 */

/**
 * Options for uploading a blob.
 */
export interface UploadOptions {
  /** Access level - public blobs are CDN-served, private require auth */
  access: 'public' | 'private';

  /** MIME type (e.g., 'image/png'). Inferred from file if not provided. */
  contentType?: string;

  /**
   * Custom pathname within the storage bucket.
   * If not provided, a random path is generated.
   * Should NOT include user IDs to prevent enumeration attacks.
   */
  pathname?: string;

  /**
   * Whether to add a random suffix to prevent collisions.
   * Default: true
   */
  addRandomSuffix?: boolean;
}

/**
 * Result of a successful upload.
 * The `id` is an opaque identifier - NOT a full URL.
 */
export interface StoredBlob {
  /** Opaque blob ID for storage and later retrieval */
  id: string;

  /** Provider-specific pathname (useful for debugging) */
  pathname: string;

  /** MIME type of the stored blob */
  contentType: string;

  /** Size in bytes */
  size: number;
}

/**
 * Options for generating a URL from a blob ID.
 */
export interface GetUrlOptions {
  /**
   * For signed URLs (R2 only): expiration time in seconds.
   * Ignored for providers that don't support signed URLs.
   */
  expiresIn?: number;
}

/**
 * Provider-agnostic storage service interface.
 *
 * All implementations must:
 * - Return opaque IDs from upload(), not full URLs
 * - Resolve IDs to URLs via getUrl()
 * - Handle their own authentication/configuration
 */
export interface StorageService {
  /**
   * Upload a blob to storage.
   *
   * @param file - File contents as Buffer or Blob
   * @param options - Upload options (access level, content type, etc.)
   * @returns StoredBlob with opaque ID for later retrieval
   */
  upload(file: Buffer | Blob, options: UploadOptions): Promise<StoredBlob>;

  /**
   * Resolve an opaque blob ID to a full URL.
   *
   * For public blobs, returns a CDN URL.
   * For private blobs, may return a signed URL (provider-dependent).
   *
   * @param blobId - Opaque ID returned from upload()
   * @param options - URL generation options (expiration, etc.)
   * @returns Full URL for accessing the blob
   */
  getUrl(blobId: string, options?: GetUrlOptions): string;

  /**
   * Delete a blob from storage.
   *
   * @param blobId - Opaque ID returned from upload()
   */
  delete(blobId: string): Promise<void>;

  /**
   * Provider name for logging/debugging.
   */
  readonly provider: string;
}

/**
 * Configuration for the storage service factory.
 */
export interface StorageConfig {
  /**
   * Storage provider to use.
   * Default: 'vercel' in production, 'local' if BLOB_READ_WRITE_TOKEN is not set
   */
  provider?: 'vercel' | 'local' | 'r2';

  /**
   * Base directory for local storage (LocalFSProvider only).
   * Default: './public/uploads'
   */
  localDir?: string;

  /**
   * Base URL for local storage URLs (LocalFSProvider only).
   * Default: '/uploads'
   */
  localBaseUrl?: string;
}
