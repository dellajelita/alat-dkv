import { Suspense } from "react";
import Link from "next/link";
import { getAdminSupabaseClient } from "@/lib/supabase";
import {
  isKategoriValid,
  type AlatItem,
  type KategoriAlat,
} from "@/lib/peminjaman";
import FormPinjamClient from "@/app/pinjam/FormPinjamClient";

type AjukanPageProps = {
  searchParams: Promise<{ alatId?: string }>;
};

async function KontenAjukan({ searchParams }: AjukanPageProps) {
  const params = await searchParams;
  const alatIdRaw = (params.alatId ?? "").trim();
  const alatIdNum = Number(alatIdRaw);
  const initialAlatId =
    alatIdRaw.length > 0 && Number.isInteger(alatIdNum) && alatIdNum > 0
      ? String(alatIdNum)
      : undefined;

  const supabase = getAdminSupabaseClient();

  const { data: rowsAlat, error } = await supabase
    .from("alat")
    .select("id, nama, kategori, stok, keterangan, aktif")
    .eq("aktif", true)
    .order("nama", { ascending: true });

  const { data: rowsPinjam } = await supabase
    .from("peminjaman_alat")
    .select("alat_id, jumlah")
    .eq("status", "dipinjam");

  const mapDipinjam = new Map<number, number>();
  for (const p of rowsPinjam ?? []) {
    const aid = Number(p.alat_id);
    const jml = Number(p.jumlah || 0);
    mapDipinjam.set(aid, (mapDipinjam.get(aid) ?? 0) + jml);
  }

  const daftarAlat: AlatItem[] = (rowsAlat ?? [])
    .filter((r) => isKategoriValid(String(r.kategori)))
    .map((r) => {
      const id = Number(r.id);
      const stok = Number(r.stok);
      const dipinjam = mapDipinjam.get(id) ?? 0;
      return {
        id,
        nama: String(r.nama),
        kategori: r.kategori as KategoriAlat,
        stok,
        keterangan: String(r.keterangan ?? ""),
        aktif: Boolean(r.aktif),
        stok_tersedia: Math.max(0, stok - dipinjam),
      };
    });

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              AlatDKV • Form Peminjaman
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Ajukan Peminjaman Alat
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/alat"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Daftar Alat
            </Link>
            <Link
              href="/cek"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cek Status
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
          <h2 className="text-sm font-bold text-indigo-950">
            Ketentuan & Syarat Peminjaman Alat DKV
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-indigo-900 sm:text-sm">
            <li>
              <strong>Jumlah & Kuota:</strong> Maksimal{" "}
              <strong>1–5 unit</strong> per pengajuan (tidak melebihi stok
              tersedia), dan setiap peminjam maksimal memiliki{" "}
              <strong>2 permohonan aktif</strong> (berstatus <em>menunggu</em>{" "}
              atau <em>dipinjam</em>).
            </li>
            <li>
              <strong>Jadwal & Durasi:</strong> Tanggal pinjam mulai hari ini
              hingga paling jauh <strong>14 hari ke depan</strong>, durasi
              peminjaman <strong>maksimal 3 hari</strong>, serta tanggal pinjam
              maupun tanggal kembali{" "}
              <strong>bukan hari Sabtu atau Minggu</strong>.
            </li>
            <li>
              <strong>Nomor Peminjaman:</strong> Setelah pengajuan berhasil
              dikirim, catat <strong>Nomor Peminjaman</strong> yang muncul di
              layar untuk mengecek status di halaman{" "}
              <Link href="/cek" className="font-semibold underline">
                Cek Status
              </Link>
              .
            </li>
          </ul>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Gagal memuat daftar alat: {error.message}
          </div>
        ) : (
          <FormPinjamClient
            daftarAlat={daftarAlat}
            initialAlatId={initialAlatId}
          />
        )}
      </main>
    </>
  );
}

export default function AjukanPage(props: AjukanPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-7xl px-4 py-12 text-sm text-slate-600 sm:px-6 lg:px-8">
            Memuat formulir pengajuan...
          </div>
        }
      >
        <KontenAjukan searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
