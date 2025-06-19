
// Global type declarations for CDN libraries
declare global {
  interface Window {
    heic2any: (options: {
      blob: Blob;
      toType?: string; // e.g., "image/png"
      quality?: number; // 0 to 1
      multiple?: boolean; // if the heic blob contains multiple images
    }) => Promise<Blob | Blob[]>;

    JSZip: {
      new(): JSZipInstance;
      loadAsync(data: ArrayBuffer | Blob | Uint8Array | string, options?: JSZipLoadAsyncOptions): Promise<JSZipInstance>; // Adjusted for common usage
      support: {
        blob: boolean;
      };
    };
  }
}

// Interface for JSZip's loadAsync options (can be expanded)
interface JSZipLoadAsyncOptions {
  base64?: boolean;
  checkCRC32?: boolean;
  createFolders?: boolean;
  optimizedBinaryString?: boolean;
}

// Interface for a JSZip object (file or folder within the zip)
interface JSZipObject {
  name: string;
  dir: boolean;
  date: Date;
  comment: string | null;
  unsafeOriginalName: string; // Deprecated, use name
  async(type: "string" | "text" | "base64" | "binarystring" | "array" | "uint8array" | "arraybuffer" | "blob" | "nodebuffer", onUpdate?: (metadata: { percent: number, currentFile: string | null }) => void): Promise<any>;
  // nodeStream: (type: "nodestream", onUpdate?: (metadata: { percent: number, currentFile: string | null }) => void) => NodeJS.ReadableStream; // If using in Node.js context
}

// Interface for a JSZip instance
interface JSZipInstance {
  file(path: string): JSZipObject | null;
  file(path: RegExp): JSZipObject[];
  file<TData = any>(path: string, data: TData, options?: JSZipFileOptions): this;
  folder(name: string): JSZipInstance; // Creates a new folder
  folder(name: RegExp): JSZipObject[]; // Searches for folders
  forEach(callback: (relativePath: string, file: JSZipObject) => void): void;
  filter(predicate: (relativePath: string, file: JSZipObject) => boolean): JSZipObject[];
  remove(path: string): this;
  generateAsync(options?: JSZipGeneratorOptions, onUpdate?: (metadata: { percent: number, currentFile: string | null }) => void): Promise<Blob>; // Common output is Blob for browser
  loadAsync(data: ArrayBuffer | Blob | Uint8Array | string, options?: JSZipLoadAsyncOptions): Promise<this>;
}

// Options for adding a file to JSZip
interface JSZipFileOptions {
  base64?: boolean;
  binary?: boolean;
  date?: Date;
  compression?: "STORE" | "DEFLATE";
  compressionOptions?: null | { level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 };
  comment?: string;
  optimizedBinaryString?: boolean;
  createFolders?: boolean;
  unixPermissions?: number | string;
  dosPermissions?: number;
  dir?: boolean;
}

// Options for generating a ZIP file
interface JSZipGeneratorOptions {
  type?: "base64" | "binarystring" | "array" | "uint8array" | "arraybuffer" | "blob" | "nodebuffer";
  compression?: "STORE" | "DEFLATE";
  compressionOptions?: null | { level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 };
  comment?: string;
  mimeType?: string;
  platform?: "DOS" | "UNIX";
  encodeFileName?: (name: string) => Uint8Array;
  streamFiles?: boolean;
}


export type FileJobStatus = 'queued' | 'processing' | 'converted' | 'error' | 'skipped' | 'extracting_zip';

export interface FileJob {
  id: string;
  originalFile: File;
  status: FileJobStatus;
  message?: string;
  progress?: number; // Optional progress for large files/zips
  convertedBlob?: Blob;
  convertedFileName?: string;
}

export const ALLOWED_EXTENSIONS = ['heic', 'heif', 'webp', 'zip'];
export const IMAGE_EXTENSIONS = ['heic', 'heif', 'webp'];

// Ensure this file is treated as a module, even if only global types are defined.
// This is important for TypeScript's module system.
export {};
    