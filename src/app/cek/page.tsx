"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import CekStatusClient from "./CekStatusClient";

function CekStatusWrapper() {
  const searchParams = useSearchParams();
  const nomor = (searchParams.get("nomor") ?? "").trim();
  const nama = (searchParams.get("nama") ?? "").trim();

  return <CekStatusClient key={`${nomor}-${nama}`} />;
}

export default function CekStatusPage() {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="w-full border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              AlatDKV • Pelacakan Status
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Cek Status Peminjaman
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← Kembali
            </button>
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
          <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
