import { Suspense } from "react";
import Link from "next/link";
import NavbarAlatDkv from "@/components/NavbarAlatDkv";
import BerandaAlatClient from "@/components/BerandaAlatClient";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <NavbarAlatDkv />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pb-12 pt-14 text-center sm:px-6 sm:pt-16">
          <span className="inline-block rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700">
            Sistem Inventaris & Peminjaman Laboratorium DKV
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Pinjam alat praktik DKV dengan cepat dan tertata
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Kamera, pencahayaan, audio, tablet gambar, hingga aksesori produksi.
            Cek ketersediaan stok secara real-time, ajukan peminjaman, dan
            pantau status pengajuanmu di satu tempat.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/alat"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700"
            >
              Lihat semua alat
            </Link>
          </div>
        </section>

        <Suspense
          fallback={
            <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
                Memuat daftar alat laboratorium...
              </div>
            </section>
          }
        >
          <BerandaAlatClient />
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        AlatDKV • Sistem Peminjaman Peralatan Laboratorium Desain Komunikasi
        Visual
      </footer>
    </div>
  );
}
