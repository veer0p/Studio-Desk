import { ImmichAsset, ImmichLibrary, ImmichAlbum, ImmichPerson, ImmichJobStatus, ImmichError } from './types';

const IMMICH_BASE_URL = process.env.IMMICH_BASE_URL;
const IMMICH_API_KEY = process.env.IMMICH_API_KEY;

/**
 * Base fetch wrapper for Immich API
 */
async function immichRequest(path: string, options: RequestInit = {}) {
  const url = `${IMMICH_BASE_URL}${path}`;
  const headers = {
    'x-api-key': IMMICH_API_KEY as string,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new ImmichError(errorData.message || 'Immich request failed', response.status);
  }

  return response.json();
}

/**
 * Core Immich API client
 */
export const immichClient = {
  async getAsset(assetId: string): Promise<ImmichAsset> {
    return immichRequest(`/api/assets/${assetId}`);
  },

  async uploadAsset(file: Buffer, filename: string, libraryId: string, mimeType: string): Promise<ImmichAsset> {
    const formData = new FormData();
    const blob = new Blob([file], { type: mimeType });
    formData.append('assetData', blob, filename);
    formData.append('libraryId', libraryId);

    // Immich POST /api/assets is multipart/form-data
    return immichRequest('/api/assets', {
      method: 'POST',
      body: formData,
    });
  },

  async deleteAssets(assetIds: string[]): Promise<void> {
    await immichRequest('/api/assets', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: assetIds }),
    });
  },

  async createLibrary(name: string): Promise<ImmichLibrary> {
    return immichRequest('/api/libraries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type: 'UPLOAD' }),
    });
  },

  async getLibraries(): Promise<ImmichLibrary[]> {
    return immichRequest('/api/libraries');
  },

  async createAlbum(name: string, assetIds: string[] = []): Promise<ImmichAlbum> {
    return immichRequest('/api/albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ albumName: name, assetIds }),
    });
  },

  async addAssetsToAlbum(albumId: string, assetIds: string[]): Promise<void> {
    await immichRequest(`/api/albums/${albumId}/assets`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: assetIds }),
    });
  },

  async getPersons(libraryId: string): Promise<ImmichPerson[]> {
    return immichRequest(`/api/people?libraryId=${libraryId}`);
  },

  async getPersonAssets(personId: string): Promise<ImmichAsset[]> {
    return immichRequest(`/api/people/${personId}/assets`);
  },

  async updatePerson(personId: string, name: string): Promise<void> {
    await immichRequest(`/api/people/${personId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  },

  async searchByFace(imageBuffer: Buffer): Promise<ImmichPerson[]> {
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    formData.append('visualSearchFile', blob, 'selfie.jpg');

    return immichRequest('/api/search/person', {
      method: 'POST',
      body: formData,
    });
  },

  async getJobStatus(): Promise<{ mlClassifier: ImmichJobStatus }> {
    const jobs: ImmichJobStatus[] = await immichRequest('/api/jobs');
    const mlClassifier = jobs.find(j => j.queueName === 'recognize-faces') || {
        queueName: 'recognize-faces',
        jobCounts: { active: 0, completed: 0, failed: 0, delayed: 0, waiting: 0, paused: 0 }
    };
    return { mlClassifier: mlClassifier as any };
  }
};
