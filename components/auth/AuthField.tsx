"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type Props = {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
};

export function AuthField({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
}: Props) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[12px] font-medium text-[#006E42]"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={effectiveType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-[#006E42]/15 bg-white px-4 py-3 text-[15px] text-[#0f3a26] placeholder:text-[#006E42]/30 transition focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#006E42]/50 transition hover:text-[#006E42]"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
