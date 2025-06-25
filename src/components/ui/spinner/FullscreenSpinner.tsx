import { Spinner } from "@/components/ui/spinner/Spinner";

const FullscreenSpinner = () => (
  <div className="fixed inset-0 z-[100000] bg-black/40 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-lg shadow-lg border dark:border-gray-700">
      <Spinner />
    </div>
  </div>
);

export default FullscreenSpinner;
