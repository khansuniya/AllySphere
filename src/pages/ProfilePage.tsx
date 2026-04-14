import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [department, setDepartment] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState();
  const [dobString, setDobString] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error(error);
      return;
    }

    if (data) {
      setFullName(data.full_name || '');
      setBio(data.bio || '');
      setDepartment(data.department || '');
      setGraduationYear(data.graduation_year?.toString() || '');
      setPhone(data.phone || '');
      setLinkedinUrl(data.linkedin_url || '');
      setAvatarUrl(data.avatar_url || '');

      if (data.date_of_birth) {
        const d = new Date(data.date_of_birth);
        setDateOfBirth(d);
        setDobString(format(d, 'dd/MM/yyyy'));
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    const fileName = `${user.id}-${Date.now()}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error(uploadError);
      toast({
        title: 'Upload failed',
        description: uploadError.message,
      });
      return;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const imageUrl = data.publicUrl;

    await supabase
      .from('profiles')
      .update({ avatar_url: imageUrl })
      .eq('user_id', user.id);

    setAvatarUrl(imageUrl);

    toast({
      title: 'Photo uploaded!',
    });
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            email: user.email,
            full_name: fullName,
            bio,
            department,
            graduation_year: graduationYear
              ? parseInt(graduationYear)
              : null,
            phone,
            linkedin_url: linkedinUrl,
            date_of_birth: dateOfBirth
              ? format(dateOfBirth, 'yyyy-MM-dd')
              : null,
            avatar_url: avatarUrl,
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) throw error;

      await fetchProfile();

      toast({
        title: 'Profile updated',
        description: 'Saved successfully',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to save profile',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDobChange = (value) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';

    if (digits.length <= 2) formatted = digits;
    else if (digits.length <= 4)
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    else
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;

    setDobString(formatted);

    if (digits.length === 8) {
      const parsed = parse(formatted, 'dd/MM/yyyy', new Date());
      if (isValid(parsed)) setDateOfBirth(parsed);
    }
  };

  if (authLoading) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex flex-col items-center gap-3">
              <img
                src={avatarUrl || "https://via.placeholder.com/100"}
                className="w-24 h-24 rounded-full object-cover"
              />
              <input type="file" onChange={handleUpload} />
            </div>

            <Input
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <Input value={user?.email || ''} disabled />

            <Textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <Input
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />

            <Input
              placeholder="Graduation Year"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
            />

            <Input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              placeholder="LinkedIn URL"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />

            <Input
              placeholder="DD/MM/YYYY"
              value={dobString}
              onChange={(e) => handleDobChange(e.target.value)}
            />

            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : 'Save'}
            </Button>

          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfilePage;
