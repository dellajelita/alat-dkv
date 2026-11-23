import { Suspense } from "react";
import Link from "next/link";
import { getAdminSupabaseClient } from "@/lib/supabase";
import {
  isKategoriValid,
  type AlatItem,
  type KategoriAlat,
} from "@/lib/peminjaman";

const KATEGORI_LIST: { value: "semua" | KategoriAlat; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "kamera", label: "Kamera" },
  { value: "pencahayaan", label: "Pencahayaan" },
  { value: "audio", label: "Audio" },
  { value: "tablet", label: "Tablet" },
  { value: "aksesori", label: "Aksesori" },
];

type AlatPageProps = {
  searchParams: Promise<{ kategori?: string }>;
};

async function KontenDaftarAlat({ searchParams }: AlatPageProps) {
  const params = await searchParams;
  const kategoriRaw = (params.kategori ?? "semua").toLowerCase().trim();
  const kategoriAktif: "semua" | KategoriAlat = isKategoriValid(kategoriRaw)
    ? kategoriRaw
    : "semua";

  const supabase = getAdminSupabaseClient();

  const { data: rowsAlat, error: errAlat } = await supabase
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

  const semuaAlatAktif: AlatItem[] = (rowsAlat ?? [])
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

  const alatTersaring =
    kategoriAktif === "semua"
      ? semuaAlatAktif
      : semuaAlatAktif.filter((item) => item.kategori === kategoriAktif);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {KATEGORI_LIST.map((kat) => {
            const isSelected = kategoriAktif === kat.value;
            const href =
              kat.value === "semua" ? "/alat" : `/alat?kategori=${kat.value}`;
            return (
              <Link
                key={kat.value}
                href={href}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {kat.label}
              </Link>
            );
          })}
        </div>

        <p className="text-sm text-slate-600">
          Menampilkan{" "}
          <span className="font-semibold">{alatTersaring.length}</span> alat
          aktif
        </p>
      </div>

      {errAlat ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gagal memuat daftar alat: {errAlat.message}
        </div>
      ) : alatTersaring.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          Tidak ada alat aktif untuk kategori ini.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {alatTersaring.map((alat) => (
            <div
              key={alat.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                    {alat.kategori}
                  </span>
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                      alat.stok_tersedia > 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    Tersedia: {alat.stok_tersedia}/{alat.stok}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900">
                  {alat.nama}
                </h2>
                <p className="mt-1.5 text-sm text-slate-600">
                  {alat.keterangan || "Tidak ada keterangan tambahan."}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <Link
                  href={`/alat/${alat.id}`}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Detail Alat
                </Link>
                <Link
                  href={`/ajukan?alatId=${alat.id}`}
                  className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Ajukan Pinjam
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default function DaftarAlatPage(props: AlatPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              AlatDKV • Katalog Alat Aktif
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Daftar Alat Laboratorium DKV
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Beranda
            </Link>
            <Link
              href="/cek"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cek Status
            </Link>
            <Link
              href="/ajukan"
              className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + Ajukan Peminjaman
            </Link>
          </div>
        </div>
      </header>

      <Suspense
        fallback={
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Memuat daftar alat aktif...
            </div>
          </main>
        }
      >
        <KontenDaftarAlat searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
