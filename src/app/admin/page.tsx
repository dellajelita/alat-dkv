import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminSupabaseClient } from "@/lib/supabase";
import { logoutAdmin } from "@/app/login/actions";
import {
  getLocalDateIso,
  isKondisiKembaliValid,
  type AdminPeminjamanRow,
  type RekapMetrikAdmin,
  type StatusPeminjaman,
} from "@/lib/admin";
import DashboardAdminClient from "@/components/DashboardAdminClient";

function isStatusValid(value: string): value is StatusPeminjaman {
  return (
    value === "menunggu" ||
    value === "dipinjam" ||
    value === "dikembalikan" ||
    value === "ditolak"
  );
}

async function KontenAdmin() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/login");
  }

  const supabase = getAdminSupabaseClient();
  const todayIso = getLocalDateIso();

  const { data: rowsAlat, error: errAlat } = await supabase
    .from("alat")
    .select("id, nama, aktif");

  const { data: rowsPinjam, error: errPinjam } = await supabase
    .from("peminjaman_alat")
    .select(
      "id, alat_id, peminjam, kelas, keperluan, jumlah, tgl_pinjam, tgl_kembali, status, alasan_tolak, kondisi_kembali, tgl_dikembalikan, dibuat",
    )
    .order("dibuat", { ascending: false });

  const mapNamaAlat = new Map<number, string>();
  for (const a of rowsAlat ?? []) {
    mapNamaAlat.set(Number(a.id), String(a.nama));
  }

  const daftarPeminjaman: AdminPeminjamanRow[] = (rowsPinjam ?? [])
    .filter((r) => isStatusValid(String(r.status)))
    .map((r) => {
      const status = r.status as StatusPeminjaman;
      const tglKembali = String(r.tgl_kembali);
      const terlambat = status === "dipinjam" && tglKembali < todayIso;
      const kondisiRaw = r.kondisi_kembali ? String(r.kondisi_kembali) : "";

      return {
        id: Number(r.id),
        alat_id: Number(r.alat_id),
        nama_alat: mapNamaAlat.get(Number(r.alat_id)) ?? "Alat Tidak Diketahui",
        peminjam: String(r.peminjam),
        kelas: String(r.kelas),
        keperluan: String(r.keperluan),
        jumlah: Number(r.jumlah),
        tgl_pinjam: String(r.tgl_pinjam),
        tgl_kembali: tglKembali,
        status,
        alasan_tolak: r.alasan_tolak ? String(r.alasan_tolak) : null,
        kondisi_kembali: isKondisiKembaliValid(kondisiRaw) ? kondisiRaw : null,
        tgl_dikembalikan: r.tgl_dikembalikan
          ? String(r.tgl_dikembalikan)
          : null,
        dibuat: String(r.dibuat),
        terlambat,
      };
    });

  const metrik: RekapMetrikAdmin = {
    totalAlatAktif: (rowsAlat ?? []).filter((a) => Boolean(a.aktif)).length,
    menunggu: daftarPeminjaman.filter((p) => p.status === "menunggu").length,
    dipinjam: daftarPeminjaman.filter((p) => p.status === "dipinjam").length,
    terlambat: daftarPeminjaman.filter((p) => p.terlambat).length,
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              AlatDKV • Panel Pengelola Laboratorium
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Dashboard Admin
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link
              href="/admin/alat"
              className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Kelola Alat
            </Link>

            <Link
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Lihat Katalog Publik
            </Link>

            <form action={logoutAdmin}>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {errAlat || errPinjam ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Gagal memuat data dashboard:{" "}
            {errAlat?.message || errPinjam?.message}
          </div>
        ) : (
          <DashboardAdminClient
            metrik={metrik}
            daftarPeminjaman={daftarPeminjaman}
          />
        )}
      </main>
    </>
  );
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-7xl px-4 py-12 text-sm text-slate-600 sm:px-6 lg:px-8">
            Memuat dashboard admin...
          </div>
        }
      >
        <KontenAdmin />
      </Suspense>
    </div>
  );
}
