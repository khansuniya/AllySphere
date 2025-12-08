import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  GraduationCap, 
  Users, 
  MessageSquare, 
  Calendar, 
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: 'Alumni Directory',
      description: 'Search and connect with thousands of alumni across industries and roles.',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Matching',
      description: 'Get personalized mentor recommendations based on your goals and interests.',
    },
    {
      icon: MessageSquare,
      title: 'Direct Messaging',
      description: 'Reach out to alumni for career advice, referrals, and guidance.',
    },
    {
      icon: Calendar,
      title: 'Events & Webinars',
      description: 'Stay connected through networking events, reunions, and workshops.',
    },
  ];

  const benefits = [
    'Find mentors who match your career aspirations',
    'Network with professionals in your target industry',
    'Access exclusive job opportunities and referrals',
    'Attend virtual and in-person alumni events',
    'Build lasting professional relationships',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container relative py-20 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Alumni Network
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Connect. Mentor.{' '}
              <span className="text-gradient">Succeed Together.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Ally Sphere bridges the gap between students, alumni, and faculty. 
              Find the perfect mentor, discover career opportunities, and build 
              your professional network.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/auth?mode=signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Everything You Need to Network
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful tools designed to help you connect with the right people and grow professionally.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-border/50 bg-card/50 backdrop-blur transition-all hover:shadow-card">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-primary">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                Your Path to Professional Growth Starts Here
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join thousands of students and alumni who are already benefiting from meaningful connections.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8">
                <Link to="/auth?mode=signup">
                  Join Ally Sphere
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl gradient-hero opacity-10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-card shadow-elevated">
                  <GraduationCap className="h-16 w-16 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Ready to Connect?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join the Ally Sphere community and unlock your professional potential.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link to="/auth?mode=signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">Ally Sphere</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Ally Sphere. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
