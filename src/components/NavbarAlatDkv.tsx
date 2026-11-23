"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU_UTAMA = [
  { href: "/", label: "Beranda" },
  { href: "/alat", label: "Daftar Alat" },
  { href: "/cek", label: "Cek Status" },
  { href: "/admin", label: "Admin" },
];

export default function NavbarAlatDkv() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-6">
          <Link
            href="/"
            className="text-lg font-extrabold tracking-tight text-blue-600"
          >
            AlatDKV
          </Link>

          <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {MENU_UTAMA.map((item) => {
              const aktif =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    aktif
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          href="/ajukan"
          className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700"
        >
          + Ajukan Peminjaman
        </Link>
      </div>
    </header>
  );
}
