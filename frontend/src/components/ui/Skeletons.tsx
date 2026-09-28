export function RecipeGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" aria-hidden="true">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-card rounded-2xl border border-line overflow-hidden animate-pulse">
          <div className="aspect-[4/3] bg-line/40"></div>
          <div className="p-5 space-y-3">
            <div className="h-3 bg-line/60 rounded w-1/3"></div>
            <div className="h-5 bg-line/50 rounded w-3/4"></div>
            <div className="h-3 bg-line/40 rounded w-1/2 mt-4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecipeDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse" aria-hidden="true">
      <div className="h-4 bg-line/50 rounded w-48 mb-6"></div>
      <div className="h-12 bg-line/50 rounded w-2/3 mb-6"></div>
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="aspect-[4/3] bg-line/40 rounded-3xl"></div>
        <div className="space-y-4">
          <div className="h-4 bg-line/40 rounded w-full"></div>
          <div className="h-4 bg-line/40 rounded w-5/6"></div>
          <div className="h-24 bg-line/30 rounded-2xl w-full mt-6"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
        <div className="h-80 bg-line/30 rounded-3xl"></div>
        <div className="h-80 bg-line/30 rounded-3xl"></div>
      </div>
    </div>
  );
}
