import { useCallback, useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  Copy,
  Globe,
  Images,
  Loader2,
  Upload,
  User,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { GlassCard } from '@/components/motion/GlassCard';
import { GalleryStatusBadge } from './components/GalleryStatusBadge';
import { useGallery, useUploadPhotos, useUploadJob, usePublishGallery, useGalleryClusters } from './hooks';
import { publishGallerySchema, type PublishGalleryInput } from '@/lib/validations/gallery.schema';
import { ROUTES } from '@/lib/constants/routes';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { FaceCluster } from './types';

// ─── Accepted types ───────────────────────────────────────────────────────────

const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/tiff,video/mp4,video/quicktime';
const MAX_FILES = 50;
const MAX_SIZE_MB = 52;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });
}

const inputCls = cn(
  'min-h-10 w-full rounded-input border border-border bg-bg/60 px-3 py-2 text-sm text-fg',
  'placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-accent/40',
);

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card border border-border/60 bg-card/60 px-4 py-3 text-center">
      <p className="text-xl font-semibold tabular-nums text-fg">{value}</p>
      <p className="mt-0.5 text-xs text-muted-fg">{label}</p>
    </div>
  );
}

// ─── Upload dropzone ──────────────────────────────────────────────────────────

function UploadDropzone({
  galleryId,
  onJobStarted,
}: {
  galleryId: string;
  onJobStarted: (jobId: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const upload = useUploadPhotos(galleryId);

  const handleFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid = arr.filter(
      (f) => ACCEPT.split(',').includes(f.type) && f.size <= MAX_SIZE_MB * 1024 * 1024,
    );
    const tooLarge = arr.length - valid.length;
    if (tooLarge > 0) toast.error(`${tooLarge} file(s) skipped — max ${MAX_SIZE_MB} MB each`);
    const capped = valid.slice(0, MAX_FILES);
    if (valid.length > MAX_FILES) toast.error(`Max ${MAX_FILES} files per upload — extra files skipped`);
    setSelectedFiles(capped);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setConverting(true);
    try {
      const payload = await Promise.all(
        selectedFiles.map(async (f) => ({
          name: f.name,
          mimeType: f.type,
          size: f.size,
          data: await toBase64(f),
        })),
      );
      const result = await upload.mutateAsync(payload);
      toast.success('Upload queued — processing in the background');
      setSelectedFiles([]);
      onJobStarted(result.job_id);
    } catch {
      toast.error('Upload failed — try again');
    } finally {
      setConverting(false);
    }
  };

  const isBusy = converting || upload.isPending;

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !isBusy && fileInputRef.current?.click()}
        className={cn(
          'cursor-pointer rounded-card border-2 border-dashed px-6 py-10 text-center transition-colors',
          dragging
            ? 'border-accent bg-accent/5'
            : 'border-border/50 bg-bg/30 hover:border-accent/40 hover:bg-accent/3',
          isBusy && 'cursor-not-allowed opacity-60',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="grid size-12 place-items-center rounded-full bg-accent/10">
            <Upload className="size-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-fg">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''} selected`
                : 'Drop photos or click to browse'}
            </p>
            <p className="mt-0.5 text-xs text-muted-fg">
              JPEG, PNG, HEIC, WebP, MP4 · max {MAX_SIZE_MB} MB each · up to {MAX_FILES} files
            </p>
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-fg">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} ready
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedFiles([])}
              className="min-h-9 rounded-input border border-border/70 px-4 text-sm text-muted-fg hover:bg-bg transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isBusy}
              className="flex min-h-9 items-center gap-2 rounded-input bg-accent px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isBusy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {converting ? 'Preparing…' : 'Uploading…'}
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Upload progress ──────────────────────────────────────────────────────────

function UploadProgress({ galleryId, jobId, onDone }: { galleryId: string; jobId: string; onDone: () => void }) {
  const { data: job } = useUploadJob(galleryId, jobId);

  useEffect(() => {
    if (job?.status === 'completed' || job?.status === 'failed') {
      const timer = setTimeout(onDone, 4000);
      return () => clearTimeout(timer);
    }
  }, [job?.status, onDone]);

  if (!job) return null;

  const isDone = job.status === 'completed';
  const isFailed = job.status === 'failed';

  return (
    <div
      className={cn(
        'rounded-card border px-4 py-3',
        isDone
          ? 'border-emerald-200/60 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-900/10'
          : isFailed
          ? 'border-red-200/60 bg-red-50/60 dark:border-red-900/40 dark:bg-red-900/10'
          : 'border-accent/30 bg-accent/5',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isDone ? (
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          ) : isFailed ? (
            <AlertCircle className="size-4 text-red-600 dark:text-red-400" />
          ) : (
            <Loader2 className="size-4 animate-spin text-accent" />
          )}
          <span className="text-sm font-medium">
            {isDone
              ? `Upload complete — ${job.processed_files} photo${job.processed_files !== 1 ? 's' : ''} added`
              : isFailed
              ? 'Upload failed'
              : `Processing… ${job.processed_files + job.failed_files}/${job.total_files} files`}
          </span>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted-fg">{job.progress_pct}%</span>
      </div>
      {!isDone && !isFailed && (
        <div className="mt-2 h-1 overflow-hidden rounded-pill bg-border">
          <div
            className="h-full rounded-pill bg-accent transition-all duration-500"
            style={{ width: `${job.progress_pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Face cluster tile ────────────────────────────────────────────────────────

function FaceClusterTile({ cluster }: { cluster: FaceCluster }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-card border border-border/50 bg-card/60 p-3 text-center">
      <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-bg">
        {cluster.thumbnail_url ? (
          <img src={cluster.thumbnail_url} alt={cluster.label ?? 'Person'} className="size-full object-cover" />
        ) : (
          <User className="size-5 text-muted-fg/40" />
        )}
      </div>
      <p className="max-w-[80px] truncate text-xs font-medium text-fg">
        {cluster.label ?? <span className="text-muted-fg/50">Unlabeled</span>}
      </p>
      <p className="text-[11px] tabular-nums text-muted-fg">{cluster.face_count} photo{cluster.face_count !== 1 ? 's' : ''}</p>
    </div>
  );
}

// ─── Publish dialog ───────────────────────────────────────────────────────────

function PublishDialog({
  galleryId,
  open,
  onOpenChange,
}: {
  galleryId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const publish = usePublishGallery(galleryId);
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<PublishGalleryInput>({
    resolver: zodResolver(publishGallerySchema),
    defaultValues: { allow_download: true, expires_at: undefined },
  });

  const onClose = () => { reset(); onOpenChange(false); };

  const onSubmit = async (data: PublishGalleryInput) => {
    try {
      const payload: PublishGalleryInput = { allow_download: data.allow_download };
      if (data.expires_at) payload.expires_at = new Date(data.expires_at).toISOString();
      await publish.mutateAsync(payload);
      toast.success('Gallery published — client link is live');
      onClose();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? 'Failed to publish gallery';
      toast.error(message);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-fg/20 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                className="fixed left-1/2 top-1/2 z-[60] w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <div className="overflow-hidden rounded-card border border-border/70 bg-card shadow-elevated">
                  <Dialog.Title className="sr-only">Publish gallery</Dialog.Title>
                  <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                    <h2 className="font-display text-base font-semibold text-fg">Publish gallery</h2>
                    <button type="button" onClick={onClose}
                      className="grid size-7 place-items-center rounded-input text-muted-fg hover:bg-bg hover:text-fg transition-colors">
                      <X className="size-4" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-5 px-6 py-5">
                      <p className="text-sm text-muted-fg">
                        Publishing creates a shareable link. The client can view and optionally download their photos.
                      </p>

                      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-card border border-border/60 bg-bg/40 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-fg">Allow download</p>
                          <p className="text-xs text-muted-fg">Clients can save photos to their device</p>
                        </div>
                        <input
                          type="checkbox"
                          {...register('allow_download')}
                          className="size-4 rounded accent-accent"
                        />
                      </label>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-fg/80">
                          Expiry date <span className="text-muted-fg/60 font-normal">(optional)</span>
                        </label>
                        <input
                          type="date"
                          {...register('expires_at')}
                          min={new Date().toISOString().split('T')[0]}
                          className={cn(inputCls, 'cursor-pointer')}
                        />
                        <p className="text-xs text-muted-fg/60">Leave blank for no expiry</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-bg/40 px-6 py-4">
                      <button type="button" onClick={onClose}
                        className="min-h-9 rounded-input border border-border/70 bg-card px-4 text-sm text-muted-fg transition-colors hover:bg-bg">
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex min-h-9 items-center gap-2 rounded-input bg-accent px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4" />}
                        {isSubmitting ? 'Publishing…' : 'Publish'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function GalleryDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: gallery, isLoading, isError } = useGallery(id);
  const { data: clusters } = useGalleryClusters(id);

  const handleCopy = useCallback((url: string) => {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div className="h-5 w-48 animate-pulse rounded bg-border/50" />
          <div className="h-8 w-64 animate-pulse rounded bg-border/40" />
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 animate-pulse rounded-card bg-border/30" />)}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (isError || !gallery) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="size-6 text-muted-fg" />
          <p className="text-sm text-muted-fg">Couldn't load gallery.</p>
          <button type="button" onClick={() => navigate(ROUTES.gallery)}
            className="text-sm text-accent hover:underline">
            Back to galleries
          </button>
        </div>
      </PageContainer>
    );
  }

  const isPublished = gallery.status === 'published';
  const shareUrl = gallery.qr_code_url ?? gallery.share_link_url;

  return (
    <PageContainer>
      {/* Breadcrumb + header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(ROUTES.gallery)}
          className="mb-3 flex items-center gap-1.5 text-sm text-muted-fg transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-3.5" />
          All galleries
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold text-fg">{gallery.name}</h1>
              <GalleryStatusBadge status={gallery.status} />
            </div>
            <p className="mt-1 text-sm text-muted-fg">
              {gallery.client_name}
              {gallery.booking_title ? ` · ${gallery.booking_title}` : ''}
              {gallery.event_date ? ` · ${formatDate(gallery.event_date)}` : ''}
            </p>
          </div>
          {!isPublished && (
            <button
              type="button"
              onClick={() => setPublishOpen(true)}
              className="flex min-h-9 items-center gap-2 rounded-input bg-accent px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Globe className="size-4" />
              Publish
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Photos" value={gallery.total_photos} />
        <StatTile label="Videos" value={gallery.total_videos} />
        <StatTile label="Storage" value={`${gallery.total_size_mb.toFixed(1)} MB`} />
        <StatTile label="Views" value={gallery.views_count} />
      </div>

      {/* Upload section */}
      <GlassCard className="mt-6 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Camera className="size-4 text-accent" />
          <h2 className="text-sm font-semibold text-fg">Upload photos</h2>
        </div>

        {activeJobId ? (
          <UploadProgress
            galleryId={id}
            jobId={activeJobId}
            onDone={() => setActiveJobId(null)}
          />
        ) : (
          <UploadDropzone galleryId={id} onJobStarted={setActiveJobId} />
        )}
      </GlassCard>

      {/* Face clusters */}
      {(clusters ?? gallery.face_clusters).length > 0 && (
        <GlassCard className="mt-4 p-5">
          <div className="mb-4 flex items-center gap-2">
            <User className="size-4 text-accent" />
            <h2 className="text-sm font-semibold text-fg">Face clusters</h2>
            <span className="ml-auto text-xs text-muted-fg">
              {(clusters ?? gallery.face_clusters).length} detected
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {(clusters ?? gallery.face_clusters).map((c) => (
              <FaceClusterTile key={c.id} cluster={c} />
            ))}
          </div>
        </GlassCard>
      )}

      {/* Share section (published only) */}
      {isPublished && (
        <GlassCard className="mt-4 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="size-4 text-accent" />
            <h2 className="text-sm font-semibold text-fg">Share link</h2>
            {gallery.expires_at && (
              <span className="ml-auto text-xs text-amber-600 dark:text-amber-400">
                Expires {formatDate(gallery.expires_at)}
              </span>
            )}
          </div>

          {shareUrl ? (
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 rounded-input border border-border/60 bg-bg/50 px-3 py-2">
                <p className="truncate font-mono text-sm text-fg/80">{shareUrl}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(shareUrl)}
                className={cn(
                  'flex min-h-9 shrink-0 items-center gap-2 rounded-input border px-4 text-sm transition-colors',
                  copied
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'border-border/70 bg-card text-muted-fg hover:bg-bg hover:text-fg',
                )}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-fg">Share link will appear here after publishing.</p>
          )}

          {gallery.published_at && (
            <p className="mt-2 text-xs text-muted-fg">
              Published {formatDateTime(gallery.published_at)} · {gallery.views_count} view{gallery.views_count !== 1 ? 's' : ''}
              {gallery.downloads_count > 0 ? ` · ${gallery.downloads_count} download${gallery.downloads_count !== 1 ? 's' : ''}` : ''}
            </p>
          )}
        </GlassCard>
      )}

      {/* Gallery info */}
      <GlassCard className="mt-4 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Images className="size-4 text-accent" />
          <h2 className="text-sm font-semibold text-fg">Details</h2>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">Slug</dt>
            <dd className="mt-0.5 truncate font-mono text-xs text-fg/70">{gallery.slug}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">Created</dt>
            <dd className="mt-0.5 text-xs text-fg/70">{formatDate(gallery.created_at)}</dd>
          </div>
          {gallery.processing_completed_at && (
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">Last upload</dt>
              <dd className="mt-0.5 text-xs text-fg/70">{formatDateTime(gallery.processing_completed_at)}</dd>
            </div>
          )}
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">Download</dt>
            <dd className="mt-0.5 text-xs text-fg/70">
              {gallery.is_download_enabled ? 'Enabled' : 'Disabled'}
            </dd>
          </div>
        </dl>
      </GlassCard>

      <PublishDialog galleryId={id} open={publishOpen} onOpenChange={setPublishOpen} />
    </PageContainer>
  );
}
