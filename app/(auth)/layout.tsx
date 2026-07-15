export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-white lg:grid lg:grid-cols-2">
      {children}
    </div>
  );
}
