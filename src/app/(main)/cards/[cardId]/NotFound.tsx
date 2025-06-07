import { Ban } from "lucide-react";

export default function NotFound() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-screen rounded-2xl shadow-lg space-y-3 text-white">
      <Ban className="h-10 w-10 text-red-500" />
      <h2 className="text-xl font-semibold">Card Not Found</h2>
      <p className="text-sm text-gray-400 text-center max-w-sm">
        The card you’re looking for doesn’t exist or may have been removed.
      </p>
    </div>
  );
}
