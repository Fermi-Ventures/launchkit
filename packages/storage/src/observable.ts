/**
 * Observable Storage Service Wrapper
 *
 * Wraps any StorageService implementation with logging and error categorization.
 * This is a decorator pattern - the underlying provider does the actual work,
 * while this wrapper adds observability concerns.
 *
 * Features:
 * - Structured logging for all operations (start, success, error)
 * - Duration tracking for performance monitoring
 * - Error categorization (network, quota, credentials, etc.)
 * - Correlation ID propagation for request tracing
 *
 * Usage:
 * ```typescript
 * const storage = createStorageService({
 *   logger: {
 *     info: (event, data) => console.log(event, data),
 *     error: (event, data) => console.error(event, data),
 *   }
 * });
 * ```
 */

import type {
  StorageService,
  StoredBlob,
  UploadOptions,
  GetUrlOptions,
  StorageLogger,
  StorageLogEvent,
  StorageErrorCode,
  UploadOptionsWithContext,
  DeleteOptions,
} from './types.js';
import { StorageError } from './types.js';

/**
 * Wrap a storage service with observability features.
 */
export class ObservableStorageService implements StorageService {
  readonly provider: string;

  constructor(
    private readonly inner: StorageService,
    private readonly logger: StorageLogger
  ) {
    this.provider = inner.provider;
  }

  async upload(
    file: Buffer | Blob,
    options: UploadOptions | UploadOptionsWithContext
  ): Promise<StoredBlob> {
    const startTime = Date.now();
    const correlationId = (options as UploadOptionsWithContext).correlationId;
    const size = Buffer.isBuffer(file) ? file.length : (file as Blob).size;

    const baseEvent: StorageLogEvent = {
      operation: 'upload',
      provider: this.provider,
      correlationId,
      upload: {
        pathname: options.pathname,
        size,
        contentType: options.contentType,
        access: options.access,
      },
    };

    // Log start
    this.logger.debug?.('storage.upload.start', baseEvent);

    try {
      const result = await this.inner.upload(file, options);
      const durationMs = Date.now() - startTime;

      // Log success
      this.logger.info('storage.upload.success', {
        ...baseEvent,
        durationMs,
        result: {
          blobId: result.id,
          pathname: result.pathname,
        },
      });

      return result;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const storageError = this.categorizeError(err, 'upload');

      // Log error
      this.logger.error('storage.upload.error', {
        ...baseEvent,
        durationMs,
        error: {
          code: storageError.code,
          message: storageError.message,
          retryable: storageError.retryable,
        },
      });

      throw storageError;
    }
  }

  getUrl(blobId: string, options?: GetUrlOptions): string {
    // getUrl is synchronous, so we just log at debug level
    this.logger.debug?.('storage.getUrl', {
      operation: 'getUrl',
      provider: this.provider,
      blobId,
    });

    return this.inner.getUrl(blobId, options);
  }

  async delete(blobId: string, options?: DeleteOptions): Promise<void> {
    const startTime = Date.now();
    const correlationId = options?.correlationId;

    const baseEvent: StorageLogEvent = {
      operation: 'delete',
      provider: this.provider,
      correlationId,
      blobId,
    };

    // Log start
    this.logger.debug?.('storage.delete.start', baseEvent);

    try {
      await this.inner.delete(blobId);
      const durationMs = Date.now() - startTime;

      // Log success
      this.logger.info('storage.delete.success', {
        ...baseEvent,
        durationMs,
      });
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const storageError = this.categorizeError(err, 'delete');

      // Log error
      this.logger.error('storage.delete.error', {
        ...baseEvent,
        durationMs,
        error: {
          code: storageError.code,
          message: storageError.message,
          retryable: storageError.retryable,
        },
      });

      throw storageError;
    }
  }

  /**
   * Categorize a raw error into a typed StorageError.
   *
   * Maps common error patterns to error codes:
   * - Network errors (ECONNREFUSED, ETIMEDOUT, fetch errors) → NETWORK_ERROR
   * - 401/403 responses → INVALID_CREDENTIALS
   * - 404 responses → NOT_FOUND
   * - 413/507 responses or quota messages → QUOTA_EXCEEDED
   * - Validation errors → INVALID_INPUT
   * - Everything else → UNKNOWN
   */
  private categorizeError(
    err: unknown,
    operation: 'upload' | 'delete'
  ): StorageError {
    const error = err instanceof Error ? err : new Error(String(err));
    const message = error.message.toLowerCase();

    // Network errors
    if (
      message.includes('econnrefused') ||
      message.includes('etimedout') ||
      message.includes('enotfound') ||
      message.includes('network') ||
      message.includes('fetch failed') ||
      message.includes('socket hang up')
    ) {
      return new StorageError(
        `Network error during ${operation}: ${error.message}`,
        'NETWORK_ERROR',
        this.provider,
        error
      );
    }

    // Credential errors
    if (
      message.includes('401') ||
      message.includes('403') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('invalid token') ||
      message.includes('access denied')
    ) {
      return new StorageError(
        `Authentication failed during ${operation}: ${error.message}`,
        'INVALID_CREDENTIALS',
        this.provider,
        error
      );
    }

    // Not found errors
    if (
      message.includes('404') ||
      message.includes('not found') ||
      message.includes('does not exist')
    ) {
      return new StorageError(
        `Blob not found during ${operation}: ${error.message}`,
        'NOT_FOUND',
        this.provider,
        error
      );
    }

    // Quota errors
    if (
      message.includes('413') ||
      message.includes('507') ||
      message.includes('quota') ||
      message.includes('storage limit') ||
      message.includes('too large')
    ) {
      return new StorageError(
        `Storage quota exceeded during ${operation}: ${error.message}`,
        'QUOTA_EXCEEDED',
        this.provider,
        error
      );
    }

    // Input validation errors
    if (
      message.includes('invalid') ||
      message.includes('validation') ||
      message.includes('path traversal')
    ) {
      return new StorageError(
        `Invalid input during ${operation}: ${error.message}`,
        'INVALID_INPUT',
        this.provider,
        error
      );
    }

    // Unknown error
    return new StorageError(
      `Storage ${operation} failed: ${error.message}`,
      'UNKNOWN',
      this.provider,
      error
    );
  }
}

/**
 * Create an observable storage service if a logger is provided.
 * If no logger, returns the inner service unwrapped.
 */
export function wrapWithObservability(
  service: StorageService,
  logger?: StorageLogger
): StorageService {
  if (!logger) {
    return service;
  }
  return new ObservableStorageService(service, logger);
}
