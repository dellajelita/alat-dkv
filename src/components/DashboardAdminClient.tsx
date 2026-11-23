"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import {
  kembalikanPeminjaman,
  perbaruiAlat,
  setujuiPeminjaman,
  tambahAlat,
  tolakPeminjaman,
} from "@/app/admin/actions";
import {
  getLocalDateIso,
  type AdminActionState,
  type AdminAlatRow,
  type AdminPeminjamanRow,
  type KondisiKembali,
  type RekapMetrikAdmin,
  type StatusPeminjaman,
} from "@/lib/admin";

type Props = {
  metrik: RekapMetrikAdmin;
  daftarAlat: AdminAlatRow[];
  daftarPeminjaman: AdminPeminjamanRow[];
};

const initialActionState: AdminActionState = {};

const STATUS_FILTER: { value: "semua" | StatusPeminjaman; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "menunggu", label: "Menunggu" },
  { value: "dipinjam", label: "Dipinjam" },
  { value: "dikembalikan", label: "Dikembalikan" },
  { value: "ditolak", label: "Ditolak" },
];

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

function RowEditAlat({ alat }: { alat: AdminAlatRow }) {
  const [state, formAction, isPending] = useActionState(
    perbaruiAlat,
    initialActionState,
  );

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 sm:grid-cols-12 sm:items-center"
    >
      <input type="hidden" name="id" value={alat.id} />

      <div className="sm:col-span-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-900">{alat.nama}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              alat.aktif
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {alat.aktif ? "Aktif" : "Nonaktif"}
          </span>
        </div>
        <p className="text-xs text-slate-500 capitalize">
          {alat.kategori} • Dipinjam: {alat.sedang_dipinjam} • Tersedia:{" "}
          <span className="font-semibold text-slate-700">
            {alat.stok_tersedia}
          </span>
        </p>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-[11px] font-medium text-slate-600">
          Stok (0–50)
        </label>
        <input
          type="number"
          name="stok"
          min={0}
          max={50}
          defaultValue={alat.stok}
          required
          className="mt-0.5 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900"
        />
      </div>

      <div className="sm:col-span-3">
        <label className="block text-[11px] font-medium text-slate-600">
          Keterangan
        </label>
        <input
          type="text"
          name="keterangan"
          maxLength={160}
          defaultValue={alat.keterangan}
          placeholder="Catatan kondisi / kelengkapan"
          className="mt-0.5 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-[11px] font-medium text-slate-600">
          Status Alat
        </label>
        <select
          name="aktif"
          defaultValue={alat.aktif ? "true" : "false"}
          className="mt-0.5 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900"
        >
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>
      </div>

      <div className="flex flex-col items-stretch gap-1 sm:col-span-1 sm:items-end">
        <span className="hidden text-[11px] text-transparent sm:block">.</span>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {isPending ? "..." : "Simpan"}
        </button>
      </div>

      {state?.error ? (
        <p className="text-xs font-medium text-red-700 sm:col-span-12">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="text-xs font-medium text-emerald-700 sm:col-span-12">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}

function CardPeminjamanAdmin({ item }: { item: AdminPeminjamanRow }) {
  const [alasanTolak, setAlasanTolak] = useState("");
  const [kondisiKembali, setKondisiKembali] = useState<KondisiKembali>("baik");
  const [tglDikembalikan, setTglDikembalikan] = useState(() =>
    getLocalDateIso(),
  );
  const [feedback, setFeedback] = useState<AdminActionState>({});
  const [isPending, startTransition] = useTransition();

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
            Alat: <span className="text-indigo-700">{item.nama_alat}</span> •{" "}
            {item.jumlah} unit
          </p>
          <p className="mt-0.5 text-sm text-slate-600">
            Keperluan: {item.keperluan}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Pinjam: {item.tgl_pinjam} &rarr; Kembali: {item.tgl_kembali}
            {item.tgl_dikembalikan
              ? ` • Dikembalikan: ${item.tgl_dikembalikan}`
              : ""}
            {item.kondisi_kembali ? ` • Kondisi: ${item.kondisi_kembali}` : ""}
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
              placeholder="Alasan penolakan (wajib diisi jika menolak)..."
              required
              minLength={3}
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
  daftarAlat,
  daftarPeminjaman,
}: Props) {
  const [filterStatus, setFilterStatus] = useState<"semua" | StatusPeminjaman>(
    "semua",
  );
  const [tambahState, tambahAction, isAdding] = useActionState(
    tambahAlat,
    initialActionState,
  );

  const peminjamanTersaring = useMemo(() => {
    if (filterStatus === "semua") return daftarPeminjaman;
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

      {/* Bagian Kelola Alat */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Kelola Inventaris Alat
          </h2>
          <p className="text-sm text-slate-600">
            Tambah alat baru atau perbarui stok, keterangan, dan status
            aktif/nonaktif.
          </p>
        </div>

        {/* Form Tambah Alat */}
        <form
          action={tambahAction}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h3 className="text-sm font-bold text-slate-900">Tambah Alat Baru</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-slate-700">
                Nama Alat
              </label>
              <input
                type="text"
                name="nama"
                required
                minLength={3}
                maxLength={40}
                placeholder="Contoh: Ring Light 18 Inch"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-700">
                Kategori
              </label>
              <select
                name="kategori"
                defaultValue="kamera"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900"
              >
                <option value="kamera">Kamera</option>
                <option value="pencahayaan">Pencahayaan</option>
                <option value="audio">Audio</option>
                <option value="tablet">Tablet</option>
                <option value="aksesori">Aksesori</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700">
                Stok Awal
              </label>
              <input
                type="number"
                name="stok"
                min={0}
                max={50}
                defaultValue={1}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-700">
                Keterangan
              </label>
              <input
                type="text"
                name="keterangan"
                maxLength={160}
                placeholder="Kelengkapan / catatan"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900"
              />
            </div>
          </div>

          {tambahState?.error ? (
            <p className="mt-2.5 text-xs font-medium text-red-700">
              {tambahState.error}
            </p>
          ) : null}
          {tambahState?.success ? (
            <p className="mt-2.5 text-xs font-medium text-emerald-700">
              {tambahState.success}
            </p>
          ) : null}

          <div className="mt-3">
            <button
              type="submit"
              disabled={isAdding}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {isAdding ? "Menyimpan..." : "Tambah Alat"}
            </button>
          </div>
        </form>

        {/* Daftar Alat untuk Diedit */}
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {daftarAlat.map((alat) => (
            <RowEditAlat key={alat.id} alat={alat} />
          ))}
        </div>
      </section>
    </div>
  );
}
