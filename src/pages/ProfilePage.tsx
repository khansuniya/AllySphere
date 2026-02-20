import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlumniDetails } from '@/types/database';
import { Loader2, Plus, X, Camera } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

const ProfilePage: React.FC = () => {
  const { user, profile, userRole, refreshProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [department, setDepartment] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [dobString, setDobString] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  // Alumni specific
  const [alumniDetails, setAlumniDetails] = useState<AlumniDetails | null>(null);
  const [currentCompany, setCurrentCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [isMentorAvailable, setIsMentorAvailable] = useState(false);
  const [mentorshipAreas, setMentorshipAreas] = useState<string[]>([]);
  const [newMentorshipArea, setNewMentorshipArea] = useState('');

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setDepartment(profile.department || '');
      setGraduationYear(profile.graduation_year?.toString() || '');
      setPhone(profile.phone || '');
      setLinkedinUrl(profile.linkedin_url || '');
      if (profile.date_of_birth) {
        const d = new Date(profile.date_of_birth);
        setDateOfBirth(d);
        setDobString(format(d, 'dd/MM/yyyy'));
      }
    }
  }, [profile]);

  useEffect(() => {
    if (user && userRole === 'alumni') {
      fetchAlumniDetails();
    } else {
      setLoading(false);
    }
  }, [user, userRole]);

  const fetchAlumniDetails = async () => {
    try {
      const { data } = await supabase
        .from('alumni_details')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (data) {
        const details = data as AlumniDetails;
        setAlumniDetails(details);
        setCurrentCompany(details.current_company || '');
        setJobTitle(details.job_title || '');
        setIndustry(details.industry || '');
        setYearsOfExperience(details.years_of_experience?.toString() || '');
        setSkills(details.skills || []);
        setIsMentorAvailable(details.is_mentor_available || false);
        setMentorshipAreas(details.mentorship_areas || []);
      }
    } catch (error) {
      console.error('Error fetching alumni details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio,
          department,
          graduation_year: graduationYear ? parseInt(graduationYear) : null,
          phone,
          linkedin_url: linkedinUrl,
          date_of_birth: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : null,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update alumni details if alumni
      if (userRole === 'alumni') {
        const alumniData = {
          user_id: user.id,
          current_company: currentCompany,
          job_title: jobTitle,
          industry,
          years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : 0,
          skills,
          is_mentor_available: isMentorAvailable,
          mentorship_areas: mentorshipAreas,
        };

        if (alumniDetails) {
          const { error } = await supabase
            .from('alumni_details')
            .update(alumniData)
            .eq('user_id', user.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('alumni_details')
            .insert(alumniData);
          if (error) throw error;
        }
      }

      await refreshProfile();
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addMentorshipArea = () => {
    if (newMentorshipArea.trim() && !mentorshipAreas.includes(newMentorshipArea.trim())) {
      setMentorshipAreas([...mentorshipAreas, newMentorshipArea.trim()]);
      setNewMentorshipArea('');
    }
  };

  const removeMentorshipArea = (area: string) => {
    setMentorshipAreas(mentorshipAreas.filter(a => a !== area));
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast({ title: 'Photo updated', description: 'Your profile photo has been changed.' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({ title: 'Error', description: 'Failed to upload photo.', variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDobChange = (value: string) => {
    // Auto-format as DD/MM/YYYY
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length <= 2) formatted = digits;
    else if (digits.length <= 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    else formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;

    setDobString(formatted);

    if (digits.length === 8) {
      const parsed = parse(formatted, 'dd/MM/yyyy', new Date());
      if (isValid(parsed) && parsed <= new Date() && parsed >= new Date('1900-01-01')) {
        setDateOfBirth(parsed);
      } else {
        setDateOfBirth(undefined);
      }
    } else {
      setDateOfBirth(undefined);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-8 max-w-3xl">
          <Skeleton className="h-10 w-64 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Profile Settings</h1>

        <div className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload a professional photo for your profile
                  </p>
                  <label htmlFor="avatar-upload">
                    <Button variant="outline" size="sm" asChild disabled={uploadingAvatar}>
                      <span>
                        {uploadingAvatar ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="mr-2 h-4 w-4" />
                        )}
                        {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                      </span>
                    </Button>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Computer Science"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    placeholder="e.g., 2020"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  placeholder="DD/MM/YYYY"
                  value={dobString}
                  onChange={(e) => handleDobChange(e.target.value)}
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  Your birthday will be visible to others so they can wish you!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Alumni Details */}
          {userRole === 'alumni' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>Share your work experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        placeholder="e.g., Senior Software Engineer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        placeholder="e.g., Google"
                        value={currentCompany}
                        onChange={(e) => setCurrentCompany(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        placeholder="e.g., Technology"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        placeholder="e.g., 5"
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" size="icon" onClick={addSkill}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <button onClick={() => removeSkill(skill)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mentorship Settings</CardTitle>
                  <CardDescription>Configure your mentorship availability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mentor-toggle">Available for Mentorship</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow students to send you mentorship requests
                      </p>
                    </div>
                    <Switch
                      id="mentor-toggle"
                      checked={isMentorAvailable}
                      onCheckedChange={setIsMentorAvailable}
                    />
                  </div>

                  {isMentorAvailable && (
                    <div className="space-y-2">
                      <Label>Mentorship Areas</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add an area you can help with..."
                          value={newMentorshipArea}
                          onChange={(e) => setNewMentorshipArea(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMentorshipArea())}
                        />
                        <Button type="button" size="icon" onClick={addMentorshipArea}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {mentorshipAreas.map((area) => (
                          <Badge key={area} variant="outline" className="gap-1">
                            {area}
                            <button onClick={() => removeMentorshipArea(area)}>
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
