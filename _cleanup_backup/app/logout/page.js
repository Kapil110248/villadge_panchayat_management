"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.clear();
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Signing you out...</h2>
        <p className="text-slate-500">Dhanyawad (Thank you) for using the portal.</p>
      </div>
    </div>
  );
}
