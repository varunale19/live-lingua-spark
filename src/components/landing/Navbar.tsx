import { AudioLines } from "lucide-react";

const links = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Languages", href: "#languages" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-[1260px] items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <AudioLines size={20} />
          </span>
          <span className="text-[17px] font-bold tracking-tight">LinguaLive</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="#top"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Login
          </a>
          <a
            href="#top"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition-all hover:bg-primary-glow"
          >
            Get Started
          </a>
        </div>
      </nav>
    </header>
  );
}