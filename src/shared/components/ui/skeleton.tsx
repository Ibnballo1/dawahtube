import { cn } from "@/shared/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
//
// Content placeholder shown during data loading. Prevents layout shift.
// Matches the exact dimensions of the content it replaces.
//
// Accessibility: wrapped in a container with aria-busy="true" and
// aria-label="Loading..." at the page/section level, not per skeleton.
// ─────────────────────────────────────────────────────────────────────────────

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text";
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "skeleton",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-[1em] rounded-sm",
        variant === "default" && "rounded-lg",
        className,
      )}
      {...props}
    />
  );
}

// ── Pre-built skeleton shapes for common content types ─────────────────────

function LectureCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton
        className="w-full aspect-video"
        variant="default"
        style={{ borderRadius: 0 }}
      />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" className="size-8 shrink-0" />
          <Skeleton variant="text" className="w-32" />
        </div>
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-3/4" />
        <div className="flex items-center justify-between mt-1">
          <Skeleton className="w-16 h-5 rounded-full" />
          <Skeleton className="w-12 h-4 rounded" />
        </div>
      </div>
    </div>
  );
}

function ArticleCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton
        className="w-full aspect-[16/7]"
        variant="default"
        style={{ borderRadius: 0 }}
      />
      <div className="p-5 flex flex-col gap-3">
        <Skeleton className="w-20 h-5 rounded-full" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-5/6" />
        <Skeleton variant="text" className="w-4/6" />
        <div className="flex items-center gap-2 mt-1">
          <Skeleton variant="circular" className="size-6" />
          <Skeleton variant="text" className="w-24" />
          <Skeleton variant="text" className="w-16 ml-auto" />
        </div>
      </div>
    </div>
  );
}

function ScholarCardSkeleton() {
  return (
    <div className="card p-6 flex flex-col items-center text-center gap-3">
      <Skeleton variant="circular" className="size-20" />
      <div className="w-full flex flex-col items-center gap-2">
        <Skeleton variant="text" className="w-36" />
        <Skeleton variant="text" className="w-24" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-16 h-5 rounded-full" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
    </div>
  );
}

function BookCardSkeleton() {
  return (
    <div className="card overflow-hidden flex">
      <Skeleton className="w-24 h-36 shrink-0" style={{ borderRadius: 0 }} />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Skeleton className="w-16 h-4 rounded-full" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-28 mt-auto" />
      </div>
    </div>
  );
}

function PageHeaderSkeleton() {
  return (
    <div
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label="Loading page"
    >
      <Skeleton className="w-24 h-4 rounded" />
      <Skeleton className="w-96 h-10 rounded-lg" />
      <Skeleton className="w-full max-w-2xl h-6 rounded" />
      <Skeleton className="w-3/4 max-w-xl h-6 rounded" />
    </div>
  );
}

export {
  Skeleton,
  LectureCardSkeleton,
  ArticleCardSkeleton,
  ScholarCardSkeleton,
  BookCardSkeleton,
  PageHeaderSkeleton,
};
