"use server";

import { getAdminSupabaseClient } from "@/lib/supabase";
import { getJakartaTodayIso } from "@/lib/peminjaman";

export type HasilCekPeminjaman = {
  id: number;
  nama_alat: string;
  peminjam: string;
  kelas: string;
  keperluan: string;
  jumlah: number;
  tgl_pinjam: string;
  tgl_kembali: string;
  status: string;
  alasan_tolak: string | null;
  kondisi_kembali: string | null;
  tgl_dikembalikan: string | null;
  terlambat: boolean;
};

export async function cekStatusPeminjaman(
  nomorInput: string,
  namaInput: string,
): Promise<{
  data: HasilCekPeminjaman | null;
  error?: string;
}> {
  const nomorRaw = nomorInput.trim();
  const namaRaw = namaInput.trim();
  const nomorId = Number(nomorRaw);

  if (!Number.isInteger(nomorId) || nomorId <= 0) {
    return {
      data: null,
      error: "Nomor peminjaman harus berupa angka yang valid.",
    };
  }

  if (namaRaw.length < 2) {
    return {
      data: null,
      error: "Nama peminjam wajib diisi untuk verifikasi kecocokan data.",
    };
  }

  try {
    const supabase = getAdminSupabaseClient();

    const { data: row, error } = await supabase
      .from("peminjaman_alat")
      .select(
        "id, alat_id, peminjam, kelas, keperluan, jumlah, tgl_pinjam, tgl_kembali, status, alasan_tolak, kondisi_kembali, tgl_dikembalikan",
      )
      .eq("id", nomorId)
      .maybeSingle();

    if (error) {
      return {
        data: null,
        error: "Terjadi kesalahan saat mencari data peminjaman.",
      };
    }

    if (
      !row ||
      String(row.peminjam).trim().toLowerCase() !== namaRaw.toLowerCase()
    ) {
      return {
        data: null,
        error:
          "Data peminjaman tidak ditemukan. Pastikan nomor peminjaman dan nama peminjam cocok.",
      };
    }

    const { data: alatRow } = await supabase
      .from("alat")
      .select("nama")
      .eq("id", Number(row.alat_id))
      .maybeSingle();

    const todayWib = getJakartaTodayIso();
    const statusStr = String(row.status);
    const tglKembaliStr = String(row.tgl_kembali);
    const terlambat = statusStr === "dipinjam" && tglKembaliStr < todayWib;

    return {
      data: {
        id: Number(row.id),
        nama_alat: alatRow?.nama ? String(alatRow.nama) : "Alat Laboratorium",
        peminjam: String(row.peminjam),
        kelas: String(row.kelas),
        keperluan: String(row.keperluan),
        jumlah: Number(row.jumlah),
        tgl_pinjam: String(row.tgl_pinjam),
        tgl_kembali: tglKembaliStr,
        status: statusStr,
        alasan_tolak: row.alasan_tolak ? String(row.alasan_tolak) : null,
        kondisi_kembali: row.kondisi_kembali
          ? String(row.kondisi_kembali)
          : null,
        tgl_dikembalikan: row.tgl_dikembalikan
          ? String(row.tgl_dikembalikan)
          : null,
        terlambat,
      },
    };
  } catch {
    return {
      data: null,
      error: "Terjadi kesalahan saat memproses pengecekan status.",
    };
  }
}
