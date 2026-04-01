import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/try", label: "Try It" },
  { href: "/docs", label: "Docs" },
];

export default function Nav() {
  return (
    <nav className="border-b border-gray-800 bg-gray-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold text-white">
          <span className="text-xl text-[#7B3FE4]">⭐</span>
          <span>StellarSearch</span>
        </Link>
        <div className="flex items-center gap-5 text-sm">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-gray-300 transition hover:text-[#7B3FE4]">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
