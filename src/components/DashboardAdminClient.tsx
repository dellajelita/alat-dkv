"use client";

import { useMemo, useState, useTransition } from "react";
import {
  kembalikanPeminjaman,
  setujuiPeminjaman,
  tolakPeminjaman,
} from "@/app/admin/actions";
import {
  getLocalDateIso,
  type AdminActionState,
  type AdminPeminjamanRow,
  type KondisiKembali,
  type RekapMetrikAdmin,
  type StatusPeminjaman,
} from "@/lib/admin";

type Props = {
  metrik: RekapMetrikAdmin;
  daftarPeminjaman: AdminPeminjamanRow[];
};

type FilterAdminStatus = "semua" | StatusPeminjaman | "terlambat";

const STATUS_FILTER: { value: FilterAdminStatus; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "menunggu", label: "Menunggu" },
  { value: "dipinjam", label: "Dipinjam" },
  { value: "terlambat", label: "Terlambat" },
  { value: "dikembalikan", label: "Dikembalikan" },
  { value: "ditolak", label: "Ditolak" },
];

function formatTanggalId(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts.map(Number);
  if (!year || !month || !day) return isoDate;

  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function hitungSelisihHari(dariIso: string, sampaiIso: string): number | null {
  const dariParts = dariIso.split("-").map(Number);
  const sampaiParts = sampaiIso.split("-").map(Number);
  if (dariParts.length !== 3 || sampaiParts.length !== 3) return null;

  const dariUtc = Date.UTC(dariParts[0], dariParts[1] - 1, dariParts[2]);
  const sampaiUtc = Date.UTC(
    sampaiParts[0],
    sampaiParts[1] - 1,
    sampaiParts[2],
  );
  if (Number.isNaN(dariUtc) || Number.isNaN(sampaiUtc)) return null;

  return Math.round((sampaiUtc - dariUtc) / (1000 * 60 * 60 * 24));
}

function badgeStatusClass(status: StatusPeminjaman): string {
  switch (status) {
    case "menunggu":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "dipinjam":
      return "bg-blue-50 text-blue-800 border-blue-200";
    case "dikembalikan":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "ditolak":
      return "bg-red-50 text-red-800 border-red-200";
  }
}

function CardPeminjamanAdmin({ item }: { item: AdminPeminjamanRow }) {
  const [alasanTolak, setAlasanTolak] = useState("");
  const [kondisiKembali, setKondisiKembali] = useState<KondisiKembali>("baik");
  const [tglDikembalikan, setTglDikembalikan] = useState(() =>
    getLocalDateIso(),
  );
  const [feedback, setFeedback] = useState<AdminActionState>({});
  const [isPending, startTransition] = useTransition();

  const hariTerlambat = useMemo(() => {
    if (item.tgl_dikembalikan) {
      const selisih = hitungSelisihHari(
        item.tgl_kembali,
        item.tgl_dikembalikan,
      );
      return selisih !== null && selisih > 0 ? selisih : 0;
    }
    if (item.terlambat) {
      const selisih = hitungSelisihHari(item.tgl_kembali, getLocalDateIso());
      return selisih !== null && selisih > 0 ? selisih : 0;
    }
    return 0;
  }, [item.tgl_dikembalikan, item.tgl_kembali, item.terlambat]);

  function handleSetujui() {
    setFeedback({});
    startTransition(async () => {
      const res = await setujuiPeminjaman(item.id);
      setFeedback(res);
    });
  }

  function handleTolak(e: React.FormEvent) {
    e.preventDefault();
    setFeedback({});
    startTransition(async () => {
      const res = await tolakPeminjaman(item.id, alasanTolak);
      setFeedback(res);
      if (res.success) {
        setAlasanTolak("");
      }
    });
  }

  function handleKembalikan(e: React.FormEvent) {
    e.preventDefault();
    setFeedback({});
    startTransition(async () => {
      const res = await kembalikanPeminjaman(
        item.id,
        kondisiKembali,
        tglDikembalikan,
      );
      setFeedback(res);
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
              #{item.id}
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {item.peminjam}
            </h3>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {item.kelas}
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${badgeStatusClass(
                item.status,
              )}`}
            >
              {item.status}
            </span>
            {item.terlambat ? (
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                Terlambat
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm font-medium text-slate-800">
            Alat: <span className="text-indigo-700">{item.nama_alat}</span>{" "}
            &bull; {item.jumlah} unit
          </p>
          <p className="mt-0.5 text-sm text-slate-600">
            Keperluan: {item.keperluan}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Pinjam: {formatTanggalId(item.tgl_pinjam)} &rarr; Kembali:{" "}
            {formatTanggalId(item.tgl_kembali)}
            {item.tgl_dikembalikan
              ? ` • Dikembalikan: ${formatTanggalId(item.tgl_dikembalikan)}`
              : ""}
            {item.kondisi_kembali ? ` • Kondisi: ${item.kondisi_kembali}` : ""}
            {hariTerlambat > 0 ? (
              <span className="ml-1.5 font-semibold text-red-600">
                &bull; Terlambat {hariTerlambat} hari
              </span>
            ) : null}
          </p>
          {item.alasan_tolak ? (
            <p className="mt-1 text-xs font-medium text-red-700">
              Alasan ditolak: {item.alasan_tolak}
            </p>
          ) : null}
        </div>
      </div>

      {/* Aksi berdasarkan status */}
      {item.status === "menunggu" ? (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={handleSetujui}
              className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {isPending ? "Memproses..." : "Setujui Peminjaman"}
            </button>
          </div>

          <form
            onSubmit={handleTolak}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input
              type="text"
              value={alasanTolak}
              onChange={(e) => setAlasanTolak(e.target.value)}
              placeholder="Alasan penolakan (minimal 5 huruf)..."
              required
              minLength={5}
              maxLength={120}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              Tolak
            </button>
          </form>
        </div>
      ) : null}

      {item.status === "dipinjam" ? (
        <form
          onSubmit={handleKembalikan}
          className="mt-4 flex flex-col gap-2.5 border-t border-slate-100 pt-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-slate-600">
              Kondisi Kembali
            </label>
            <select
              value={kondisiKembali}
              onChange={(e) =>
                setKondisiKembali(e.target.value as KondisiKembali)
              }
              className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
            >
              <option value="baik">Baik</option>
              <option value="rusak ringan">Rusak Ringan</option>
              <option value="rusak berat">Rusak Berat</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-[11px] font-medium text-slate-600">
              Tanggal Dikembalikan
            </label>
            <input
              type="date"
              value={tglDikembalikan}
              onChange={(e) => setTglDikembalikan(e.target.value)}
              required
              className="mt-0.5 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {isPending ? "Menyimpan..." : "Tandai Dikembalikan"}
          </button>
        </form>
      ) : null}

      {feedback?.error ? (
        <p className="mt-2.5 text-xs font-medium text-red-700">
          {feedback.error}
        </p>
      ) : null}
      {feedback?.success ? (
        <p className="mt-2.5 text-xs font-medium text-emerald-700">
          {feedback.success}
        </p>
      ) : null}
    </div>
  );
}

export default function DashboardAdminClient({
  metrik,
  daftarPeminjaman,
}: Props) {
  const [filterStatus, setFilterStatus] = useState<FilterAdminStatus>("semua");

  const peminjamanTersaring = useMemo(() => {
    if (filterStatus === "semua") return daftarPeminjaman;
    if (filterStatus === "terlambat") {
      return daftarPeminjaman.filter((row) => row.terlambat);
    }
    return daftarPeminjaman.filter((row) => row.status === filterStatus);
  }, [daftarPeminjaman, filterStatus]);

  return (
    <div className="space-y-8">
      {/* Rekap Metrik */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Alat Aktif</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {metrik.totalAlatAktif}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <p className="text-xs font-medium text-amber-800">Menunggu</p>
          <p className="mt-1 text-2xl font-bold text-amber-900">
            {metrik.menunggu}
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-800">Sedang Dipinjam</p>
          <p className="mt-1 text-2xl font-bold text-blue-900">
            {metrik.dipinjam}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-sm">
          <p className="text-xs font-medium text-red-800">Terlambat</p>
          <p className="mt-1 text-2xl font-bold text-red-900">
            {metrik.terlambat}
          </p>
        </div>
      </section>

      {/* Bagian Peminjaman */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Daftar Permohonan &amp; Riwayat Peminjaman
            </h2>
            <p className="text-sm text-slate-600">
              Setujui, tolak, atau catat pengembalian alat siswa.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTER.map((tab) => {
              const aktif = filterStatus === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setFilterStatus(tab.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    aktif
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {peminjamanTersaring.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            Belum ada data peminjaman untuk filter ini.
          </div>
        ) : (
          <div className="space-y-3">
            {peminjamanTersaring.map((item) => (
              <CardPeminjamanAdmin key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
