import { Skeleton } from "@/components/ui/skeleton"; // ShadCN Skeleton

export default function CardSkeletonGrid() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl border-4 border-black/30 shadow-md space-y-4"
          >
            <Skeleton className="h-8 w-3/4" />
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-14" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-14" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
