import Navbar from "@/components/Navbar";
import { getUserFromCookie } from "@/lib/auth";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie();
  const name = user?.name || "User";
  return (
    <div className="max-w-7xl mx-auto">
      <Navbar name={name} />
      {children}
    </div>
  );
}
