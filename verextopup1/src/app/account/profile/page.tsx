import type { Metadata } from "next";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/modules/users/admin/components/profile-form";

export const metadata: Metadata = {
  title: "Profile — VerexTopUp",
};

export default async function ProfilePage() {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      phone: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-content">
          প্রোফাইল
        </h1>
        <p className="text-content-muted mt-1">
          আপনার ব্যক্তিগত তথ্য update করুন
        </p>
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border p-6 max-w-2xl">
        <ProfileForm
          initialName={user?.name || ""}
          initialPhone={user?.phone || ""}
          email={user?.email || ""}
        />
      </div>
    </div>
  );
}