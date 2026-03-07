/**
 * Cloudflare R2 Storage Provider (Stub)
 *
 * Placeholder for future R2 implementation. R2 offers:
 * - S3-compatible API
 * - Signed URL support for private blobs
 * - Zero egress fees
 *
 * This stub throws errors to prevent accidental use before implementation.
 *
 * @see https://developers.cloudflare.com/r2/
 */

import type {
  StorageService,
  StoredBlob,
  UploadOptions,
  GetUrlOptions,
} from '../types.js';

/**
 * R2 implementation of StorageService.
 *
 * NOT YET IMPLEMENTED - this is a stub for future work.
 *
 * Expected opaque ID format: `r2:${bucket}/${key}`
 */
export class R2Provider implements StorageService {
  readonly provider = 'r2';

  constructor() {
    console.warn(
      '[R2Provider] R2 storage is not yet implemented. Use "vercel" or "local" provider.'
    );
  }

  async upload(_file: Buffer | Blob, _options: UploadOptions): Promise<StoredBlob> {
    throw new Error(
      'R2Provider.upload() is not implemented. ' +
        'See LKT-48 for implementation tracking. ' +
        'Use STORAGE_PROVIDER=vercel or STORAGE_PROVIDER=local instead.'
    );
  }

  getUrl(_blobId: string, _options?: GetUrlOptions): string {
    throw new Error(
      'R2Provider.getUrl() is not implemented. ' +
        'See LKT-48 for implementation tracking.'
    );
  }

  async delete(_blobId: string): Promise<void> {
    throw new Error(
      'R2Provider.delete() is not implemented. ' +
        'See LKT-48 for implementation tracking.'
    );
  }
}

/**
 * Future implementation notes:
 *
 * 1. Dependencies needed:
 *    - @aws-sdk/client-s3 (R2 is S3-compatible)
 *    - @aws-sdk/s3-request-presigner (for signed URLs)
 *
 * 2. Environment variables:
 *    - R2_ACCOUNT_ID
 *    - R2_ACCESS_KEY_ID
 *    - R2_SECRET_ACCESS_KEY
 *    - R2_BUCKET_NAME
 *    - R2_PUBLIC_URL (optional, for public bucket)
 *
 * 3. Key features to implement:
 *    - Signed URL generation with configurable expiry
 *    - Public/private bucket support
 *    - Multipart upload for large files
 *
 * 4. Signed URL pattern (local crypto, no API call):
 *    ```typescript
 *    import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
 *    import { GetObjectCommand } from '@aws-sdk/client-s3';
 *
 *    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
 *    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
 *    ```
 */
