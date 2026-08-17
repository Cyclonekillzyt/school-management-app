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

    const { data: callerProfile, error: callerProfileErr } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (callerProfileErr || callerProfile?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Access denied: admin only" }),
        { status: 403 },
      );
    }

    const { action, teacherId } = await req.json();

    if (!action || !teacherId) {
      return new Response(
        JSON.stringify({ error: "action and teacherId are required" }),
        { status: 400 },
      );
    }

    if (action === "reset_password") {
      const { data: teacherProfile, error: teacherErr } = await adminClient
        .from("profiles")
        .select("email")
        .eq("id", teacherId)
        .maybeSingle();

      if (teacherErr || !teacherProfile?.email) {
        return new Response(JSON.stringify({ error: "Teacher not found" }), {
          status: 404,
        });
      }

      const { error: resetErr } = await adminClient.auth.resetPasswordForEmail(
        teacherProfile.email,
      );

      if (resetErr) {
        return new Response(JSON.stringify({ error: resetErr.message }), {
          status: 400,
        });
      }

       await adminClient.from("activity_log").insert({
        actor_id: userData.user.id,
        action: "teacher_password_reset",
        entity_type: "teacher",
        entity_id: teacherId,
        entity_label: teacherProfile.email,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "deactivate" || action === "reactivate") {
      const banDuration = action === "deactivate" ? "876000h" : "0h"; // ~100 years, or none

      const { error: banErr } = await adminClient.auth.admin.updateUserById(
        teacherId,
        {
          ban_duration: banDuration,
        },
      );

      if (banErr) {
        return new Response(JSON.stringify({ error: banErr.message }), {
          status: 400,
        });
      }

      const { error: profileErr } = await adminClient
        .from("profiles")
        .update({ active: action === "reactivate" })
        .eq("id", teacherId);

      if (profileErr) {
        return new Response(JSON.stringify({ error: profileErr.message }), {
          status: 400,
        });
      }

      await adminClient.from("activity_log").insert({
        actor_id: userData.user.id,
        action: action === "deactivate" ? "teacher_deactivated" : "teacher_reactivated",
        entity_type: "teacher",
        entity_id: teacherId,
      });
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});
