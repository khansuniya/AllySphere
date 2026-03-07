import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { AppRole } from '@/types/database';
import { Loader2, Mail, ShieldCheck, UserPlus, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

type SignupStep = 'email' | 'otp' | 'details';

interface SignupFlowProps {
  onSwitchToSignin: () => void;
}

const SignupFlow: React.FC<SignupFlowProps> = ({ onSwitchToSignin }) => {
  const [step, setStep] = useState<SignupStep>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AppRole>('student');
  const [branch, setBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshProfile } = useAuth();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const studentAlumniBranches = [
    'Computer Science',
    'Artificial Intelligence and Data Science',
    'Electronics and Telecommunication',
    'Electrical',
    'Mechanical',
    'Civil',
  ];
  const facultyBranches = [...studentAlumniBranches, 'Other'];
  const branchOptions = role === 'faculty' ? facultyBranches : studentAlumniBranches;

  const sendOtp = async () => {
    try {
      z.string().email('Please enter a valid email address').parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors({ email: e.errors[0].message });
        return;
      }
    }
    setErrors({});
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });

      if (error) {
        toast({ title: 'Failed to send code', description: error.message, variant: 'destructive' });
      } else {
        setStep('otp');
        setResendCooldown(60);
        toast({ title: 'Verification code sent!', description: `Check your inbox at ${email}` });
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) {
        toast({ title: 'Failed to resend code', description: error.message, variant: 'destructive' });
      } else {
        setResendCooldown(60);
        setOtpCode('');
        toast({ title: 'New code sent!', description: `Check your inbox at ${email}` });
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otpCode.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit code' });
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      });

      if (error) {
        toast({ title: 'Verification failed', description: 'Invalid or expired code. Please try again.', variant: 'destructive' });
      } else {
        setStep('details');
        toast({ title: 'Email verified!', description: 'Complete your profile to finish registration.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!branch) newErrors.branch = 'Branch / Department is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('complete-signup', {
        body: { fullName, role, department: branch, password },
      });

      if (error) {
        toast({ title: 'Signup failed', description: error.message || 'Something went wrong', variant: 'destructive' });
      } else {
        await refreshProfile();
        toast({ title: 'Account created!', description: 'Welcome to Ally Sphere!' });
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-6">
      {(['email', 'otp', 'details'] as SignupStep[]).map((s, i) => (
        <React.Fragment key={s}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
            step === s ? 'bg-primary text-primary-foreground' :
            (['email', 'otp', 'details'].indexOf(step) > i) ? 'bg-primary/20 text-primary' :
            'bg-muted text-muted-foreground'
          }`}>
            {i + 1}
          </div>
          {i < 2 && <div className={`w-8 h-0.5 ${(['email', 'otp', 'details'].indexOf(step) > i) ? 'bg-primary/40' : 'bg-muted'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {stepIndicator}

      {step === 'email' && (
        <div className="space-y-4">
          <div className="text-center mb-2">
            <Mail className="h-10 w-10 mx-auto text-primary mb-2" />
            <p className="text-sm text-muted-foreground">We'll send a verification code to your email</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email Address</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
              onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <Button onClick={sendOtp} className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send Verification Code'}
          </Button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <div className="text-center mb-2">
            <ShieldCheck className="h-10 w-10 mx-auto text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to</p>
            <p className="text-sm font-medium">{email}</p>
          </div>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {errors.otp && <p className="text-sm text-destructive text-center">{errors.otp}</p>}
          <Button onClick={verifyOtp} className="w-full" disabled={loading || otpCode.length !== 6}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : 'Verify Code'}
          </Button>
          <div className="text-center text-sm">
            {resendCooldown > 0 ? (
              <p className="text-muted-foreground">Resend code in {resendCooldown}s</p>
            ) : (
              <button type="button" onClick={resendOtp} className="text-primary hover:underline font-medium" disabled={loading}>
                Resend Code
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => { setStep('email'); setOtpCode(''); }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto"
          >
            <ArrowLeft className="h-3 w-3" /> Change email
          </button>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-4">
          <div className="text-center mb-2">
            <UserPlus className="h-10 w-10 mx-auto text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Complete your profile</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-name">Full Name</Label>
            <Input
              id="signup-name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={errors.fullName ? 'border-destructive' : ''}
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-role">I am a</Label>
            <Select value={role} onValueChange={(v) => { setRole(v as AppRole); setBranch(''); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Current Student</SelectItem>
                <SelectItem value="alumni">Alumni</SelectItem>
                <SelectItem value="faculty">Faculty Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-branch">Branch / Department</Label>
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger className={errors.branch ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select your branch" />
              </SelectTrigger>
              <SelectContent>
                {branchOptions.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.branch && <p className="text-sm text-destructive">{errors.branch}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Set Password</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <Button onClick={completeSignup} className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</> : 'Complete Registration'}
          </Button>
        </div>
      )}

      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToSignin} className="font-medium text-primary hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupFlow;
