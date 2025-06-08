"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { FieldErrors, Path, UseFormRegister } from "react-hook-form";

type PasswordInputProps<T extends { password: string }> = {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
};

export default function PasswordInput<T extends { password: string }>({
  register,
  errors,
}: PasswordInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          {...register("password" as Path<T>)}
          className="pr-10"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {errors.password?.message && (
        <p className="text-sm text-red-500">
          {String(errors.password.message)}
        </p>
      )}
    </div>
  );
}
