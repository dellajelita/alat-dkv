"use client";

import { useActionState, useState, useTransition } from "react";
import { hapusAlat, perbaruiAlat, tambahAlat } from "@/app/admin/actions";
import type { AdminActionState, AdminAlatRow } from "@/lib/admin";
import type { KategoriAlat } from "@/lib/peminjaman";

const KATEGORI_OPTIONS: { value: KategoriAlat; label: string }[] = [
  { value: "kamera", label: "Kamera" },
  { value: "pencahayaan", label: "Pencahayaan" },
  { value: "audio", label: "Audio" },
  { value: "tablet", label: "Tablet" },
  { value: "aksesori", label: "Aksesori" },
];

const INITIAL_STATE: AdminActionState = {};

function BarisAlatAdmin({
  alat,
  onFeedback,
}: {
  alat: AdminAlatRow;
  onFeedback: (state: AdminActionState) => void;
}) {
  const [stok, setStok] = useState<number>(alat.stok);
  const [keterangan, setKeterangan] = useState<string>(alat.keterangan);
  const [aktif, setAktif] = useState<boolean>(alat.aktif);
  const [isPending, startTransition] = useTransition();

  function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("id", String(alat.id));
    formData.set("stok", String(stok));
    formData.set("keterangan", keterangan);
    formData.set("aktif", aktif ? "true" : "false");

    startTransition(async () => {
      const res = await perbaruiAlat({}, formData);
      onFeedback(res);
    });
  }

  function handleHapus() {
    startTransition(async () => {
      const res = await hapusAlat(alat.id);
      onFeedback(res);
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">{alat.nama}</h3>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-700">
              {alat.kategori}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                aktif
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {aktif ? "Aktif" : "Nonaktif"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            ID #{alat.id} • Sedang dipinjam:{" "}
            <strong>{alat.sedang_dipinjam}</strong> • Tersedia:{" "}
            <strong>{alat.stok_tersedia}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handleHapus}
          disabled={isPending}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
        >
          {isPending ? "Memproses..." : "Hapus"}
        </button>
      </div>

      <form
        onSubmit={handleSimpan}
        className="mt-3 grid gap-3 sm:grid-cols-12 sm:items-end"
      >
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Total Stok
          </label>
          <input
            type="number"
            min={0}
            max={50}
            value={stok}
            onChange={(e) => setStok(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900"
          />
        </div>

        <div className="sm:col-span-5">
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Keterangan
          </label>
          <input
            type="text"
            maxLength={160}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Status Alat
          </label>
          <select
            value={aktif ? "true" : "false"}
            onChange={(e) => setAktif(e.target.value === "true")}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900"
          >
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function KelolaAlatAdminClient({
  daftarAlat,
}: {
  daftarAlat: AdminAlatRow[];
}) {
  const [tambahState, formActionTambah, isAdding] = useActionState(
    tambahAlat,
    INITIAL_STATE,
  );
  const [aksiFeedback, setAksiFeedback] = useState<AdminActionState | null>(
    null,
  );

  return (
    <div className="space-y-8">
      {/* Form Tambah Alat Baru */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Tambah Alat Baru</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Nama alat 3–40 karakter, stok 0–50, keterangan maksimal 160 karakter.
        </p>

        <form
          action={formActionTambah}
          className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <label
              htmlFor="nama"
              className="mb-1 block text-xs font-semibold text-slate-700"
            >
              Nama Alat
            </label>
            <input
              id="nama"
              name="nama"
              type="text"
              required
              minLength={3}
              maxLength={40}
              placeholder="Contoh: Kamera Mirrorless Z50"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="kategori"
              className="mb-1 block text-xs font-semibold text-slate-700"
            >
              Kategori
            </label>
            <select
              id="kategori"
              name="kategori"
              defaultValue="kamera"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              {KATEGORI_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="stok"
              className="mb-1 block text-xs font-semibold text-slate-700"
            >
              Stok Awal
            </label>
            <input
              id="stok"
              name="stok"
              type="number"
              min={0}
              max={50}
              defaultValue={3}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="keterangan"
              className="mb-1 block text-xs font-semibold text-slate-700"
            >
              Keterangan
            </label>
            <input
              id="keterangan"
              name="keterangan"
              type="text"
              maxLength={160}
              placeholder="Perlengkapan / catatan kondisi"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={isAdding}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {isAdding ? "Menambahkan..." : "+ Tambah Alat"}
            </button>
          </div>
        </form>

        {tambahState?.error && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-medium text-red-700">
            {tambahState.error}
          </p>
        )}
        {tambahState?.success && (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-700">
            {tambahState.success}
          </p>
        )}
      </section>

      {/* Umpan Balik Ubah / Hapus */}
      {aksiFeedback?.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {aksiFeedback.error}
        </div>
      )}
      {aksiFeedback?.success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {aksiFeedback.success}
        </div>
      )}

      {/* Daftar Alat */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Daftar Alat Terdaftar ({daftarAlat.length})
        </h2>

        {daftarAlat.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Belum ada data alat.
          </div>
        ) : (
          <div className="space-y-3">
            {daftarAlat.map((alat) => (
              <BarisAlatAdmin
                key={alat.id}
                alat={alat}
                onFeedback={(res) => setAksiFeedback(res)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
