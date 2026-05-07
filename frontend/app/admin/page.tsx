'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { formatViews } from '@/lib/format';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, hydrated, isAuthenticated } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?next=/admin');
    } else if (!isAdmin) {
      router.replace('/');
    }
  }, [hydrated, isAuthenticated, isAdmin, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-feed'],
    queryFn: () => api.metadata.feed(1, 100),
    enabled: hydrated && isAdmin,
  });

  const publishMut = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      api.metadata.publish(id, isPublished),
    onSuccess: () => {
      toast.push('success', 'Updated.');
      qc.invalidateQueries({ queryKey: ['admin-feed'] });
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (e: unknown) =>
      toast.push('error', e instanceof Error ? e.message : 'Update failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.metadata.delete(id),
    onSuccess: () => {
      toast.push('success', 'Deleted.');
      qc.invalidateQueries({ queryKey: ['admin-feed'] });
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (e: unknown) =>
      toast.push('error', e instanceof Error ? e.message : 'Delete failed'),
  });

  if (!hydrated || (!isAuthenticated || !isAdmin)) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-12 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">Admin</h1>
        <p className="text-white/60 text-sm mt-1">
          Publish or remove videos from the public feed.
        </p>
      </div>

      <div className="bg-bg-surface/60 border border-white/10 rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-elevated/40 text-white/70">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">State</th>
              <th className="text-left px-4 py-3 font-medium">Visibility</th>
              <th className="text-left px-4 py-3 font-medium">Published</th>
              <th className="text-left px-4 py-3 font-medium">Views</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <Spinner />
                </td>
              </tr>
            )}
            {!isLoading && (data?.items.length ?? 0) === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/50">
                  No videos.
                </td>
              </tr>
            )}
            {data?.items.map((it) => (
              <tr
                key={it.id}
                className="border-t border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{it.title}</div>
                  <div className="text-xs text-white/40">{it.uploadId}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge status={it.processingState} />
                </td>
                <td className="px-4 py-3">
                  <Badge status={it.visibility} />
                </td>
                <td className="px-4 py-3">
                  {it.isPublished ? (
                    <span className="text-emerald-400">Yes</span>
                  ) : (
                    <span className="text-white/50">No</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white/70 tabular-nums">
                  {formatViews(it.views)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        publishMut.mutate({
                          id: it.id,
                          isPublished: !it.isPublished,
                        })
                      }
                      disabled={publishMut.isPending}
                      className="px-3 py-1.5 rounded-btn bg-bg-elevated hover:bg-white/10 text-white inline-flex items-center gap-1.5 text-xs"
                    >
                      {it.isPublished ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Publish
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${it.title}"?`)) {
                          deleteMut.mutate(it.id);
                        }
                      }}
                      disabled={deleteMut.isPending}
                      className="px-3 py-1.5 rounded-btn bg-red-500/15 hover:bg-red-500/25 text-red-300 inline-flex items-center gap-1.5 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
