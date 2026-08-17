export default function Loading() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded-md w-64 mb-3"></div>
        <div className="h-4 bg-gray-100 rounded-md w-96"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl p-5 bg-white flex flex-col justify-between h-44"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="h-3 bg-gray-100 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}