/**
 * Vercel Blob Storage Provider
 *
 * Wraps @vercel/blob for production use. Requires BLOB_READ_WRITE_TOKEN env var.
 *
 * Key behaviors:
 * - Public blobs are served via Vercel's CDN
 * - Private blobs require proxy (Vercel doesn't support signed URLs)
 * - Returns opaque IDs (pathname-based) for provider-agnostic storage
 *
 * @see https://vercel.com/docs/storage/vercel-blob
 */

import type {
  StorageService,
  StoredBlob,
  UploadOptions,
  GetUrlOptions,
} from '../types.js';

/**
 * Vercel Blob implementation of StorageService.
 *
 * Opaque ID format: `vercel:${pathname}`
 * This allows getUrl() to reconstruct the full URL from the pathname.
 */
export class VercelBlobProvider implements StorageService {
  readonly provider = 'vercel';

  private blobModule: typeof import('@vercel/blob') | null = null;
  private baseUrl: string | null = null;

  /**
   * Lazily load @vercel/blob to avoid requiring it when not used.
   */
  private async getBlobModule(): Promise<typeof import('@vercel/blob')> {
    if (!this.blobModule) {
      this.blobModule = await import('@vercel/blob');
    }
    return this.blobModule;
  }

  async upload(file: Buffer | Blob, options: UploadOptions): Promise<StoredBlob> {
    const { put } = await this.getBlobModule();

    // Generate pathname if not provided
    const pathname = options.pathname ?? this.generatePathname();

    const blob = await put(pathname, file, {
      access: options.access,
      contentType: options.contentType,
      addRandomSuffix: options.addRandomSuffix ?? true,
    });

    // Extract base URL from first upload for getUrl()
    if (!this.baseUrl) {
      const url = new URL(blob.url);
      this.baseUrl = `${url.protocol}//${url.host}`;
    }

    // Determine content type and size
    const contentType = blob.contentType ?? options.contentType ?? 'application/octet-stream';
    const size = Buffer.isBuffer(file) ? file.length : (file as Blob).size;

    return {
      id: `vercel:${blob.pathname}`,
      pathname: blob.pathname,
      contentType,
      size,
    };
  }

  getUrl(blobId: string, _options?: GetUrlOptions): string {
    const pathname = this.extractPathname(blobId);

    // If we've uploaded before, use the discovered base URL
    if (this.baseUrl) {
      return `${this.baseUrl}/${pathname}`;
    }

    // Fallback: construct URL from environment or default pattern
    // Vercel Blob URLs follow: https://<random>.public.blob.vercel-storage.com/<pathname>
    const storeId = process.env.BLOB_STORE_ID;
    if (storeId) {
      return `https://${storeId}.public.blob.vercel-storage.com/${pathname}`;
    }

    // Last resort: return pathname and hope it's used in a context that resolves it
    console.warn(
      '[VercelBlobProvider] No base URL available. Set BLOB_STORE_ID or upload a blob first.'
    );
    return pathname;
  }

  async delete(blobId: string): Promise<void> {
    const { del } = await this.getBlobModule();
    // Vercel Blob delete requires the full URL
    const url = this.getUrl(blobId);
    await del(url);
  }

  /**
   * Extract pathname from opaque blob ID.
   */
  private extractPathname(blobId: string): string {
    if (blobId.startsWith('vercel:')) {
      return blobId.slice(7); // Remove 'vercel:' prefix
    }
    // Backwards compatibility: assume raw pathname
    return blobId;
  }

  /**
   * Generate a random pathname for uploads without explicit path.
   */
  private generatePathname(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${random}`;
  }
}
