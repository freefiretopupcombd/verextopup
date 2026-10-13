import { WifiOff, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Offline — VerexTopUp",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-warning/10 text-warning flex items-center justify-center mx-auto mb-5">
          <WifiOff className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          আপনি Offline
        </h1>
        <p className="text-text-muted text-sm mb-6">
          Internet connection নেই। চেক করে আবার try করুন।
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-primary text-white px-6 py-3 rounded-lg font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          আবার চেষ্টা করুন
        </a>
      </div>
    </div>
  );
}