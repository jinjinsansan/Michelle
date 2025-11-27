import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "./admin";
import { createSupabaseServerClient } from "./server";
import type { Database } from "@/types/database";

const DEMO_MODE_FLAG = (process.env.ENABLE_DEMO_MODE ?? process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE ?? "true").toLowerCase();
const DEMO_MODE_ENABLED = DEMO_MODE_FLAG !== "false";
const DEMO_USER_ID = process.env.DEMO_USER_ID ?? "00000000-0000-0000-0000-000000000000";
const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL ?? "demo@tape.ai";
type UsersTable = Database["public"]["Tables"]["users"];

export type SupabaseUserContext = {
  client: SupabaseClient<Database>;
  userId: string | null;
  isDemo: boolean;
};

export async function getSupabaseUserContext(): Promise<SupabaseUserContext> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { client: supabase, userId: user.id, isDemo: false };
  }

  if (!DEMO_MODE_ENABLED) {
    return { client: supabase, userId: null, isDemo: false };
  }

  const adminClient = createSupabaseAdminClient();
  await ensureDemoUserExists(adminClient);

  return { client: adminClient, userId: DEMO_USER_ID, isDemo: true };
}

async function ensureDemoUserExists(client: SupabaseClient<Database>) {
  const payload: UsersTable["Insert"] = {
    id: DEMO_USER_ID,
    email: DEMO_USER_EMAIL,
  };

  const { error } = await client.from("users").upsert(payload as never, { onConflict: "id" });
  if (error) {
    throw error;
  }
}
