'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useUpload } from '@/hooks/useUpload';
import { useUploadStatus } from '@/hooks/useUploadStatus';
import { WizardStepper } from '@/components/upload/WizardStepper';
import { UploadZone } from '@/components/upload/UploadZone';
import { UploadProgress } from '@/components/upload/UploadProgress';
import { MetadataForm } from '@/components/upload/MetadataForm';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

const STEP_INDEX: Record<string, number> = {
  PICK: 1,
  INIT: 2,
  PUT: 2,
  METADATA: 3,
  COMPLETE: 4,
  POLLING: 4,
  DONE: 4,
  ERROR: 4,
};

export default function UploadPage() {
  const toast = useToast();
  const { state, pickFile, startUpload, submitMetadata, finalize, reset } =
    useUpload();
  const polling = state.step === 'POLLING' || state.step === 'COMPLETE';
  const { data: status } = useUploadStatus(state.uploadId, polling);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const s = status?.status?.toUpperCase();
    if (!polling) return;
    if (s === 'READY') {
      finalize('DONE');
      toast.push('success', 'Your video is ready to watch.');
    } else if (s === 'FAILED') {
      finalize('ERROR', 'Transcoding failed.');
      toast.push('error', 'Transcoding failed.');
    }
  }, [status?.status, polling, finalize, toast]);

  const active = STEP_INDEX[state.step] ?? 1;

  return (
    <div className="px-6 lg:px-12 py-12 max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight">Upload a video</h1>
        <p className="text-white/60 text-sm mt-1">
          Files are uploaded directly to MinIO and transcoded to HLS.
        </p>
      </div>

      <WizardStepper active={active} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-surface/60 border border-white/10 rounded-card p-6"
      >
        {state.step === 'PICK' && (
          <div className="space-y-4">
            <UploadZone onFile={pickFile} selectedFile={state.file} />
          </div>
        )}

        {state.step === 'INIT' && state.file && (
          <div className="space-y-4">
            <UploadZone onFile={pickFile} selectedFile={state.file} />
            <button
              onClick={startUpload}
              className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-btn"
            >
              Start upload
            </button>
          </div>
        )}

        {state.step === 'PUT' && (
          <div className="space-y-4">
            <UploadProgress pct={state.putProgress} />
            <div className="text-center text-sm text-white/60">
              Streaming directly to MinIO via presigned URL…
            </div>
          </div>
        )}

        {state.step === 'METADATA' && (
          <MetadataForm
            defaultTitle={state.file?.name?.replace(/\.[^/.]+$/, '') ?? ''}
            pending={submitting}
            onSubmit={async (dto) => {
              setSubmitting(true);
              try {
                await submitMetadata(dto);
              } finally {
                setSubmitting(false);
              }
            }}
          />
        )}

        {(state.step === 'COMPLETE' || state.step === 'POLLING') && (
          <div className="text-center py-10 space-y-4">
            <div className="flex justify-center">
              <Spinner className="w-8 h-8" />
            </div>
            <div className="text-white/80 font-medium">
              Transcoding to HLS…
            </div>
            <div className="text-white/50 text-sm">
              This usually takes about a minute.{' '}
              <Badge status={status?.status ?? 'PROCESSING'} />
            </div>
          </div>
        )}

        {state.step === 'DONE' && state.uploadId && (
          <div className="text-center py-10 space-y-4">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400" />
            <div className="text-xl font-semibold">Ready to stream</div>
            <Link
              href={`/watch/${state.uploadId}`}
              className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-2.5 rounded-btn"
            >
              Watch now
            </Link>
            <div className="pt-2">
              <button
                onClick={reset}
                className="text-sm text-white/60 hover:text-white"
              >
                Upload another
              </button>
            </div>
          </div>
        )}

        {state.step === 'ERROR' && (
          <div className="text-center py-10 space-y-4">
            <XCircle className="w-12 h-12 mx-auto text-red-400" />
            <div className="text-xl font-semibold">Something went wrong</div>
            <div className="text-white/70 text-sm">{state.error}</div>
            <button
              onClick={reset}
              className="bg-bg-elevated hover:bg-white/10 text-white px-5 py-2 rounded-btn"
            >
              Try again
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
