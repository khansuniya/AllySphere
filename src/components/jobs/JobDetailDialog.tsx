import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MapPin, Clock, Building2, Calendar } from "lucide-react";
import { format } from "date-fns";

interface JobDetailDialogProps {
  job: any;
  posterProfile?: { full_name: string; department: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showApply?: boolean;
}

const JobDetailDialog = ({ job, posterProfile, open, onOpenChange, showApply = true }: JobDetailDialogProps) => {
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{job.title}</DialogTitle>
          <p className="text-muted-foreground flex items-center gap-1">
            <Building2 className="w-4 h-4" /> {job.company}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>{job.job_type}</Badge>
            <Badge variant="outline">{job.work_mode}</Badge>
            {job.location && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" /> {job.location}
              </span>
            )}
          </div>

          {job.description && (
            <div>
              <h4 className="font-medium mb-1">Job Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {job.requirements && (
            <div>
              <h4 className="font-medium mb-1">Requirements</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div>
              <h4 className="font-medium mb-1">Required Skills</h4>
              <div className="flex flex-wrap gap-1">
                {job.skills.map((s: string) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Posted {format(new Date(job.created_at), "MMM d, yyyy")}
            </span>
            {job.last_date_to_apply && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> Apply by {format(new Date(job.last_date_to_apply), "MMM d, yyyy")}
              </span>
            )}
          </div>

          {posterProfile && (
            <div className="border-t pt-3">
              <p className="text-sm text-muted-foreground">
                Posted by <span className="font-medium text-foreground">{posterProfile.full_name}</span>
                {posterProfile.department ? ` • ${posterProfile.department}` : ""}
              </p>
            </div>
          )}

          {showApply && job.apply_url && (
            <Button asChild className="w-full">
              <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                Apply Now <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailDialog;
