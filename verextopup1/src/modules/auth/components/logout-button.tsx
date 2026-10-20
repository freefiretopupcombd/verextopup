"use client";

import { LogOut, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { logoutAction } from "../actions";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logoutAction();
      } catch (error: any) {
        // Next.js redirect throws NEXT_REDIRECT - ignore it
        if (error?.digest?.startsWith("NEXT_REDIRECT")) {
          // This is expected - redirect is happening
          router.push("/");
          router.refresh();
          return;
        }

        // Real error
        console.error("Logout error:", error);
        toast.error("Logout failed");
      }
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition text-sm text-content disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      {isPending ? "Logging out..." : "Logout"}
    </button>
  );
}