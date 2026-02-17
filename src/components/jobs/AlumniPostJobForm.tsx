import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AlumniPostJobFormProps {
  onSuccess: () => void;
  editJob?: any;
}

const AlumniPostJobForm = ({ onSuccess, editJob }: AlumniPostJobFormProps) => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: editJob?.title || "",
    company: editJob?.company || "",
    job_type: editJob?.job_type || "full-time",
    work_mode: editJob?.work_mode || "on-site",
    location: editJob?.location || "",
    description: editJob?.description || "",
    apply_url: editJob?.apply_url || "",
  });
  const [skills, setSkills] = useState<string[]>(editJob?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [lastDate, setLastDate] = useState<Date | undefined>(
    editJob?.last_date_to_apply ? new Date(editJob.last_date_to_apply) : undefined
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const payload = {
        ...form,
        skills,
        last_date_to_apply: lastDate ? format(lastDate, "yyyy-MM-dd") : null,
        posted_by: user.id,
        is_referral: false,
      };

      if (editJob) {
        const { error } = await supabase
          .from("jobs")
          .update(payload)
          .eq("id", editJob.id)
          .eq("posted_by", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("jobs").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
      toast({ title: editJob ? "Job updated successfully!" : "Job posted successfully and is now visible to students." });
      onSuccess();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const isValid = form.title && form.company && form.description && form.apply_url;

  return (
    <div className="space-y-6">
      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input
                placeholder="e.g. Software Engineer"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input
                placeholder="e.g. Google"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-Time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="part-time">Part-Time</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Work Mode</Label>
              <Select value={form.work_mode} onValueChange={(v) => setForm({ ...form, work_mode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="on-site">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Job Location {form.work_mode === "remote" ? "(optional)" : ""}</Label>
            <Input
              placeholder="e.g. Bangalore, India"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              placeholder="Describe the role, responsibilities, and expectations..."
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Required Skills</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Type a skill and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              />
              <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1">
                    {s}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(s)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Application Link *</Label>
            <Input
              type="url"
              placeholder="https://..."
              value={form.apply_url}
              onChange={(e) => setForm({ ...form, apply_url: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Last Date to Apply</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !lastDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {lastDate ? format(lastDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={lastDate}
                  onSelect={setLastDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Alumni Info (auto-filled) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alumni Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{profile?.full_name || "—"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Graduation Year</Label>
              <p className="font-medium">{profile?.graduation_year || "—"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Department</Label>
              <p className="font-medium">{profile?.department || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        onClick={() => mutation.mutate()}
        disabled={!isValid || mutation.isPending}
      >
        {mutation.isPending ? (editJob ? "Updating..." : "Posting...") : (editJob ? "Update Job" : "Post Job")}
      </Button>
    </div>
  );
};

export default AlumniPostJobForm;
