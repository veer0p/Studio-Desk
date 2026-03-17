export interface ImmichAsset {
  id: string;
  originalFileName: string;
  fileSize: number;
  thumbhash: string;
  localDateTime: string;
  people: Array<{ id: string; name: string }>;
  exifInfo?: {
    width: number;
    height: number;
    dateTimeOriginal: string | null;
  };
}

export interface ImmichLibrary {
  id: string;
  name: string;
  type: 'UPLOAD' | 'EXTERNAL';
  assetCount: number;
}

export interface ImmichAlbum {
  id: string;
  albumName: string;
  assetCount: number;
}

export interface ImmichPerson {
  id: string;
  name: string;
  thumbnailPath: string;
  numberOfAssets: number;
}

export type JobStatus = 'active' | 'completed' | 'failed' | 'queued';

export interface ImmichJobStatus {
  queueName: string;
  jobCounts: {
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    waiting: number;
    paused: number;
  };
}

export class ImmichError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ImmichError';
    this.status = status;
  }
}
