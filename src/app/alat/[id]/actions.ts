"use server";

import { getAdminSupabaseClient } from "@/lib/supabase";
import {
  isKategoriValid,
  type AlatItem,
  type KategoriAlat,
} from "@/lib/peminjaman";

export async function ambilDetailAlat(idParam: string): Promise<{
  alat: AlatItem | null;
  notFound?: boolean;
  error?: string;
}> {
  try {
    const idNum = Number(idParam);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return { alat: null, notFound: true };
    }

    const supabase = getAdminSupabaseClient();

    const { data: row, error } = await supabase
      .from("alat")
      .select("id, nama, kategori, stok, keterangan, aktif")
      .eq("id", idNum)
      .maybeSingle();

    if (error) {
      return { alat: null, error: error.message };
    }

    if (!row || !Boolean(row.aktif) || !isKategoriValid(String(row.kategori))) {
      return { alat: null, notFound: true };
    }

    const { data: rowsPinjam } = await supabase
      .from("peminjaman_alat")
      .select("jumlah")
      .eq("alat_id", idNum)
      .eq("status", "dipinjam");

    const dipinjam = (rowsPinjam ?? []).reduce(
      (acc, item) => acc + Number(item.jumlah || 0),
      0,
    );

    const stok = Number(row.stok);
    const alat: AlatItem = {
      id: Number(row.id),
      nama: String(row.nama),
      kategori: row.kategori as KategoriAlat,
      stok,
      keterangan: String(row.keterangan ?? ""),
      aktif: Boolean(row.aktif),
      stok_tersedia: Math.max(0, stok - dipinjam),
    };

    return { alat };
  } catch {
    return { alat: null, error: "Gagal memuat detail alat." };
  }
}
