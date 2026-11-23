"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ambilDetailAlat } from "./actions";
import type { AlatItem } from "@/lib/peminjaman";

export default function DetailAlatClient({ id }: { id: string }) {
  const [alat, setAlat] = useState<AlatItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let aktif = true;
    ambilDetailAlat(id).then((res) => {
      if (!aktif) return;
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.notFound || !res.alat) {
        setNotFound(true);
      } else {
        setAlat(res.alat);
      }
      setLoading(false);
    });
    return () => {
      aktif = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
        Memuat detail alat...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {errorMsg}
      </div>
    );
  }

  if (notFound || !alat) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900">
          Alat tidak ditemukan
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Alat yang kamu cari tidak tersedia atau sudah dinonaktifkan.
        </p>
        <div className="mt-4">
          <Link
            href="/alat"
            className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Kembali ke Daftar Alat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
          Kategori: {alat.kategori}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            alat.stok_tersedia > 0
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          Tersedia: {alat.stok_tersedia} / {alat.stok} unit
        </span>
      </div>

      <h2 className="mt-4 text-2xl font-bold text-slate-900">{alat.nama}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {alat.keterangan || "Tidak ada keterangan tambahan untuk alat ini."}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
        <Link
          href={`/ajukan?alatId=${alat.id}`}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Ajukan Peminjaman Alat Ini
        </Link>
        <Link
          href="/alat"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Lihat Alat Lain
        </Link>
      </div>
    </div>
  );
}
