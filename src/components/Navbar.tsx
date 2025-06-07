"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export default function Navbar({ name }: { name?: string }) {
  const router = useRouter();

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
      } else {
        alert("Logout failed");
      }
    } catch {
      alert("Logout failed");
    }
  }

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-white  ">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="/placeholder-avatar.png" alt={name ?? "User"} />
          <AvatarFallback>{name ? name.charAt(0) : "U"}</AvatarFallback>
        </Avatar>
        <span className="text-lg font-semibold text-black">
          Welcome, {name ?? "User"}
        </span>
      </div>

      <Button
        variant="outline"
        onClick={handleLogout}
        className="border-black text-black hover:bg-black hover:text-white"
      >
        Logout
      </Button>
    </nav>
  );
}
