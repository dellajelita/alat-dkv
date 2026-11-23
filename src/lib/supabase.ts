import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error("Variabel lingkungan NEXT_PUBLIC_SUPABASE_URL belum diatur.");
}

// Klien publik (hanya untuk akses baca terbatas sesuai RLS anon)
export function getPublicSupabaseClient() {
  if (!publishableKey) {
    throw new Error(
      "Variabel lingkungan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum diatur.",
    );
  }
  return createClient(supabaseUrl!, publishableKey, {
    auth: { persistSession: false },
  });
}

// Klien server/admin (hanya dipakai di Server Component / Server Action / Route Handler)
export function getAdminSupabaseClient() {
  if (!secretKey) {
    throw new Error("Variabel lingkungan SUPABASE_SECRET_KEY belum diatur.");
  }
  return createClient(supabaseUrl!, secretKey, {
    auth: { persistSession: false },
  });
}
