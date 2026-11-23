import { Suspense } from "react";
import Link from "next/link";
import DetailAlatClient from "./DetailAlatClient";

type DetailPageProps = {
  params: Promise<{ id: string }>;
};

async function KontenDetail({ params }: DetailPageProps) {
  const { id } = await params;
  return <DetailAlatClient id={id} />;
}

export default function DetailAlatPage(props: DetailPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              AlatDKV • Detail Alat
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Informasi Spesifikasi & Stok Alat
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
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

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Suspense
          fallback={
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
              Memuat halaman detail alat...
            </div>
          }
        >
          <KontenDetail params={props.params} />
        </Suspense>
      </main>
    </div>
  );
}
