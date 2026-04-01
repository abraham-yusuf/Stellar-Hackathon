import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/try", label: "Try It" },
  { href: "/docs", label: "Docs" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.24em] text-white uppercase">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-500/10 text-xl text-purple-300 shadow-glow">⭐</span>
          <span>
            Stellar<span className="text-purple-400">Search</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm text-gray-300">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-transparent px-4 py-2 transition hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
