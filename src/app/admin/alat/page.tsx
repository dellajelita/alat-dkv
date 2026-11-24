import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminSupabaseClient } from "@/lib/supabase";
import { isKategoriValid } from "@/lib/peminjaman";
import { logoutAdmin } from "@/app/login/actions";
import type { AdminAlatRow } from "@/lib/admin";
import KelolaAlatAdminClient from "@/components/KelolaAlatAdminClient";

async function KontenAdminAlat() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/login");
  }

  const supabase = getAdminSupabaseClient();

  const { data: rowsAlat, error: errAlat } = await supabase
    .from("alat")
    .select("id, nama, kategori, stok, keterangan, aktif")
    .order("id", { ascending: true });

  const { data: rowsPinjam } = await supabase
    .from("peminjaman_alat")
    .select("alat_id, jumlah")
    .eq("status", "dipinjam");

  const mapDipinjamPerAlat = new Map<number, number>();
  for (const p of rowsPinjam ?? []) {
    const aid = Number(p.alat_id);
    const jml = Number(p.jumlah || 0);
    mapDipinjamPerAlat.set(aid, (mapDipinjamPerAlat.get(aid) ?? 0) + jml);
  }

  const daftarAlat: AdminAlatRow[] = (rowsAlat ?? [])
    .filter((r) => isKategoriValid(String(r.kategori)))
    .map((r) => {
      const id = Number(r.id);
      const stok = Number(r.stok);
      const sedangDipinjam = mapDipinjamPerAlat.get(id) ?? 0;
      return {
        id,
        nama: String(r.nama),
        kategori: r.kategori as AdminAlatRow["kategori"],
        stok,
        keterangan: String(r.keterangan ?? ""),
        aktif: Boolean(r.aktif),
        sedang_dipinjam: sedangDipinjam,
        stok_tersedia: Math.max(0, stok - sedangDipinjam),
      };
    });

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              AlatDKV • Inventaris Laboratorium
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Kelola Data Alat
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Kembali ke Dashboard
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

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {errAlat ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Gagal memuat data alat: {errAlat.message}
          </div>
        ) : (
          <KelolaAlatAdminClient daftarAlat={daftarAlat} />
        )}
      </main>
    </>
  );
}

export default function AdminAlatPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 sm:px-6">
            Memuat halaman kelola alat...
          </div>
        }
      >
        <KontenAdminAlat />
      </Suspense>
    </div>
  );
}
