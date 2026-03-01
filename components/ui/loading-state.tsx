'use client';

/**
 * Skeleton loading components for the dashboard.
 * Renders pulsing gray placeholder shapes while data loads.
 */

export function MetricCardSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 animate-pulse">
            <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-12" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-32 mt-2" />
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-48 mb-4" />
            <div className="h-[300px] bg-gray-100 rounded flex items-end justify-around px-4 pb-4 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-200 rounded-t w-full"

                        style={{ height: `${30 + (i * 10) % 60}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white animate-pulse">
            <div className="p-4 border-b border-gray-200">
                <div className="h-5 bg-gray-200 rounded w-36" />
            </div>
            <div className="divide-y divide-gray-200">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="p-4 flex gap-4">
                        <div className="h-4 bg-gray-200 rounded flex-1" />
                        <div className="h-4 bg-gray-200 rounded w-20" />
                        <div className="h-4 bg-gray-200 rounded w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
            </div>
            <ChartSkeleton />
        </div>
    );
}
