export default function SkeletonLoader() {
    return (
        <div className="space-y-8 p-2">
            {/* Header Skeleton */}
            <div className="animate-pulse space-y-3">
                <div className="h-8 w-64 bg-slate-200 rounded-md"></div>
                <div className="h-4 w-96 bg-slate-100 rounded-md"></div>
            </div>

            {/* Stat Cards Skeleton Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse border border-slate-50"></div>
                ))}
            </div>

            {/* Quick Actions Skeleton */}
            <div className="space-y-4">
                <div className="h-6 w-32 bg-slate-200 rounded-md animate-pulse"></div>
                <div className="flex gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 w-36 bg-slate-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="h-64 w-full bg-slate-100 rounded-2xl animate-pulse border border-slate-50 mt-8"></div>
        </div>
    );
}