"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cekStatusPeminjaman, type HasilCekPeminjaman } from "./actions";

export default function CekStatusClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nomorParam = (searchParams.get("nomor") ?? "").trim();
  const namaParam = (searchParams.get("nama") ?? "").trim();

  const [nomor, setNomor] = useState<string>(nomorParam);
  const [nama, setNama] = useState<string>(namaParam);
  const [hasil, setHasil] = useState<HasilCekPeminjaman | null>(null);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!nomorParam && !namaParam) {
      return;
    }

    let aktif = true;
    cekStatusPeminjaman(nomorParam, namaParam).then((res) => {
      if (!aktif) return;
      if (res.error) {
        setHasil(null);
        setPesanGalat(res.error);
      } else {
        setPesanGalat(null);
        setHasil(res.data);
      }
    });

    return () => {
      aktif = false;
    };
  }, [nomorParam, namaParam]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (nomor.trim()) q.set("nomor", nomor.trim());
    if (nama.trim()) q.set("nama", nama.trim());

    startTransition(() => {
      const queryStr = q.toString();
      router.push(queryStr ? `/cek?${queryStr}` : "/cek");
    });
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
      >
        <p className="mb-4 text-sm text-slate-600">
          Masukkan <strong>nomor peminjaman</strong> dan{" "}
          <strong>nama peminjam</strong> (keduanya harus cocok).
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="nomor"
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              Nomor Peminjaman
            </label>
            <input
              id="nomor"
              name="nomor"
              type="number"
              min={1}
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              placeholder="Contoh: 1"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="nama"
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              Nama Peminjam
            </label>
            <input
              id="nama"
              name="nama"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Raka Pratama"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {isPending ? "Mencari..." : "Cek Status"}
          </button>
        </div>
      </form>

      {pesanGalat && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {pesanGalat}
        </div>
      )}

      {hasil && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Nomor Peminjaman #{hasil.id}
              </p>
              <h2 className="text-lg font-bold text-slate-900">
                {hasil.nama_alat} ({hasil.jumlah} unit)
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">
                Status: {hasil.status}
              </span>
              {hasil.terlambat && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                  TERLAMBAT
                </span>
              )}
            </div>
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-700">Peminjam</dt>
              <dd className="text-slate-600">
                {hasil.peminjam} ({hasil.kelas})
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">
                Tanggal Pinjam – Kembali
              </dt>
              <dd className="text-slate-600">
                {hasil.tgl_pinjam} s.d. {hasil.tgl_kembali}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-slate-700">Keperluan</dt>
              <dd className="text-slate-600">{hasil.keperluan}</dd>
            </div>
            {hasil.status === "ditolak" && hasil.alasan_tolak && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900 sm:col-span-2">
                <dt className="font-semibold">Alasan Penolakan</dt>
                <dd className="mt-0.5">{hasil.alasan_tolak}</dd>
              </div>
            )}
            {hasil.status === "dikembalikan" && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900 sm:col-span-2">
                <dt className="font-semibold">Informasi Pengembalian</dt>
                <dd className="mt-0.5">
                  Kondisi: {hasil.kondisi_kembali ?? "-"} • Tanggal
                  Dikembalikan: {hasil.tgl_dikembalikan ?? "-"}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </main>
  );
}
