import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/try", label: "Try It" },
  { href: "/docs", label: "Docs" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white sm:text-sm sm:tracking-[0.24em]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-500/10 text-lg text-purple-300 shadow-glow sm:h-10 sm:w-10 sm:text-xl">⭐</span>
          <span>
            Stellar<span className="text-purple-400">Search</span>
          </span>
        </Link>
        <nav className="flex w-full items-center gap-2 overflow-x-auto pb-1 text-sm text-gray-300 sm:w-auto sm:pb-0">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full border border-transparent px-4 py-2 transition hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
