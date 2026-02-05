import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlumniRecord {
  "Full Name": string;
  "Date of Birth": number;
  "Email": string;
  "Phone": string;
  "Bio": string;
  "Department": string;
  "Graduation Year": number;
  "LinkedIn URL": string;
  "Job Title": string;
  "Company": string;
  "Industry": string;
  "Years of Experience": number;
  "Skills": string;
  "Role": string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { alumni } = await req.json() as { alumni: AlumniRecord[] };

    if (!alumni || !Array.isArray(alumni)) {
      throw new Error("Invalid alumni data provided");
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const record of alumni) {
      try {
        // Convert epoch timestamp to date string
        const dob = new Date(record["Date of Birth"]);
        const dateOfBirth = dob.toISOString().split("T")[0];

        // Parse skills from comma-separated string to array
        const skills = record["Skills"]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        // Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: record["Email"],
          password: "Alumni@123", // Default password
          email_confirm: true,
          user_metadata: {
            full_name: record["Full Name"],
            role: "alumni",
          },
        });

        if (authError) {
          // If user exists, try to get their ID
          if (authError.message.includes("already been registered")) {
            const { data: existingUsers } = await supabase.auth.admin.listUsers();
            const existingUser = existingUsers?.users.find(u => u.email === record["Email"]);
            
            if (existingUser) {
              // Update existing profile
              await supabase.from("profiles").upsert({
                user_id: existingUser.id,
                email: record["Email"],
                full_name: record["Full Name"],
                phone: record["Phone"],
                bio: record["Bio"],
                department: record["Department"],
                graduation_year: record["Graduation Year"],
                linkedin_url: record["LinkedIn URL"],
                date_of_birth: dateOfBirth,
              }, { onConflict: "user_id" });

              await supabase.from("alumni_details").upsert({
                user_id: existingUser.id,
                job_title: record["Job Title"],
                current_company: record["Company"],
                industry: record["Industry"],
                years_of_experience: record["Years of Experience"],
                skills: skills,
                is_mentor_available: Math.random() > 0.5,
                mentorship_areas: skills.slice(0, 2),
              }, { onConflict: "user_id" });

              results.success++;
              continue;
            }
          }
          throw authError;
        }

        if (!authUser.user) {
          throw new Error("User creation returned no user");
        }

        const userId = authUser.user.id;

        // Update profile (auto-created by trigger, so we update)
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            phone: record["Phone"],
            bio: record["Bio"],
            department: record["Department"],
            graduation_year: record["Graduation Year"],
            linkedin_url: record["LinkedIn URL"],
            date_of_birth: dateOfBirth,
          })
          .eq("user_id", userId);

        if (profileError) {
          console.error("Profile error:", profileError);
        }

        // Insert alumni details
        const { error: alumniError } = await supabase.from("alumni_details").insert({
          user_id: userId,
          job_title: record["Job Title"],
          current_company: record["Company"],
          industry: record["Industry"],
          years_of_experience: record["Years of Experience"],
          skills: skills,
          is_mentor_available: Math.random() > 0.5,
          mentorship_areas: skills.slice(0, 2),
        });

        if (alumniError) {
          console.error("Alumni details error:", alumniError);
        }

        results.success++;
      } catch (error: unknown) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push(`${record["Full Name"]}: ${errorMessage}`);
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
