import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

function getBrowserCredentials() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase browser client is missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = getBrowserCredentials();

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
