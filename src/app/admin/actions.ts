"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminSupabaseClient } from "@/lib/supabase";
import { isKategoriValid } from "@/lib/peminjaman";
import {
  getLocalDateIso,
  isKondisiKembaliValid,
  type AdminActionState,
} from "@/lib/admin";

function refreshAllViews() {
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function tambahAlat(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminAuthenticated())) {
    return { error: "Akses ditolak. Silakan login sebagai admin." };
  }

  const nama = String(formData.get("nama") ?? "").trim();
  const kategori = String(formData.get("kategori") ?? "").trim();
  const stok = Number(formData.get("stok"));
  const keterangan = String(formData.get("keterangan") ?? "").trim();

  if (nama.length < 3 || nama.length > 40) {
    return { error: "Nama alat harus terdiri dari 3 sampai 40 karakter." };
  }

  if (!isKategoriValid(kategori)) {
    return { error: "Kategori alat tidak valid." };
  }

  if (!Number.isInteger(stok) || stok < 0 || stok > 50) {
    return {
      error: "Stok alat harus berupa bilangan bulat antara 0 sampai 50.",
    };
  }

  if (keterangan.length > 160) {
    return { error: "Keterangan alat maksimal 160 karakter." };
  }

  try {
    const supabase = getAdminSupabaseClient();
    const { error } = await supabase.from("alat").insert({
      nama,
      kategori,
      stok,
      keterangan,
      aktif: true,
    });

    if (error) {
      if (error.code === "23505") {
        return { error: `Alat dengan nama "${nama}" sudah terdaftar.` };
      }
      return { error: error.message || "Gagal menambahkan alat baru." };
    }

    refreshAllViews();
    return { success: `Alat "${nama}" berhasil ditambahkan.` };
  } catch {
    return { error: "Terjadi kesalahan sistem saat menambahkan alat." };
  }
}

export async function perbaruiAlat(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminAuthenticated())) {
    return { error: "Akses ditolak. Silakan login sebagai admin." };
  }

  const id = Number(formData.get("id"));
  const stok = Number(formData.get("stok"));
  const keterangan = String(formData.get("keterangan") ?? "").trim();
  const aktif = formData.get("aktif") === "true";

  if (!Number.isInteger(id) || id <= 0) {
    return { error: "ID alat tidak valid." };
  }

  if (!Number.isInteger(stok) || stok < 0 || stok > 50) {
    return { error: "Stok alat harus berada di rentang 0 sampai 50." };
  }

  if (keterangan.length > 160) {
    return { error: "Keterangan alat maksimal 160 karakter." };
  }

  try {
    const supabase = getAdminSupabaseClient();

    // Cek jumlah unit yang sedang dipinjam agar stok tidak diturunkan di bawahnya
    const { data: pinjamAktif, error: pinjamErr } = await supabase
      .from("peminjaman_alat")
      .select("jumlah")
      .eq("alat_id", id)
      .eq("status", "dipinjam");

    if (pinjamErr) {
      return { error: "Gagal memeriksa unit yang sedang dipinjam." };
    }

    const sedangDipinjam = (pinjamAktif ?? []).reduce(
      (acc, r) => acc + Number(r.jumlah || 0),
      0,
    );

    if (stok < sedangDipinjam) {
      return {
        error: `Stok (${stok}) tidak boleh lebih kecil dari jumlah unit yang sedang dipinjam (${sedangDipinjam}).`,
      };
    }

    const { error } = await supabase
      .from("alat")
      .update({
        stok,
        keterangan,
        aktif,
      })
      .eq("id", id);

    if (error) {
      return { error: error.message || "Gagal memperbarui data alat." };
    }

    refreshAllViews();
    return { success: "Perubahan data alat berhasil disimpan." };
  } catch {
    return { error: "Terjadi kesalahan sistem saat memperbarui alat." };
  }
}

export async function setujuiPeminjaman(
  peminjamanId: number,
): Promise<AdminActionState> {
  if (!(await isAdminAuthenticated())) {
    return { error: "Akses ditolak. Silakan login sebagai admin." };
  }

  if (!Number.isInteger(peminjamanId) || peminjamanId <= 0) {
    return { error: "ID peminjaman tidak valid." };
  }

  try {
    const supabase = getAdminSupabaseClient();

    const { data: pinjaman, error: getErr } = await supabase
      .from("peminjaman_alat")
      .select("id, alat_id, jumlah, status, peminjam")
      .eq("id", peminjamanId)
      .single();

    if (getErr || !pinjaman) {
      return { error: "Data peminjaman tidak ditemukan." };
    }

    if (pinjaman.status !== "menunggu") {
      return {
        error: `Permohonan hanya bisa disetujui dari status "menunggu" (saat ini: "${pinjaman.status}").`,
      };
    }

    const { data: alat, error: alatErr } = await supabase
      .from("alat")
      .select("id, nama, stok, aktif")
      .eq("id", pinjaman.alat_id)
      .single();

    if (alatErr || !alat) {
      return { error: "Data alat terkait tidak ditemukan." };
    }

    if (!alat.aktif) {
      return {
        error: `Alat "${alat.nama}" sedang nonaktif. Aktifkan alat terlebih dahulu sebelum menyetujui.`,
      };
    }

    const { data: rowsDipinjam, error: dipinjamErr } = await supabase
      .from("peminjaman_alat")
      .select("jumlah")
      .eq("alat_id", alat.id)
      .eq("status", "dipinjam");

    if (dipinjamErr) {
      return { error: "Gagal memeriksa stok tersedia." };
    }

    const sedangDipinjam = (rowsDipinjam ?? []).reduce(
      (acc, r) => acc + Number(r.jumlah || 0),
      0,
    );
    const stokTersedia = Number(alat.stok) - sedangDipinjam;

    if (Number(pinjaman.jumlah) > stokTersedia) {
      return {
        error: `Stok tersedia untuk "${alat.nama}" tidak mencukupi (tersedia ${stokTersedia} unit, diminta ${pinjaman.jumlah} unit).`,
      };
    }

    const { error: updateErr } = await supabase
      .from("peminjaman_alat")
      .update({
        status: "dipinjam",
        alasan_tolak: null,
      })
      .eq("id", peminjamanId);

    if (updateErr) {
      return { error: updateErr.message || "Gagal menyetujui peminjaman." };
    }

    refreshAllViews();
    return {
      success: `Permohonan atas nama ${pinjaman.peminjam} disetujui (status: dipinjam).`,
    };
  } catch {
    return { error: "Terjadi kesalahan sistem saat menyetujui peminjaman." };
  }
}

export async function tolakPeminjaman(
  peminjamanId: number,
  alasanTolakRaw: string,
): Promise<AdminActionState> {
  if (!(await isAdminAuthenticated())) {
    return { error: "Akses ditolak. Silakan login sebagai admin." };
  }

  if (!Number.isInteger(peminjamanId) || peminjamanId <= 0) {
    return { error: "ID peminjaman tidak valid." };
  }

  const alasanTolak = alasanTolakRaw.trim();
  if (alasanTolak.length < 3 || alasanTolak.length > 120) {
    return {
      error: "Alasan penolakan wajib diisi (3 sampai 120 karakter).",
    };
  }

  try {
    const supabase = getAdminSupabaseClient();

    const { data: pinjaman, error: getErr } = await supabase
      .from("peminjaman_alat")
      .select("id, status, peminjam")
      .eq("id", peminjamanId)
      .single();

    if (getErr || !pinjaman) {
      return { error: "Data peminjaman tidak ditemukan." };
    }

    if (pinjaman.status !== "menunggu") {
      return {
        error: `Hanya permohonan berstatus "menunggu" yang dapat ditolak.`,
      };
    }

    const { error: updateErr } = await supabase
      .from("peminjaman_alat")
      .update({
        status: "ditolak",
        alasan_tolak: alasanTolak,
      })
      .eq("id", peminjamanId);

    if (updateErr) {
      return { error: updateErr.message || "Gagal menolak permohonan." };
    }

    refreshAllViews();
    return {
      success: `Permohonan atas nama ${pinjaman.peminjam} ditolak.`,
    };
  } catch {
    return { error: "Terjadi kesalahan sistem saat menolak peminjaman." };
  }
}

export async function kembalikanPeminjaman(
  peminjamanId: number,
  kondisiKembaliRaw: string,
  tglDikembalikanRaw: string,
): Promise<AdminActionState> {
  if (!(await isAdminAuthenticated())) {
    return { error: "Akses ditolak. Silakan login sebagai admin." };
  }

  if (!Number.isInteger(peminjamanId) || peminjamanId <= 0) {
    return { error: "ID peminjaman tidak valid." };
  }

  if (!isKondisiKembaliValid(kondisiKembaliRaw)) {
    return {
      error:
        "Kondisi pengembalian wajib dipilih (baik, rusak ringan, atau rusak berat).",
    };
  }

  const tglDikembalikan = tglDikembalikanRaw.trim() || getLocalDateIso();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(tglDikembalikan)) {
    return { error: "Format tanggal pengembalian tidak valid." };
  }

  try {
    const supabase = getAdminSupabaseClient();

    const { data: pinjaman, error: getErr } = await supabase
      .from("peminjaman_alat")
      .select("id, status, tgl_pinjam, peminjam")
      .eq("id", peminjamanId)
      .single();

    if (getErr || !pinjaman) {
      return { error: "Data peminjaman tidak ditemukan." };
    }

    if (pinjaman.status !== "dipinjam") {
      return {
        error: `Hanya peminjaman berstatus "dipinjam" yang dapat dikembalikan.`,
      };
    }

    if (tglDikembalikan < String(pinjaman.tgl_pinjam)) {
      return {
        error:
          "Tanggal dikembalikan tidak boleh lebih awal dari tanggal pinjam.",
      };
    }

    const { error: updateErr } = await supabase
      .from("peminjaman_alat")
      .update({
        status: "dikembalikan",
        kondisi_kembali: kondisiKembaliRaw,
        tgl_dikembalikan: tglDikembalikan,
      })
      .eq("id", peminjamanId);

    if (updateErr) {
      return {
        error: updateErr.message || "Gagal mencatat pengembalian alat.",
      };
    }

    refreshAllViews();
    return {
      success: `Pengembalian alat oleh ${pinjaman.peminjam} (${kondisiKembaliRaw}) berhasil dicatat.`,
    };
  } catch {
    return { error: "Terjadi kesalahan sistem saat mencatat pengembalian." };
  }
}
