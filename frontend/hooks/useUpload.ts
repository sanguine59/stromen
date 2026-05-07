'use client';

import { useCallback, useState } from 'react';
import { api, uploadToPresigned } from '@/lib/api';
import type { UpdateMetadataDto } from '@/types/api';

export type WizardStep =
  | 'PICK'
  | 'INIT'
  | 'PUT'
  | 'METADATA'
  | 'COMPLETE'
  | 'POLLING'
  | 'DONE'
  | 'ERROR';

export interface UploadState {
  step: WizardStep;
  file: File | null;
  uploadId: string | null;
  metadataId: string | null;
  putProgress: number;
  error: string | null;
}

const initial: UploadState = {
  step: 'PICK',
  file: null,
  uploadId: null,
  metadataId: null,
  putProgress: 0,
  error: null,
};

export const useUpload = () => {
  const [state, setState] = useState<UploadState>(initial);

  const reset = useCallback(() => setState(initial), []);

  const pickFile = useCallback((file: File) => {
    setState((s) => ({ ...s, file, step: 'INIT', error: null }));
  }, []);

  const startUpload = useCallback(async () => {
    setState((s) => {
      if (!s.file) return s;
      return s;
    });
    let current: UploadState | null = null;
    setState((s) => {
      current = s;
      return s;
    });
    if (!current || !(current as UploadState).file) return;
    const file = (current as UploadState).file as File;

    try {
      const init = await api.uploads.init({
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
      });

      setState((s) => ({ ...s, uploadId: init.uploadId, step: 'PUT' }));

      await uploadToPresigned(init.presignedUrl, file, (pct) =>
        setState((s) => ({ ...s, putProgress: pct })),
      );
      
      let metadataId: string | null = null;
      for (let i = 0; i < 8; i++) {
        try {
          const meta = await api.metadata.getByUpload(init.uploadId);
          metadataId = meta.id;
          break;
        } catch {
          await new Promise((r) => setTimeout(r, 750));
        }
      }

      setState((s) => ({
        ...s,
        metadataId,
        step: 'METADATA',
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        step: 'ERROR',
        error: err instanceof Error ? err.message : 'Upload failed',
      }));
    }
  }, []);

  const submitMetadata = useCallback(
    async (dto: UpdateMetadataDto) => {
      setState((s) => {
        if (!s.metadataId || !s.uploadId) {
          return { ...s, step: 'ERROR', error: 'Missing upload context' };
        }
        return s;
      });

      let current: UploadState | null = null;
      setState((s) => {
        current = s;
        return s;
      });
      if (!current) return;
      const cur = current as UploadState;
      if (!cur.metadataId || !cur.uploadId) return;

      try {
        await api.metadata.update(cur.metadataId, dto);
        setState((s) => ({ ...s, step: 'COMPLETE' }));
        await api.uploads.complete(cur.uploadId);
        setState((s) => ({ ...s, step: 'POLLING' }));
      } catch (err) {
        setState((s) => ({
          ...s,
          step: 'ERROR',
          error: err instanceof Error ? err.message : 'Submit failed',
        }));
      }
    },
    [],
  );

  const finalize = useCallback((kind: 'DONE' | 'ERROR', message?: string) => {
    setState((s) => ({ ...s, step: kind, error: message ?? null }));
  }, []);

  return { state, pickFile, startUpload, submitMetadata, finalize, reset };
};
