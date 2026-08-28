export function RecipeGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
          <div className="aspect-[4/3] bg-gray-200"></div>
          <div className="p-5">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecipeDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
      <div className="h-10 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-5 bg-gray-100 rounded w-48 mb-8"></div>
      <div className="w-full h-[400px] bg-gray-200 rounded-2xl mb-12"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
        </div>
        <div className="h-[300px] bg-gray-50 rounded-xl border border-gray-100"></div>
      </div>
    </div>
  );
}