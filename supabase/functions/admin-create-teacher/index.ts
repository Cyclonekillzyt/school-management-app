import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401 },
      );
    }

    const jwt = authHeader.replace("Bearer ", "");

    // Client scoped to the caller, just to verify identity
    const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } =
      await callerClient.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
      });
    }

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: profile, error: profileErr } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileErr || profile?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Access denied: admin only" }),
        { status: 403 },
      );
    }

    const { rows } = await req.json();

    if (!Array.isArray(rows)) {
      return new Response(JSON.stringify({ error: "rows must be an array" }), {
        status: 400,
      });
    }

    const results: any[] = [];
    let created = 0;
    let failed = 0;

    for (const [index, row] of rows.entries()) {
      const email = (row.email ?? "").trim().toLowerCase();
      const fullName = (row.full_name ?? "").trim();
      const gender = (row.gender ?? "").trim();

      if (!email || !fullName) {
        failed++;
        results.push({
          row: index + 1,
          status: "failed",
          reason: "Missing email or name",
        });
        continue;
      }

      // Sends the teacher an email invite — they set their own password.
      const { data: invited, error: inviteErr } =
        await adminClient.auth.admin.inviteUserByEmail(email);

      if (inviteErr || !invited?.user) {
        failed++;
        results.push({
          row: index + 1,
          status: "failed",
          reason: inviteErr?.message ?? "Could not invite user",
        });
        continue;
      }

      const { error: profileUpsertErr } = await adminClient
        .from("profiles")
        .upsert({
          id: invited.user.id,
          full_name: fullName,
          email,
          gender,
          role: "teacher",
        });

         await adminClient.from("activity_log").insert({
        actor_id: userData.user.id,
        actor_name: userData.user.email,
        action: "teacher_invited",
        entity_type: "teacher",
        entity_id: invited.user.id,
        entity_label: fullName,
      });

      if (profileUpsertErr) {
        failed++;
        results.push({
          row: index + 1,
          status: "failed",
          reason: profileUpsertErr.message,
        });
        continue;
      }

      created++;
      results.push({ row: index + 1, status: "created", email });
    }

    return new Response(JSON.stringify({ created, failed, results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});
