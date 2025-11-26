import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

function getAdminCredentials() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase admin client is missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return { supabaseUrl, serviceRoleKey };
}

export function createSupabaseAdminClient(): SupabaseClient<Database> {
  if (typeof window !== "undefined") {
    throw new Error("The Supabase admin client must only be instantiated on the server.");
  }

  const { supabaseUrl, serviceRoleKey } = getAdminCredentials();

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
