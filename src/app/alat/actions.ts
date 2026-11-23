"use server";

import { getAdminSupabaseClient } from "@/lib/supabase";
import {
  isKategoriValid,
  type AlatItem,
  type KategoriAlat,
} from "@/lib/peminjaman";

export async function ambilDaftarAlatAktif(): Promise<{
  data: AlatItem[];
  error?: string;
}> {
  try {
    const supabase = getAdminSupabaseClient();

    const { data: rowsAlat, error: errAlat } = await supabase
      .from("alat")
      .select("id, nama, kategori, stok, keterangan, aktif")
      .eq("aktif", true)
      .order("nama", { ascending: true });

    if (errAlat) {
      return { data: [], error: errAlat.message };
    }

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

    const daftar: AlatItem[] = (rowsAlat ?? [])
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

    return { data: daftar };
  } catch {
    return { data: [], error: "Terjadi kesalahan saat memuat daftar alat." };
  }
}
