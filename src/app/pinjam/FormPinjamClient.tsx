"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ajukanPeminjaman } from "@/app/actions";
import type { AlatItem, AjukanPeminjamanState } from "@/lib/peminjaman";

type Props = {
  daftarAlat: AlatItem[];
  initialAlatId?: string;
};

const initialState: AjukanPeminjamanState = {};

function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function FormPinjamClient({
  daftarAlat,
  initialAlatId,
}: Props) {
  const defaultId = useMemo(() => {
    if (initialAlatId) {
      const found = daftarAlat.find((a) => String(a.id) === initialAlatId);
      if (found) return String(found.id);
    }
    return daftarAlat[0] ? String(daftarAlat[0].id) : "";
  }, [daftarAlat, initialAlatId]);

  const [selectedAlatId, setSelectedAlatId] = useState<string>(defaultId);
  const formRef = useRef<HTMLFormElement | null>(null);
  const today = useMemo(() => getTodayIso(), []);

  const [state, formAction, isPending] = useActionState(
    ajukanPeminjaman,
    initialState
  );

  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
      setSelectedAlatId(defaultId);
    }
  }, [state?.success, defaultId]);

  const alatTerpilih = useMemo(() => {
    const idNum = Number(selectedAlatId);
    return daftarAlat.find((item) => item.id === idNum) ?? null;
  }, [daftarAlat, selectedAlatId]);

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4">
        <p className="text-sm text-slate-600">
          Isi data peminjaman di bawah ini. Permohonan akan berstatus{" "}
          <span className="font-semibold text-amber-700">menunggu</span>{" "}
          hingga disetujui admin laboratorium.
        </p>

        {alatTerpilih ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-xs">
            <div>
              <span className="text-slate-500">Alat dipilih: </span>
              <span className="font-bold text-slate-900">
                {alatTerpilih.nama}
              </span>
              <span className="ml-1.5 capitalize text-slate-500">
                ({alatTerpilih.kategori})
              </span>
            </div>
            <span className="font-semibold text-emerald-700">
              Tersedia: {alatTerpilih.stok_tersedia} unit
            </span>
          </div>
        ) : null}
      </div>

      <form ref={formRef} action={formAction} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label
              htmlFor="alat_id"
              className="block text-sm font-medium text-slate-700"
            >
              Pilih Alat
            </label>
            <select
              id="alat_id"
              name="alat_id"
              required
              value={selectedAlatId}
              onChange={(e) => setSelectedAlatId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {daftarAlat.length === 0 ? (
                <option value="">Tidak ada alat aktif</option>
              ) : (
                daftarAlat.map((alat) => (
                  <option key={alat.id} value={alat.id}>
                    {alat.nama} (Tersedia: {alat.stok_tersedia})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="jumlah"
              className="block text-sm font-medium text-slate-700"
            >
              Jumlah (1–5)
            </label>
            <input
              id="jumlah"
              name="jumlah"
              type="number"
              min={1}
              max={5}
              defaultValue={1}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="peminjam"
              className="block text-sm font-medium text-slate-700"
            >
              Nama Peminjam
            </label>
            <input
              id="peminjam"
              name="peminjam"
              type="text"
              required
              minLength={3}
              maxLength={40}
              placeholder="Contoh: Raka Pratama"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="kelas"
              className="block text-sm font-medium text-slate-700"
            >
              Kelas
            </label>
            <input
              id="kelas"
              name="kelas"
              type="text"
              required
              minLength={3}
              maxLength={20}
              placeholder="Contoh: XI DKV 1"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="tgl_pinjam"
              className="block text-sm font-medium text-slate-700"
            >
              Tanggal Pinjam
            </label>
            <input
              id="tgl_pinjam"
              name="tgl_pinjam"
              type="date"
              defaultValue={today}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="tgl_kembali"
              className="block text-sm font-medium text-slate-700"
            >
              Tanggal Kembali
            </label>
            <input
              id="tgl_kembali"
              name="tgl_kembali"
              type="date"
              defaultValue={today}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="keperluan"
            className="block text-sm font-medium text-slate-700"
          >
            Keperluan
          </label>
          <textarea
            id="keperluan"
            name="keperluan"
            rows={2}
            required
            minLength={5}
            maxLength={120}
            placeholder="Contoh: Pemotretan produk tugas mata pelajaran DKV"
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {state?.error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          >
            {state.error}
          </div>
        ) : null}

        {state?.success ? (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800"
          >
            <p>{state.success}</p>
            <Link
              href="/"
              className="mt-2 inline-block font-semibold underline"
            >
              Kembali ke katalog alat
            </Link>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending || daftarAlat.length === 0}
          className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Mengirim Permohonan..." : "Ajukan Peminjaman"}
        </button>
      </form>
    </div>
  );
}