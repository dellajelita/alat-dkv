"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CekStatusClient from "./CekStatusClient";

function CekStatusWrapper() {
  const searchParams = useSearchParams();
  const nomor = (searchParams.get("nomor") ?? "").trim();
  const nama = (searchParams.get("nama") ?? "").trim();

  return <CekStatusClient key={`${nomor}-${nama}`} />;
}

export default function CekStatusPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              AlatDKV • Pelacakan Status
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Cek Status Peminjaman
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/alat"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Daftar Alat
            </Link>
            <Link
              href="/ajukan"
              className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + Ajukan Peminjaman
            </Link>
          </div>
        </div>
      </header>

      <Suspense
        fallback={
          <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Memuat halaman cek status...
            </div>
          </main>
        }
      >
        <CekStatusWrapper />
      </Suspense>
    </div>
  );
}
