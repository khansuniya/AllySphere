import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Loader2 } from 'lucide-react';
import { z } from 'zod';
import SignupFlow from './SignupFlow';
import { supabase } from '@/integrations/supabase/client';

const emailSchema = z.string().email('Please enter a valid email address');

const AuthForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();

  // 🔹 SEND OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
    } catch {
      setError('Enter valid email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'OTP Sent!',
          description: 'Check your email',
        });
        setStep('otp'); // 👉 switch to OTP screen
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 VERIFY OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) {
        toast({
          title: 'Invalid OTP',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login successful!',
        });

        navigate('/dashboard'); // 👉 change if needed
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4 py-12">
      <Card className="w-full max-w-md shadow-elevated animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">
            {step === 'email' ? 'Login with OTP' : 'Enter OTP'}
          </CardTitle>
          <CardDescription>
            {step === 'email'
              ? 'Enter your email to receive OTP'
              : 'Enter the OTP sent to your email'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {mode === 'signup' ? (
            <SignupFlow onSwitchToSignin={() => setMode('signin')} />
          ) : (
            <>
              {step === 'email' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </form>
              )}

              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Enter OTP</Label>
                    <Input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;