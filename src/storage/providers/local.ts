/**
 * Local Filesystem Storage Provider
 *
 * Stores blobs on the local filesystem for development without cloud credentials.
 * Files are saved to a configurable directory (default: ./public/uploads).
 *
 * Key behaviors:
 * - No external dependencies or API keys required
 * - URLs are relative paths (e.g., /uploads/abc123.png)
 * - Designed for Next.js public folder serving
 *
 * NOT for production use - no CDN, no redundancy, no access control.
 */

import { mkdir, writeFile, unlink } from 'fs/promises';
import { join, dirname } from 'path';
import { randomBytes } from 'crypto';
import type {
  StorageService,
  StoredBlob,
  UploadOptions,
  GetUrlOptions,
} from '../types.js';

export interface LocalFSProviderConfig {
  /**
   * Directory to store files in.
   * Default: './public/uploads'
   */
  directory?: string;

  /**
   * Base URL prefix for generated URLs.
   * Default: '/uploads'
   */
  baseUrl?: string;
}

/**
 * Local filesystem implementation of StorageService.
 *
 * Opaque ID format: `local:${filename}`
 */
export class LocalFSProvider implements StorageService {
  readonly provider = 'local';

  private directory: string;
  private baseUrl: string;

  constructor(config: LocalFSProviderConfig = {}) {
    this.directory = config.directory ?? './public/uploads';
    this.baseUrl = config.baseUrl ?? '/uploads';
  }

  async upload(file: Buffer | Blob, options: UploadOptions): Promise<StoredBlob> {
    // Generate filename
    const filename = this.generateFilename(options);
    const filepath = join(this.directory, filename);

    // Ensure directory exists
    await mkdir(dirname(filepath), { recursive: true });

    // Convert Blob to Buffer if needed
    const buffer = Buffer.isBuffer(file)
      ? file
      : Buffer.from(await (file as Blob).arrayBuffer());

    // Write file
    await writeFile(filepath, buffer);

    const contentType = options.contentType ?? this.inferContentType(filename);

    return {
      id: `local:${filename}`,
      pathname: filename,
      contentType,
      size: buffer.length,
    };
  }

  getUrl(blobId: string, _options?: GetUrlOptions): string {
    const filename = this.extractFilename(blobId);
    return `${this.baseUrl}/${filename}`;
  }

  async delete(blobId: string): Promise<void> {
    const filename = this.extractFilename(blobId);
    const filepath = join(this.directory, filename);

    try {
      await unlink(filepath);
    } catch (error) {
      // Ignore ENOENT (file doesn't exist)
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Extract filename from opaque blob ID.
   */
  private extractFilename(blobId: string): string {
    if (blobId.startsWith('local:')) {
      return blobId.slice(6); // Remove 'local:' prefix
    }
    // Backwards compatibility: assume raw filename
    return blobId;
  }

  /**
   * Generate a unique filename.
   */
  private generateFilename(options: UploadOptions): string {
    const extension = this.getExtension(options.contentType);
    const random = randomBytes(16).toString('hex');

    if (options.pathname) {
      // Use provided pathname, optionally add suffix
      const base = options.pathname.replace(/\.[^/.]+$/, ''); // Remove existing extension
      if (options.addRandomSuffix !== false) {
        return `${base}-${random.slice(0, 8)}${extension}`;
      }
      return `${base}${extension}`;
    }

    // Generate random filename
    const timestamp = Date.now().toString(36);
    return `${timestamp}-${random.slice(0, 8)}${extension}`;
  }

  /**
   * Get file extension from content type.
   */
  private getExtension(contentType?: string): string {
    if (!contentType) return '';

    const mimeToExt: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'application/pdf': '.pdf',
      'text/plain': '.txt',
      'application/json': '.json',
    };

    return mimeToExt[contentType] ?? '';
  }

  /**
   * Infer content type from filename extension.
   */
  private inferContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();

    const extToMime: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
      txt: 'text/plain',
      json: 'application/json',
    };

    return extToMime[ext ?? ''] ?? 'application/octet-stream';
  }
}
