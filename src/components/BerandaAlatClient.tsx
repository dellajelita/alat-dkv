"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ambilDaftarAlatAktif } from "@/app/alat/actions";
import type { AlatItem, KategoriAlat } from "@/lib/peminjaman";

type HasilDaftarAlat = {
  data: AlatItem[];
  error?: string;
};

const GAYA_KATEGORI: Record<
  KategoriAlat,
  { banner: string; badge: string; label: string }
> = {
  kamera: {
    banner: "from-blue-600 via-blue-500 to-sky-400",
    badge: "bg-blue-50 text-blue-700",
    label: "KAMERA",
  },
  pencahayaan: {
    banner: "from-amber-500 via-orange-500 to-yellow-400",
    badge: "bg-amber-50 text-amber-700",
    label: "PENCAHAYAAN",
  },
  audio: {
    banner: "from-emerald-600 via-teal-500 to-green-400",
    badge: "bg-emerald-50 text-emerald-700",
    label: "AUDIO",
  },
  tablet: {
    banner: "from-purple-600 via-fuchsia-500 to-pink-400",
    badge: "bg-purple-50 text-purple-700",
    label: "TABLET",
  },
  aksesori: {
    banner: "from-slate-700 via-slate-600 to-slate-500",
    badge: "bg-slate-100 text-slate-700",
    label: "AKSESORI",
  },
};

export default function BerandaAlatClient() {
  const [daftarAlat, setDaftarAlat] = useState<AlatItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let aktif = true;
    ambilDaftarAlatAktif().then((res: HasilDaftarAlat) => {
      if (!aktif) return;
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setDaftarAlat(res.data);
      }
      setLoading(false);
    });
    return () => {
      aktif = false;
    };
  }, []);

  const alatUnggulan = daftarAlat.slice(0, 6);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Alat tersedia di laboratorium
          </h2>
          <p className="text-sm text-slate-600">
            Pilih alat untuk melihat detail spesifikasi atau langsung ajukan
            peminjaman.
          </p>
        </div>

        <Link
          href="/alat"
          className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Lihat semua ({daftarAlat.length}) →
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="h-32 rounded-xl bg-slate-100" />
              <div className="mt-4 h-4 w-24 rounded bg-slate-100" />
              <div className="mt-2 h-5 w-44 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : errorMsg ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gagal memuat katalog alat: {errorMsg}
        </div>
      ) : alatUnggulan.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          Belum ada data alat aktif yang tersedia saat ini.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {alatUnggulan.map((alat) => {
            const gaya = GAYA_KATEGORI[alat.kategori] ?? GAYA_KATEGORI.aksesori;
            const tersedia = alat.stok_tersedia > 0;

            return (
              <div
                key={alat.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  <div
                    className={`relative flex h-36 flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br ${gaya.banner} p-4 text-white`}
                  >
                    <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full border border-white/25" />
                    <div className="pointer-events-none absolute bottom-2 right-8 h-16 w-16 rounded-full border border-white/20" />

                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-90">
                      {gaya.label}
                    </span>
                    <p className="line-clamp-2 text-base font-bold leading-snug drop-shadow-xs">
                      {alat.nama}
                    </p>
                  </div>

                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ${gaya.badge}`}
                    >
                      {alat.kategori}
                    </span>
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                        tersedia
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {tersedia ? "Tersedia" : "Sedang dipinjam semua"}
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-base font-bold text-slate-900">
                    {alat.nama}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                    {alat.keterangan ||
                      "Peralatan praktikum Desain Komunikasi Visual."}
                  </p>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-800">
                    Total Inventaris: {alat.stok} unit
                  </p>
                  <p
                    className={`mt-0.5 text-xs font-semibold ${tersedia ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {" "}
                    {tersedia
                      ? `Sisa ${alat.stok_tersedia} unit siap dipinjam`
                      : "Stok kosong sementara"}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/alat/${alat.id}`}
                      className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      {" "}
                      Lihat detail{" "}
                    </Link>{" "}
                    <Link
                      href={`/ajukan?alatId=${alat.id}`}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Ajukan pinjam
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
