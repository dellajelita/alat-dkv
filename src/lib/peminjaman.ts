export type KategoriAlat =
  | "kamera"
  | "pencahayaan"
  | "audio"
  | "tablet"
  | "aksesori";

export type AlatItem = {
  id: number;
  nama: string;
  kategori: KategoriAlat;
  stok: number;
  keterangan: string;
  aktif: boolean;
  stok_tersedia: number;
};

export type AjukanPeminjamanState = {
  error?: string;
  success?: string;
};

const KATEGORI_VALID: KategoriAlat[] = [
  "kamera",
  "pencahayaan",
  "audio",
  "tablet",
  "aksesori",
];

export function isKategoriValid(value: string): value is KategoriAlat {
  return (KATEGORI_VALID as string[]).includes(value);
}

// Mendapatkan tanggal hari ini (YYYY-MM-DD) dalam zona waktu Asia/Jakarta (WIB)
export function getJakartaTodayIso(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

// Menambah/mengurangi hari pada tanggal ISO (YYYY-MM-DD) secara aman
export function addDaysIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

// Mengecek apakah tanggal ISO (YYYY-MM-DD) jatuh pada Sabtu (6) atau Minggu (0)
export function isWeekendIso(isoDate: string): boolean {
  const [y, m, d] = isoDate.split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return day === 0 || day === 6;
}

// Selisih hari kalender: tglKembali - tglPinjam
export function diffDaysIso(startIso: string, endIso: string): number {
  const [sy, sm, sd] = startIso.split("-").map(Number);
  const [ey, em, ed] = endIso.split("-").map(Number);
  const startUtc = Date.UTC(sy, sm - 1, sd);
  const endUtc = Date.UTC(ey, em - 1, ed);
  return Math.round((endUtc - startUtc) / (1000 * 60 * 60 * 24));
}

export function validasiInputPeminjaman(input: {
  alatId: number;
  peminjam: string;
  kelas: string;
  keperluan: string;
  jumlah: number;
  tglPinjam: string;
  tglKembali: string;
}): string | null {
  if (!Number.isInteger(input.alatId) || input.alatId <= 0) {
    return "Silakan pilih alat yang ingin dipinjam.";
  }

  const peminjamTrim = input.peminjam.trim();
  if (peminjamTrim.length < 3 || peminjamTrim.length > 40) {
    return "Nama peminjam harus terdiri dari 3 sampai 40 karakter.";
  }

  const kelasTrim = input.kelas.trim();
  if (kelasTrim.length < 3 || kelasTrim.length > 20) {
    return "Kelas harus terdiri dari 3 sampai 20 karakter.";
  }

  const keperluanTrim = input.keperluan.trim();
  if (keperluanTrim.length < 5 || keperluanTrim.length > 120) {
    return "Keperluan harus terdiri dari 5 sampai 120 karakter.";
  }

  if (!Number.isInteger(input.jumlah) || input.jumlah < 1 || input.jumlah > 5) {
    return "Jumlah unit yang dipinjam harus antara 1 sampai 5.";
  }

  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (
    !isoDateRegex.test(input.tglPinjam) ||
    !isoDateRegex.test(input.tglKembali)
  ) {
    return "Format tanggal pinjam dan tanggal kembali tidak valid.";
  }

  const hariIni = getJakartaTodayIso();
  const batasMaksPinjam = addDaysIso(hariIni, 14);

  if (input.tglPinjam < hariIni) {
    return "Tanggal pinjam tidak boleh tanggal lampau.";
  }

  if (input.tglPinjam > batasMaksPinjam) {
    return "Tanggal pinjam paling jauh 14 hari ke depan.";
  }

  if (isWeekendIso(input.tglPinjam)) {
    return "Tanggal pinjam tidak boleh hari Sabtu atau Minggu.";
  }

  if (input.tglKembali < input.tglPinjam) {
    return "Tanggal kembali tidak boleh lebih awal dari tanggal pinjam.";
  }

  if (isWeekendIso(input.tglKembali)) {
    return "Tanggal kembali tidak boleh hari Sabtu atau Minggu.";
  }

  const durasiHari = diffDaysIso(input.tglPinjam, input.tglKembali);
  if (durasiHari > 3) {
    return "Lama peminjaman maksimal 3 hari dari tanggal pinjam.";
  }

  return null;
}
