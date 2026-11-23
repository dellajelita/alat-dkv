"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AlatItem, KategoriAlat } from "@/lib/peminjaman";

type Props = {
  daftarAlat: AlatItem[];
};

const KATEGORI_LIST: { value: "semua" | KategoriAlat; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "kamera", label: "Kamera" },
  { value: "pencahayaan", label: "Pencahayaan" },
  { value: "audio", label: "Audio" },
  { value: "tablet", label: "Tablet" },
  { value: "aksesori", label: "Aksesori" },
];

export default function KatalogPeminjamanClient({ daftarAlat }: Props) {
  const [kategoriDipilih, setKategoriDipilih] = useState<
    "semua" | KategoriAlat
  >("semua");
  const [kataKunci, setKataKunci] = useState("");

  const alatTersaring = useMemo(() => {
    const q = kataKunci.trim().toLowerCase();
    return daftarAlat.filter((item) => {
      const cocokKategori =
        kategoriDipilih === "semua" || item.kategori === kategoriDipilih;
      const cocokKata =
        !q ||
        item.nama.toLowerCase().includes(q) ||
        item.keterangan.toLowerCase().includes(q) ||
        item.kategori.toLowerCase().includes(q);
      return cocokKategori && cocokKata;
    });
  }, [daftarAlat, kategoriDipilih, kataKunci]);

  return (
    <section className="space-y-5">
      {/* Bar Pencarian & Filter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Katalog Alat</h2>
            <p className="text-sm text-slate-600">
              Pilih alat yang tersedia untuk mengajukan peminjaman.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {alatTersaring.length} alat
            </span>
            <Link
              href="/pinjam"
              className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              + Form Peminjaman
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="search"
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            placeholder="Cari alat..."
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 md:max-w-xs"
          />

          <div className="flex flex-wrap gap-1.5">
            {KATEGORI_LIST.map((kat) => {
              const aktif = kategoriDipilih === kat.value;
              return (
                <button
                  key={kat.value}
                  type="button"
                  onClick={() => setKategoriDipilih(kat.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    aktif
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {kat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Alat */}
      {alatTersaring.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            Alat tidak ditemukan.
          </p>
          <button
            type="button"
            onClick={() => {
              setKategoriDipilih("semua");
              setKataKunci("");
            }}
            className="mt-3 rounded-lg bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {alatTersaring.map((alat) => {
            const habis = alat.stok_tersedia <= 0;

            return (
              <article
                key={alat.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                      {alat.kategori}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        habis
                          ? "bg-red-50 text-red-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {habis
                        ? "Habis"
                        : `Tersedia ${alat.stok_tersedia}/${alat.stok}`}
                    </span>
                  </div>

                  <h3 className="mt-3.5 text-base font-bold text-slate-900">
                    {alat.nama}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {alat.keterangan || "Kelengkapan standar lab DKV."}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3.5">
                  {habis ? (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-400"
                    >
                      Stok Habis
                    </button>
                  ) : (
                    <Link
                      href={`/pinjam?alat=${alat.id}`}
                      className="block w-full rounded-xl bg-slate-900 px-3.5 py-2 text-center text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      Pinjam Alat
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
