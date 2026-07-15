"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthField } from "@/components/auth/AuthField";
import { BrandSide } from "@/components/auth/BrandSide";
import { RotatingTagline } from "@/components/auth/RotatingTagline";
import { healthTaglines } from "@/lib/health-taglines";

export default function SignUpPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/onboarding");
  }

  return (
    <>
      <BrandSide
        headline="Begin your wellness journey."
        subline="Create an account to unlock personalized health insights."
        features={[
          "AI-powered report analysis",
          "Personalized supplement plans",
          "Weekly meal recommendations",
        ]}
      />

      <div className="flex h-screen flex-col overflow-hidden px-10 py-10 sm:px-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="m-auto flex w-full max-w-[420px] flex-col"
        >
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#006E42]">
              Get started
            </p>
            <h2 className="mt-2 text-[42px] font-semibold leading-[1.05] tracking-tight text-[#0f3a26]">
              Create account.
            </h2>
            <p className="mt-3 text-[15px] font-light text-[#0f3a26]/55">
              Let&apos;s start making your health better.
            </p>
            <RotatingTagline pool={healthTaglines} />
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
            <AuthField
              id="name"
              label="Full name"
              placeholder="Jane Doe"
              autoComplete="name"
            />
            <AuthField
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
            <AuthField
              id="password"
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />

            <button
              type="submit"
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#006E42] px-5 py-3.5 text-[15px] font-medium text-white transition hover:bg-[#005634]"
            >
              Create account
            </button>
          </form>

          <p className="mt-8 text-center text-[14px] font-light text-[#0f3a26]/60">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-[#006E42] underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}
