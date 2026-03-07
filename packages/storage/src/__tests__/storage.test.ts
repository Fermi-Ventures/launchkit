/**
 * Storage Abstraction Tests
 *
 * Tests the storage factory, providers, and utility functions.
 * LocalFSProvider is tested with real filesystem operations.
 * VercelBlobProvider.getUrl() is tested; upload() requires real credentials.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

import {
  createStorageService,
  getBlobProvider,
  isLegacyUrl,
  legacyVercelUrlToId,
  LocalFSProvider,
  ObservableStorageService,
  StorageError,
} from '../index.js';
import type { StorageService, StorageLogger, StorageLogEvent } from '../index.js';

// Test directory for LocalFSProvider
const testDir = join(tmpdir(), `launchkit-storage-test-${randomBytes(4).toString('hex')}`);

describe('createStorageService', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset environment
    delete process.env.STORAGE_PROVIDER;
    delete process.env.BLOB_READ_WRITE_TOKEN;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns LocalFSProvider when no config or env vars', () => {
    const storage = createStorageService();
    expect(storage.provider).toBe('local');
  });

  it('returns VercelBlobProvider when BLOB_READ_WRITE_TOKEN is set', () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
    const storage = createStorageService();
    expect(storage.provider).toBe('vercel');
  });

  it('respects STORAGE_PROVIDER env var', () => {
    process.env.STORAGE_PROVIDER = 'local';
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token'; // Would normally trigger vercel
    const storage = createStorageService();
    expect(storage.provider).toBe('local');
  });

  it('respects explicit config over env vars', () => {
    process.env.STORAGE_PROVIDER = 'vercel';
    const storage = createStorageService({ provider: 'local' });
    expect(storage.provider).toBe('local');
  });

  it('throws for unknown provider', () => {
    expect(() =>
      createStorageService({ provider: 'unknown' as 'local' })
    ).toThrow('Unknown storage provider: "unknown"');
  });
});

describe('LocalFSProvider', () => {
  let storage: LocalFSProvider;

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
    storage = new LocalFSProvider({
      directory: testDir,
      baseUrl: '/test-uploads',
    });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('upload', () => {
    it('uploads a buffer and returns opaque ID', async () => {
      const content = Buffer.from('Hello, world!');
      const result = await storage.upload(content, {
        access: 'public',
        contentType: 'text/plain',
      });

      expect(result.id).toMatch(/^local:/);
      expect(result.size).toBe(content.length);
      expect(result.contentType).toBe('text/plain');

      // Verify file was written
      const filepath = join(testDir, result.pathname);
      const saved = await readFile(filepath, 'utf-8');
      expect(saved).toBe('Hello, world!');
    });

    it('handles Blob input', async () => {
      const content = new Blob(['Blob content'], { type: 'text/plain' });
      const result = await storage.upload(content, {
        access: 'public',
        contentType: 'text/plain',
      });

      expect(result.id).toMatch(/^local:/);
      expect(result.size).toBe(12); // 'Blob content'.length
    });

    it('uses custom pathname when provided', async () => {
      const content = Buffer.from('test');
      const result = await storage.upload(content, {
        access: 'public',
        pathname: 'custom/path',
        contentType: 'text/plain',
        addRandomSuffix: false,
      });

      expect(result.pathname).toBe('custom/path.txt');
    });

    it('adds random suffix by default', async () => {
      const content = Buffer.from('test');
      const result = await storage.upload(content, {
        access: 'public',
        pathname: 'myfile',
        contentType: 'text/plain',
      });

      expect(result.pathname).toMatch(/^myfile-[a-f0-9]+\.txt$/);
    });

    it('infers extension from content type', async () => {
      const content = Buffer.from('fake png');
      const result = await storage.upload(content, {
        access: 'public',
        contentType: 'image/png',
      });

      expect(result.pathname).toMatch(/\.png$/);
    });

    it('rejects path traversal attempts', async () => {
      const content = Buffer.from('malicious');
      await expect(
        storage.upload(content, {
          access: 'public',
          pathname: '../../../etc/passwd',
          contentType: 'text/plain',
          addRandomSuffix: false,
        })
      ).rejects.toThrow('path traversal detected');
    });
  });

  describe('getUrl', () => {
    it('returns URL with configured base', async () => {
      const content = Buffer.from('test');
      const result = await storage.upload(content, {
        access: 'public',
        contentType: 'text/plain',
      });

      const url = storage.getUrl(result.id);
      expect(url).toMatch(/^\/test-uploads\//);
    });

    it('handles raw filename without prefix', () => {
      const url = storage.getUrl('myfile.txt');
      expect(url).toBe('/test-uploads/myfile.txt');
    });
  });

  describe('delete', () => {
    it('deletes an uploaded file', async () => {
      const content = Buffer.from('delete me');
      const result = await storage.upload(content, {
        access: 'public',
        contentType: 'text/plain',
      });

      await storage.delete(result.id);

      // Verify file is gone
      const filepath = join(testDir, result.pathname);
      await expect(readFile(filepath)).rejects.toThrow(/ENOENT/);
    });

    it('does not throw when deleting non-existent file', async () => {
      await expect(storage.delete('local:nonexistent.txt')).resolves.toBeUndefined();
    });

    it('rejects path traversal attempts on delete', async () => {
      await expect(
        storage.delete('local:../../../etc/passwd')
      ).rejects.toThrow('path traversal detected');
    });
  });
});

describe('getBlobProvider', () => {
  it('identifies vercel provider', () => {
    expect(getBlobProvider('vercel:path/to/file.png')).toBe('vercel');
  });

  it('identifies local provider', () => {
    expect(getBlobProvider('local:filename.txt')).toBe('local');
  });

  it('identifies r2 provider', () => {
    expect(getBlobProvider('r2:bucket/key')).toBe('r2');
  });

  it('returns unknown for unrecognized format', () => {
    expect(getBlobProvider('random-string')).toBe('unknown');
    expect(getBlobProvider('https://example.com/file.png')).toBe('unknown');
  });
});

describe('isLegacyUrl', () => {
  it('identifies HTTP URLs', () => {
    expect(isLegacyUrl('http://example.com/file.png')).toBe(true);
  });

  it('identifies HTTPS URLs', () => {
    expect(isLegacyUrl('https://abc.public.blob.vercel-storage.com/file.png')).toBe(true);
  });

  it('identifies root-relative paths', () => {
    expect(isLegacyUrl('/uploads/file.png')).toBe(true);
  });

  it('does not match opaque IDs', () => {
    expect(isLegacyUrl('vercel:path/file.png')).toBe(false);
    expect(isLegacyUrl('local:file.txt')).toBe(false);
  });
});

describe('legacyVercelUrlToId', () => {
  it('converts Vercel Blob URL to opaque ID', () => {
    const url = 'https://abc123.public.blob.vercel-storage.com/images/photo.png';
    expect(legacyVercelUrlToId(url)).toBe('vercel:images/photo.png');
  });

  it('handles URLs with leading slash in pathname', () => {
    const url = 'https://abc.public.blob.vercel-storage.com/file.png';
    expect(legacyVercelUrlToId(url)).toBe('vercel:file.png');
  });

  it('returns invalid URLs unchanged', () => {
    expect(legacyVercelUrlToId('not-a-url')).toBe('not-a-url');
  });

  it('handles already-opaque IDs gracefully', () => {
    expect(legacyVercelUrlToId('vercel:existing')).toBe('vercel:existing');
  });
});

describe('VercelBlobProvider', () => {
  it('extracts pathname from opaque ID', async () => {
    const { VercelBlobProvider } = await import('../providers/vercel-blob.js');
    const storage = new VercelBlobProvider();

    // Test getUrl with BLOB_STORE_ID set
    const originalStoreId = process.env.BLOB_STORE_ID;
    process.env.BLOB_STORE_ID = 'test-store';

    const url = storage.getUrl('vercel:images/photo.png');
    expect(url).toBe('https://test-store.public.blob.vercel-storage.com/images/photo.png');

    process.env.BLOB_STORE_ID = originalStoreId;
  });

  it('handles raw pathname without prefix', async () => {
    const { VercelBlobProvider } = await import('../providers/vercel-blob.js');
    const storage = new VercelBlobProvider();

    const originalStoreId = process.env.BLOB_STORE_ID;
    process.env.BLOB_STORE_ID = 'test-store';

    const url = storage.getUrl('raw-pathname.png');
    expect(url).toBe('https://test-store.public.blob.vercel-storage.com/raw-pathname.png');

    process.env.BLOB_STORE_ID = originalStoreId;
  });

  it('warns when no base URL available', async () => {
    const { VercelBlobProvider } = await import('../providers/vercel-blob.js');
    const storage = new VercelBlobProvider();

    const originalStoreId = process.env.BLOB_STORE_ID;
    delete process.env.BLOB_STORE_ID;

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const url = storage.getUrl('vercel:some/path.png');

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('No base URL available')
    );
    expect(url).toBe('some/path.png'); // Falls back to pathname

    warnSpy.mockRestore();
    process.env.BLOB_STORE_ID = originalStoreId;
  });
});

describe('R2Provider', () => {
  it('throws not implemented error on upload', async () => {
    const { R2Provider } = await import('../providers/r2.js');
    const storage = new R2Provider();

    await expect(
      storage.upload(Buffer.from('test'), { access: 'public' })
    ).rejects.toThrow('R2Provider.upload() is not implemented');
  });

  it('throws not implemented error on getUrl', async () => {
    const { R2Provider } = await import('../providers/r2.js');
    const storage = new R2Provider();

    expect(() => storage.getUrl('r2:bucket/key')).toThrow(
      'R2Provider.getUrl() is not implemented'
    );
  });

  it('throws not implemented error on delete', async () => {
    const { R2Provider } = await import('../providers/r2.js');
    const storage = new R2Provider();

    await expect(storage.delete('r2:bucket/key')).rejects.toThrow(
      'R2Provider.delete() is not implemented'
    );
  });
});

describe('ObservableStorageService', () => {
  let mockLogger: StorageLogger;
  let infoLogs: Array<{ event: string; data: StorageLogEvent }>;
  let errorLogs: Array<{ event: string; data: StorageLogEvent }>;
  let debugLogs: Array<{ event: string; data: StorageLogEvent }>;

  beforeEach(() => {
    infoLogs = [];
    errorLogs = [];
    debugLogs = [];
    mockLogger = {
      info: (event, data) => infoLogs.push({ event, data }),
      error: (event, data) => errorLogs.push({ event, data }),
      debug: (event, data) => debugLogs.push({ event, data }),
    };
  });

  describe('upload', () => {
    it('logs successful uploads with duration', async () => {
      const innerStorage = new LocalFSProvider({
        directory: testDir,
        baseUrl: '/uploads',
      });
      const storage = new ObservableStorageService(innerStorage, mockLogger);

      await mkdir(testDir, { recursive: true });
      const content = Buffer.from('test content');
      const result = await storage.upload(content, {
        access: 'public',
        contentType: 'text/plain',
      });
      await rm(testDir, { recursive: true, force: true });

      // Should have debug start and info success
      expect(debugLogs).toHaveLength(1);
      expect(debugLogs[0].event).toBe('storage.upload.start');
      expect(debugLogs[0].data.operation).toBe('upload');
      expect(debugLogs[0].data.provider).toBe('local');
      expect(debugLogs[0].data.upload?.size).toBe(content.length);

      expect(infoLogs).toHaveLength(1);
      expect(infoLogs[0].event).toBe('storage.upload.success');
      expect(infoLogs[0].data.durationMs).toBeGreaterThanOrEqual(0);
      expect(infoLogs[0].data.result?.blobId).toBe(result.id);
    });

    it('logs upload errors with categorized error code', async () => {
      // Create a mock storage that throws
      const failingStorage: StorageService = {
        provider: 'mock',
        upload: () => Promise.reject(new Error('ECONNREFUSED - Connection refused')),
        getUrl: () => '',
        delete: () => Promise.resolve(),
      };
      const storage = new ObservableStorageService(failingStorage, mockLogger);

      await expect(
        storage.upload(Buffer.from('test'), { access: 'public' })
      ).rejects.toThrow(StorageError);

      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].event).toBe('storage.upload.error');
      expect(errorLogs[0].data.error?.code).toBe('NETWORK_ERROR');
      expect(errorLogs[0].data.error?.retryable).toBe(true);
    });

    it('passes correlationId through to logs', async () => {
      const innerStorage = new LocalFSProvider({
        directory: testDir,
        baseUrl: '/uploads',
      });
      const storage = new ObservableStorageService(innerStorage, mockLogger);

      await mkdir(testDir, { recursive: true });
      await storage.upload(Buffer.from('test'), {
        access: 'public',
        contentType: 'text/plain',
        correlationId: 'req-123',
      });
      await rm(testDir, { recursive: true, force: true });

      expect(infoLogs[0].data.correlationId).toBe('req-123');
    });
  });

  describe('delete', () => {
    it('logs successful deletes with duration', async () => {
      const innerStorage = new LocalFSProvider({
        directory: testDir,
        baseUrl: '/uploads',
      });
      const storage = new ObservableStorageService(innerStorage, mockLogger);

      await mkdir(testDir, { recursive: true });
      const result = await innerStorage.upload(Buffer.from('test'), {
        access: 'public',
        contentType: 'text/plain',
      });

      // Delete through observable wrapper
      await storage.delete(result.id);
      await rm(testDir, { recursive: true, force: true });

      expect(debugLogs[0].event).toBe('storage.delete.start');
      expect(infoLogs[0].event).toBe('storage.delete.success');
      expect(infoLogs[0].data.blobId).toBe(result.id);
      expect(infoLogs[0].data.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('logs delete errors', async () => {
      const failingStorage: StorageService = {
        provider: 'mock',
        upload: () => Promise.reject(new Error('not implemented')),
        getUrl: () => '',
        delete: () => Promise.reject(new Error('404 - Not found')),
      };
      const storage = new ObservableStorageService(failingStorage, mockLogger);

      await expect(storage.delete('test-id')).rejects.toThrow(StorageError);

      expect(errorLogs[0].event).toBe('storage.delete.error');
      expect(errorLogs[0].data.error?.code).toBe('NOT_FOUND');
    });
  });

  describe('getUrl', () => {
    it('logs at debug level', async () => {
      const innerStorage = new LocalFSProvider({
        directory: testDir,
        baseUrl: '/uploads',
      });
      const storage = new ObservableStorageService(innerStorage, mockLogger);

      storage.getUrl('local:test.txt');

      expect(debugLogs).toHaveLength(1);
      expect(debugLogs[0].event).toBe('storage.getUrl');
      expect(debugLogs[0].data.blobId).toBe('local:test.txt');
    });
  });

  describe('error categorization', () => {
    it('categorizes credential errors', async () => {
      const failingStorage: StorageService = {
        provider: 'mock',
        upload: () => Promise.reject(new Error('401 Unauthorized')),
        getUrl: () => '',
        delete: () => Promise.resolve(),
      };
      const storage = new ObservableStorageService(failingStorage, mockLogger);

      await expect(
        storage.upload(Buffer.from('test'), { access: 'public' })
      ).rejects.toThrow(StorageError);

      expect(errorLogs[0].data.error?.code).toBe('INVALID_CREDENTIALS');
      expect(errorLogs[0].data.error?.retryable).toBe(false);
    });

    it('categorizes quota errors', async () => {
      const failingStorage: StorageService = {
        provider: 'mock',
        upload: () => Promise.reject(new Error('413 Payload Too Large')),
        getUrl: () => '',
        delete: () => Promise.resolve(),
      };
      const storage = new ObservableStorageService(failingStorage, mockLogger);

      await expect(
        storage.upload(Buffer.from('test'), { access: 'public' })
      ).rejects.toThrow(StorageError);

      expect(errorLogs[0].data.error?.code).toBe('QUOTA_EXCEEDED');
    });

    it('categorizes unknown errors', async () => {
      const failingStorage: StorageService = {
        provider: 'mock',
        upload: () => Promise.reject(new Error('Something weird happened')),
        getUrl: () => '',
        delete: () => Promise.resolve(),
      };
      const storage = new ObservableStorageService(failingStorage, mockLogger);

      await expect(
        storage.upload(Buffer.from('test'), { access: 'public' })
      ).rejects.toThrow(StorageError);

      expect(errorLogs[0].data.error?.code).toBe('UNKNOWN');
    });
  });
});

describe('StorageError', () => {
  it('has correct properties', () => {
    const cause = new Error('original error');
    const error = new StorageError(
      'Network failed',
      'NETWORK_ERROR',
      'vercel',
      cause
    );

    expect(error.name).toBe('StorageError');
    expect(error.message).toBe('Network failed');
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.provider).toBe('vercel');
    expect(error.cause).toBe(cause);
    expect(error.retryable).toBe(true);
  });

  it('sets retryable=false for non-network errors', () => {
    const error = new StorageError('Auth failed', 'INVALID_CREDENTIALS', 'vercel');
    expect(error.retryable).toBe(false);
  });
});

describe('createStorageService with logger', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.STORAGE_PROVIDER;
    delete process.env.BLOB_READ_WRITE_TOKEN;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('wraps storage with observability when logger provided', async () => {
    const logs: string[] = [];
    const logger: StorageLogger = {
      info: (event) => logs.push(event),
      error: (event) => logs.push(event),
      debug: (event) => logs.push(event),
    };

    const storage = createStorageService({
      provider: 'local',
      localDir: testDir,
      localBaseUrl: '/uploads',
      logger,
    });

    await mkdir(testDir, { recursive: true });
    await storage.upload(Buffer.from('test'), {
      access: 'public',
      contentType: 'text/plain',
    });
    await rm(testDir, { recursive: true, force: true });

    expect(logs).toContain('storage.upload.start');
    expect(logs).toContain('storage.upload.success');
  });

  it('returns unwrapped storage when no logger', () => {
    const storage = createStorageService({ provider: 'local' });
    // Without logger, should still work but be the raw LocalFSProvider
    expect(storage.provider).toBe('local');
  });
});
