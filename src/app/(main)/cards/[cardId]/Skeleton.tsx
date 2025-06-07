import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <Skeleton className="h-10 w-64 rounded-md" />
        <Skeleton className="h-5 w-40 mt-2 rounded-md" />
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Skeleton className="h-10 w-full sm:w-64 rounded-md" />
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr>
              {["Name", "Purchase Date", "Status", "Action"].map((header) => (
                <th
                  key={header}
                  className="border-b border-gray-300 px-4 py-2 text-left text-sm font-semibold"
                >
                  <Skeleton className="h-5 w-20 bg-gray-200 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-24 bg-gray-200 rounded" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-20 bg-gray-200 rounded" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-16 bg-gray-200 rounded" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <Skeleton className="h-7 w-16 bg-gray-200 rounded" />
                    <Skeleton className="h-7 w-16 bg-gray-200 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
