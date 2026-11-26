"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabaseClient } from "@/lib/supabase";
import {
  validasiInputPeminjaman,
  type AjukanPeminjamanState,
} from "@/lib/peminjaman";

export async function ajukanPeminjaman(
  _prevState: AjukanPeminjamanState,
  formData: FormData,
): Promise<AjukanPeminjamanState> {
  const alatId = Number(formData.get("alat_id"));
  const peminjam = String(formData.get("peminjam") ?? "");
  const kelas = String(formData.get("kelas") ?? "");
  const keperluan = String(formData.get("keperluan") ?? "");
  const jumlah = Number(formData.get("jumlah"));
  const tglPinjam = String(formData.get("tgl_pinjam") ?? "");
  const tglKembali = String(formData.get("tgl_kembali") ?? "");

  const pesanError = validasiInputPeminjaman({
    alatId,
    peminjam,
    kelas,
    keperluan,
    jumlah,
    tglPinjam,
    tglKembali,
  });

  if (pesanError) {
    return { error: pesanError };
  }

  try {
    const supabase = getAdminSupabaseClient();

    // 1. Pastikan alat ada dan aktif
    const { data: alat, error: alatError } = await supabase
      .from("alat")
      .select("id, nama, stok, aktif")
      .eq("id", alatId)
      .single();

    if (alatError || !alat) {
      return { error: "Alat tidak ditemukan." };
    }

    if (!alat.aktif) {
      return {
        error: `Alat "${alat.nama}" sedang nonaktif dan tidak dapat dipinjam.`,
      };
    }

    // 2. Hitung stok tersedia berdasarkan pinjaman yang sedang berstatus 'dipinjam'
    const { data: aktifDipinjam, error: pinjamError } = await supabase
      .from("peminjaman_alat")
      .select("jumlah")
      .eq("alat_id", alatId)
      .eq("status", "dipinjam");

    if (pinjamError) {
      return { error: "Gagal memeriksa ketersediaan stok alat." };
    }

    const totalDipinjam = (aktifDipinjam ?? []).reduce(
      (acc, row) => acc + Number(row.jumlah || 0),
      0,
    );
    const stokTersedia = alat.stok - totalDipinjam;

    if (jumlah > stokTersedia) {
      return {
        error: `Stok tersedia untuk "${alat.nama}" hanya ${stokTersedia} unit.`,
      };
    }

    // 3. Cek batas maksimal 2 permohonan aktif ('menunggu' atau 'dipinjam') per peminjam
    const { data: riwayatPeminjam, error: cekAktifError } = await supabase
      .from("peminjaman_alat")
      .select("peminjam, status")
      .in("status", ["menunggu", "dipinjam"]);

    if (cekAktifError) {
      return { error: "Gagal memeriksa batas permohonan aktif peminjam." };
    }

    const targetNama = peminjam.trim().toLowerCase();
    const jumlahAktif = (riwayatPeminjam ?? []).filter(
      (item) => String(item.peminjam).trim().toLowerCase() === targetNama,
    ).length;

    if (jumlahAktif >= 2) {
      return {
        error:
          "Permohonan gagal: satu peminjam maksimal hanya boleh memiliki 2 permohonan aktif (menunggu/dipinjam).",
      };
    }

    // 4. Insert permohonan baru dengan status awal 'menunggu' lalu ambil ID peminjamannya
    const namaBersih = peminjam.trim();
    const { data: insertedRow, error: insertError } = await supabase
      .from("peminjaman_alat")
      .insert({
        alat_id: alatId,
        peminjam: namaBersih,
        kelas: kelas.trim(),
        keperluan: keperluan.trim(),
        jumlah,
        tgl_pinjam: tglPinjam,
        tgl_kembali: tglKembali,
        status: "menunggu",
        alasan_tolak: null,
        kondisi_kembali: null,
        tgl_dikembalikan: null,
      })
      .select("id")
      .single();

    if (insertError) {
      return {
        error: insertError.message || "Gagal menyimpan permohonan peminjaman.",
      };
    }

    revalidatePath("/");
    revalidatePath("/admin");

    const nomorBaru = insertedRow?.id ? Number(insertedRow.id) : undefined;

    return {
      success: `Permohonan peminjaman "${alat.nama}" (${jumlah} unit) berhasil dikirim dengan status menunggu persetujuan admin.`,
      nomorPeminjaman: nomorBaru,
      namaPeminjam: namaBersih,
    };
  } catch {
    return {
      error: "Terjadi kesalahan sistem saat mengajukan peminjaman.",
    };
  }
}
