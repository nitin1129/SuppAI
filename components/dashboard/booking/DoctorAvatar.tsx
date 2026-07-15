const palette = [
  { bg: "#0a4da2", fg: "#fff" },
  { bg: "#0a8f3c", fg: "#fff" },
  { bg: "#7b2d8e", fg: "#fff" },
  { bg: "#b3261e", fg: "#fff" },
  { bg: "#0bb5a6", fg: "#fff" },
];

function initials(name: string) {
  return name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export function DoctorAvatar({
  id,
  name,
  className = "h-12 w-12 text-[15px]",
}: {
  id: string;
  name: string;
  className?: string;
}) {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const c = palette[sum % palette.length];
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${className}`}
      style={{ background: c.bg, color: c.fg }}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}
