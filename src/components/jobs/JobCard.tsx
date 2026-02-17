import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Building2, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface JobCardProps {
  job: any;
  posterProfile?: { full_name: string; department: string } | null;
  showApply?: boolean;
  onViewDetails?: () => void;
}

const JobCard = ({ job, posterProfile, showApply = true, onViewDetails }: JobCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow border-border/50 flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Building2 className="w-4 h-4" />
              {job.company}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {job.is_referral && (
              <Badge className="bg-primary/20 text-primary border-primary/30">Referral</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
          )}
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.job_type}</span>
          <Badge variant="outline" className="text-xs">{job.work_mode}</Badge>
        </div>

        {job.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
        )}

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 5).map((s: string) => (
              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
            ))}
            {job.skills.length > 5 && (
              <Badge variant="secondary" className="text-xs">+{job.skills.length - 5}</Badge>
            )}
          </div>
        )}

        {posterProfile && (
          <p className="text-xs text-muted-foreground">
            Posted by {posterProfile.full_name}{posterProfile.department ? ` • ${posterProfile.department}` : ""}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Posted {format(new Date(job.created_at), "MMM d, yyyy")}
          {job.last_date_to_apply && ` • Apply by ${format(new Date(job.last_date_to_apply), "MMM d, yyyy")}`}
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        {onViewDetails && (
          <Button variant="outline" className="flex-1" onClick={onViewDetails}>
            View Details
          </Button>
        )}
        {showApply && job.apply_url && (
          <Button asChild className="flex-1">
            <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
              Apply Now <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobCard;
