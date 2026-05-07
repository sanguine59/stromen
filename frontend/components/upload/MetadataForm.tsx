'use client';

import { useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import type { UpdateMetadataDto, Visibility } from '@/types/api';

interface Props {
  onSubmit: (dto: UpdateMetadataDto) => Promise<void> | void;
  pending?: boolean;
  defaultTitle?: string;
}

export const MetadataForm = ({ onSubmit, pending, defaultTitle }: Props) => {
  const [title, setTitle] = useState(defaultTitle ?? '');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('PUBLIC');

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({ title, description, visibility });
      }}
      className="space-y-4"
    >
      <label className="block">
        <span className="text-xs uppercase text-white/60">Title</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your video a title"
          className="mt-1 w-full bg-bg-base border border-white/10 rounded-btn px-3 py-2.5 focus:outline-none focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="text-xs uppercase text-white/60">Description</span>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's it about?"
          className="mt-1 w-full bg-bg-base border border-white/10 rounded-btn px-3 py-2.5 focus:outline-none focus:border-accent resize-none"
        />
      </label>
      <label className="block">
        <span className="text-xs uppercase text-white/60">Visibility</span>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Visibility)}
          className="mt-1 w-full bg-bg-base border border-white/10 rounded-btn px-3 py-2.5 focus:outline-none focus:border-accent"
        >
          <option value="PUBLIC">Public — visible in the feed</option>
          <option value="UNLISTED">Unlisted — only with the link</option>
          <option value="PRIVATE">Private — only you</option>
        </select>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-btn flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {pending ? <Spinner /> : 'Save & start processing'}
      </button>
    </form>
  );
};
