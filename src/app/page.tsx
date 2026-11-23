import { Suspense } from "react";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminSupabaseClient } from "@/lib/supabase";
import { isKategoriValid, type AlatItem } from "@/lib/peminjaman";
import KatalogPeminjamanClient from "@/components/KatalogPeminjamanClient";

async function KontenBeranda() {
  const adminLoggedIn = await isAdminAuthenticated();
  const supabase = getAdminSupabaseClient();

  const { data: rowsAlat, error: alatError } = await supabase
    .from("alat")
    .select("id, nama, kategori, stok, keterangan, aktif")
    .eq("aktif", true)
    .order("nama", { ascending: true });

  const { data: rowsDipinjam } = await supabase
    .from("peminjaman_alat")
    .select("alat_id, jumlah")
    .eq("status", "dipinjam");

  const jumlahDipinjamPerAlat = new Map<number, number>();
  for (const row of rowsDipinjam ?? []) {
    const id = Number(row.alat_id);
    const jml = Number(row.jumlah || 0);
    jumlahDipinjamPerAlat.set(id, (jumlahDipinjamPerAlat.get(id) ?? 0) + jml);
  }

  const daftarAlat: AlatItem[] = (rowsAlat ?? [])
    .filter((row) => isKategoriValid(String(row.kategori)))
    .map((row) => {
      const id = Number(row.id);
      const stok = Number(row.stok);
      const sedangDipinjam = jumlahDipinjamPerAlat.get(id) ?? 0;
      const stokTersedia = Math.max(0, stok - sedangDipinjam);

      return {
        id,
        nama: String(row.nama),
        kategori: row.kategori as AlatItem["kategori"],
        stok,
        keterangan: String(row.keterangan ?? ""),
        aktif: Boolean(row.aktif),
        stok_tersedia: stokTersedia,
      };
    });

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              AlatDKV • Sistem Peminjaman Alat Lab DKV
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Peminjaman Alat Laboratorium DKV
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {adminLoggedIn ? (
              <Link
                href="/admin"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Dashboard Admin
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Login Admin
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {alatError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Gagal memuat katalog alat dari database: {alatError.message}
          </div>
        ) : (
          <KatalogPeminjamanClient daftarAlat={daftarAlat} />
        )}
      </main>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 sm:px-6">
            Memuat katalog alat laboratorium DKV...
          </div>
        }
      >
        <KontenBeranda />
      </Suspense>
    </div>
  );
}
