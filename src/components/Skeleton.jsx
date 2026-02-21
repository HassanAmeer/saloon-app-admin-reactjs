import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export const Skeleton = ({ className }) => (
    <div className={cn("animate-shimmer rounded-xl", className)} />
);

export const DashboardSkeleton = () => {
    return (
        <div className="space-y-10">
            {/* Header Skeleton */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Skeleton className="h-12 w-64 lg:w-96" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-2 p-1.5 glass-card bg-tea-100/30 border-tea-700/5 rounded-2xl w-fit">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-8 w-20 px-6 py-2" />
                    ))}
                </div>
            </div>

            {/* Metric Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="stat-card">
                        <div className="flex items-start justify-between mb-4">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <Skeleton className="w-16 h-5 rounded-full" />
                        </div>
                        <Skeleton className="h-9 w-24 mb-2" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 glass-card p-8 space-y-8">
                    <div className="flex justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <div className="flex gap-4">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                    <Skeleton className="h-[350px] w-full" />
                </div>
                <div className="space-y-8">
                    <div className="glass-card p-6 space-y-6">
                        <Skeleton className="h-4 w-40" />
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-12 w-48" />
            </div>

            <div className="table-container">
                <div className="p-6 border-b border-tea-700/10 flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-3">
                        <Skeleton className="h-10 w-64 rounded-xl" />
                        <Skeleton className="h-10 w-24 rounded-xl" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="table-header">
                                {[...Array(cols)].map((_, i) => (
                                    <th key={i} className="px-6 py-4">
                                        <Skeleton className="h-4 w-24" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(rows)].map((_, i) => (
                                <tr key={i} className="table-row">
                                    {[...Array(cols)].map((_, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <Skeleton className="h-4 w-full" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const ProfileSkeleton = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="card flex flex-col items-center space-y-6">
                        <Skeleton className="w-40 h-40 rounded-3xl" />
                        <div className="flex flex-col items-center gap-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="card space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ))}
                            <div className="space-y-2 col-span-full">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                            <div className="space-y-2 col-span-full">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-tea-100">
                            <div />
                            <Skeleton className="h-12 w-48" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
