export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-6xl mx-auto py-12 px-4">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3 mx-auto mb-4 animate-pulse" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto animate-pulse" />
        </div>

        <div className="space-y-8">
          {/* COI Card Skeleton */}
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>

          {/* Maturity Card Skeleton */}
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>

          {/* Quick Wins Grid Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-6 bg-white dark:bg-gray-800">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* CTA Skeleton */}
          <div className="border rounded-lg p-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
            <div className="h-32 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
