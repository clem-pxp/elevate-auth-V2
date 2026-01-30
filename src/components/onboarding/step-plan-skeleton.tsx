export function StepPlanSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <div>
        <div className="h-7 w-48 bg-strong/8 rounded-8" />
        <div className="mt-2 h-5 w-72 bg-strong/8 rounded-8" />
      </div>

      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-full rounded-16 border-[0.5px] border-border-base p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-10 bg-strong/8" />
                <div className="h-5 w-24 bg-strong/8 rounded-8" />
              </div>
              <div className="h-5 w-28 bg-strong/8 rounded-8" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="flex-1 h-10 bg-strong/8 rounded-14" />
        <div className="flex-1 h-10 bg-strong/8 rounded-14" />
      </div>
    </div>
  );
}
