"use client";

import { motion } from "framer-motion";
import { useRandomPick } from "@/lib/hooks/useHydrated";

type Props = {
  pool: string[];
};

export function RotatingTagline({ pool }: Props) {
  const line = useRandomPick(pool);

  if (!line) return <div className="h-[34px]" aria-hidden />;

  return (
    <motion.div
      key={line}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="mt-4 flex items-center gap-2.5"
    >
      <span
        aria-hidden
        className="block h-3 w-[3px] rounded-full bg-[#006E42]"
      />
      <p className="text-[13px] italic leading-relaxed text-[#006E42]/80">
        {line}
      </p>
    </motion.div>
  );
}
