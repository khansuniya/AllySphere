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

    // Fetch current user's profile
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: userProfile } = await serviceClient
      .from("profiles")
      .select("full_name, department, bio, graduation_year")
      .eq("user_id", userId)
      .maybeSingle();

    if (!userProfile?.graduation_year) {
      return new Response(JSON.stringify({ recommendations: [], message: "Set your graduation year to get batch mate suggestions." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch current user's skills/details
    const { data: userAlumni } = await serviceClient
      .from("alumni_details")
      .select("skills, mentorship_areas, industry, job_title, current_company")
      .eq("user_id", userId)
      .maybeSingle();

    // Fetch all profiles with same graduation year
    const { data: batchProfiles } = await serviceClient
      .from("profiles")
      .select("user_id, full_name, avatar_url, department, graduation_year, bio")
      .eq("graduation_year", userProfile.graduation_year)
      .neq("user_id", userId);

    if (!batchProfiles || batchProfiles.length === 0) {
      return new Response(JSON.stringify({ recommendations: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch alumni details for batch mates
    const batchUserIds = batchProfiles.map((p: any) => p.user_id);
    const { data: batchAlumniDetails } = await serviceClient
      .from("alumni_details")
      .select("user_id, current_company, job_title, industry, skills, mentorship_areas, years_of_experience")
      .in("user_id", batchUserIds);

    const alumniMap: Record<string, any> = {};
    batchAlumniDetails?.forEach((a: any) => {
      alumniMap[a.user_id] = a;
    });

    // Build summaries for AI
    const batchSummaries = batchProfiles.map((p: any, i: number) => {
      const a = alumniMap[p.user_id] || {};
      return `[${i}] ${p.full_name || "Unknown"} | Dept: ${p.department || "N/A"} | ${a.job_title || "N/A"} at ${a.current_company || "N/A"} | Industry: ${a.industry || "N/A"} | Skills: ${(a.skills || []).join(", ") || "N/A"} | Bio: ${p.bio || "N/A"}`;
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are a batch mate recommendation engine for a college alumni platform.

Current User:
- Name: ${userProfile.full_name || "Unknown"}
- Department: ${userProfile.department || "Not specified"}
- Graduation Year: ${userProfile.graduation_year}
- Bio: ${userProfile.bio || "Not specified"}
- Skills: ${(userAlumni?.skills || []).join(", ") || "Not specified"}
- Industry: ${userAlumni?.industry || "Not specified"}
- Role: ${userAlumni?.job_title || "Not specified"} at ${userAlumni?.current_company || "Not specified"}

Batch Mates (same graduation year ${userProfile.graduation_year}):
${batchSummaries.join("\n")}

Recommend the TOP 3 most relevant batch mates to connect with. Consider shared department, similar skills, complementary industries, and potential for networking.

Return ONLY a JSON array of objects with these exact fields:
- index (number: the [index] from the list above)
- connectReason (string: 1-2 sentence personalized reason why they should connect)
- commonGround (string array: shared interests, skills, or background elements)`;

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
              content: "You are a precise batch mate recommendation system. Always respond with valid JSON array only, no markdown or extra text.",
            },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later.", recommendations: [] }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
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

    const recommendations = ranked
      .filter((r: any) => typeof r.index === "number" && batchProfiles[r.index])
      .slice(0, 3)
      .map((r: any) => {
        const p = batchProfiles[r.index];
        const a = alumniMap[p.user_id] || {};
        return {
          user_id: p.user_id,
          full_name: p.full_name || "Unknown",
          avatar_url: p.avatar_url || null,
          department: p.department || null,
          graduation_year: p.graduation_year || null,
          job_title: a.job_title || null,
          current_company: a.current_company || null,
          industry: a.industry || null,
          skills: a.skills || [],
          connect_reason: r.connectReason || "",
          common_ground: r.commonGround || [],
        };
      });

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-batch-mates:", error);
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
