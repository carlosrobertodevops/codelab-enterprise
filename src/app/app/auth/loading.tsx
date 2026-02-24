// import LoadingSkeleton from './components/ui/skeleton.tsx';

// export default function Loading() {
//   // You can add any UI inside Loading, including a Skeleton.
//   return <LoadingSkeleton />;
// }

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
}
