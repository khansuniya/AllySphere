import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Briefcase, MapPin, Clock, Building2, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import AlumniPostJobForm from "./AlumniPostJobForm";

const AlumniMyJobs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingJob, setEditingJob] = useState<any>(null);

  const { data: myJobs, isLoading } = useQuery({
    queryKey: ["my-jobs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("posted_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId).eq("posted_by", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({ title: "Job deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting job", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader><div className="h-6 bg-muted rounded w-3/4" /></CardHeader>
            <CardContent><div className="h-16 bg-muted rounded" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!myJobs?.length) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No jobs posted yet</h3>
          <p className="text-muted-foreground">Use the "Post a Job" tab to create your first job listing.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {myJobs.map((job) => (
          <Card key={job.id} className="border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Building2 className="w-4 h-4" /> {job.company}
                  </p>
                </div>
                <Badge variant={job.is_active ? "default" : "secondary"}>
                  {job.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {job.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                )}
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.job_type}</span>
                <Badge variant="outline" className="text-xs">{job.work_mode}</Badge>
              </div>
              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {job.skills.map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Posted {format(new Date(job.created_at), "MMM d, yyyy")}
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingJob(job)}>
                <Pencil className="w-3 h-3 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this job?")) {
                    deleteMutation.mutate(job.id);
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingJob} onOpenChange={(open) => { if (!open) setEditingJob(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          {editingJob && (
            <AlumniPostJobForm editJob={editingJob} onSuccess={() => setEditingJob(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlumniMyJobs;
