import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    // Fetch student profile
    const { data: studentProfile } = await supabase
      .from("profiles")
      .select("full_name, department, bio")
      .eq("user_id", userId)
      .maybeSingle();

    // Fetch all available alumni mentors with their profiles
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: mentors } = await serviceClient
      .from("alumni_details")
      .select("user_id, current_company, job_title, industry, skills, mentorship_areas, years_of_experience")
      .eq("is_mentor_available", true);

    if (!mentors || mentors.length === 0) {
      return new Response(JSON.stringify({ recommendations: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get profiles for mentors
    const mentorUserIds = mentors.map((m: any) => m.user_id);
    const { data: mentorProfiles } = await serviceClient
      .from("profiles")
      .select("user_id, full_name, avatar_url, department, graduation_year")
      .in("user_id", mentorUserIds);

    const profileMap: Record<string, any> = {};
    mentorProfiles?.forEach((p: any) => {
      profileMap[p.user_id] = p;
    });

    // Build mentor summaries for AI
    const mentorSummaries = mentors.map((m: any, i: number) => {
      const p = profileMap[m.user_id] || {};
      return `[${i}] ${p.full_name || "Unknown"} | ${m.job_title || "N/A"} at ${m.current_company || "N/A"} | Industry: ${m.industry || "N/A"} | Skills: ${(m.skills || []).join(", ") || "N/A"} | Mentorship: ${(m.mentorship_areas || []).join(", ") || "N/A"} | Dept: ${p.department || "N/A"} | Exp: ${m.years_of_experience || 0}yrs`;
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are a mentor matching engine for a college alumni platform.

Student Profile:
- Name: ${studentProfile?.full_name || "Unknown"}
- Department: ${studentProfile?.department || "Not specified"}
- Bio/Interests: ${studentProfile?.bio || "Not specified"}

Available Alumni Mentors:
${mentorSummaries.join("\n")}

Rank the TOP 5 most relevant mentors for this student. Consider department match, skill relevance, industry alignment, and mentorship areas.

Return ONLY a JSON array of objects with these exact fields:
- index (number: the [index] from the list above)
- matchReason (string: 1-2 sentence explanation of why this mentor is a good match)
- sharedAreas (string array: shared skills/interests/areas between student and mentor)`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: "You are a precise mentor matching system. Always respond with valid JSON array only, no markdown or extra text.",
            },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        const t = await aiResponse.text();
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later.", recommendations: [] }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        const t = await aiResponse.text();
        return new Response(JSON.stringify({ error: "AI credits exhausted.", recommendations: [] }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error("AI matching failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";

    let ranked: any[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      ranked = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      ranked = [];
    }

    // Build final recommendations with full mentor data
    const recommendations = ranked
      .filter((r: any) => typeof r.index === "number" && mentors[r.index])
      .slice(0, 5)
      .map((r: any) => {
        const mentor = mentors[r.index];
        const mp = profileMap[mentor.user_id] || {};
        return {
          user_id: mentor.user_id,
          full_name: mp.full_name || "Unknown",
          avatar_url: mp.avatar_url || null,
          department: mp.department || null,
          graduation_year: mp.graduation_year || null,
          job_title: mentor.job_title || null,
          current_company: mentor.current_company || null,
          industry: mentor.industry || null,
          skills: mentor.skills || [],
          mentorship_areas: mentor.mentorship_areas || [],
          match_reason: r.matchReason || "",
          shared_areas: r.sharedAreas || [],
        };
      });

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-recommendations:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        recommendations: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
