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
  Sparkles,
  Briefcase,
  Award,
  Heart,
  Trophy,
  Target
} from 'lucide-react';
import acetLogo from '@/assets/acet-logo.jpeg';
import collegeCampus from '@/assets/college-campus.jpg';
import AlumniSearchBar from '@/components/landing/AlumniSearchBar';
import FeaturedAlumni from '@/components/landing/FeaturedAlumni';
import FundraisingProgress from '@/components/landing/FundraisingProgress';
import Footer from '@/components/landing/Footer';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: 'Alumni Directory',
      description: 'Search and connect with thousands of alumni across industries and roles.'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Matching',
      description: 'Get personalized mentor recommendations based on your goals and interests.'
    },
    {
      icon: MessageSquare,
      title: 'Direct Messaging',
      description: 'Reach out to alumni for career advice, referrals, and guidance.'
    },
    {
      icon: Calendar,
      title: 'Events & Webinars',
      description: 'Stay connected through networking events, reunions, and workshops.'
    },
    {
      icon: Briefcase,
      title: 'Job & Internships',
      description: 'Access exclusive job opportunities and referrals from alumni network.'
    },
    {
      icon: Heart,
      title: 'Fundraising',
      description: 'Support college initiatives and scholarships through secure donations.'
    }
  ];

  const benefits = [
    'Find mentors who match your career aspirations',
    'Network with professionals in your target industry',
    'Access exclusive job opportunities and referrals',
    'Attend virtual and in-person alumni events',
    'Build lasting professional relationships',
    'Support future generations through donations'
  ];

  const stats = [
    { value: '5000+', label: 'Alumni Network' },
    { value: '500+', label: 'Active Mentors' },
    { value: '200+', label: 'Companies' },
    { value: '50+', label: 'Events/Year' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with College Branding */}
      <header className="border-b border-border bg-card/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={acetLogo} 
              alt="ACET Logo" 
              className="h-14 w-14 object-contain rounded-full border-2 border-primary/20"
            />
            <div className="hidden sm:block">
              <h1 className="font-display text-lg font-bold text-foreground leading-tight">
                Anjuman College of Engineering & Technology
              </h1>
              <p className="text-sm text-muted-foreground">Nagpur</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Announcement Bar */}
      <section className="border-b border-border bg-primary/5 py-3">
        <div className="container">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-foreground font-medium">
              A smarter way to connect with your alumni network. AllySphere launching soon.
            </span>
          </div>
        </div>
      </section>

      {/* Hero Section with Search */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container relative py-10 lg:py-14">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Alumni Network Platform
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Welcome to{' '}
              <span className="text-gradient">AllySphere</span>
            </h1>
            <p className="mt-4 font-display text-xl text-primary font-semibold">
              "Where Alumni, Students, and Futures Connect."
            </p>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              AllySphere bridges the gap between students, alumni, and faculty of ACET. 
              Find the perfect mentor, discover career opportunities, and build 
              your professional network within your college community.
            </p>
            
            {/* Search Bar */}
            <div className="mt-6">
              <AlumniSearchBar />
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to="/auth?mode=signup">
                  Join AllySphere
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10">
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Fundraising Progress Bar */}
      <FundraisingProgress />

      {/* Stats Section */}
      <section className="border-y border-border bg-primary/5 py-8">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="font-display text-3xl font-bold text-primary lg:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Alumni Section */}
      <FeaturedAlumni />

      {/* Features Section */}
      <section className="py-12">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful tools designed to help you connect with the right people and grow professionally.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-border/50 bg-card/50 backdrop-blur transition-all hover:shadow-card hover:border-primary/30">
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

      {/* Role-Based Access Section */}
      <section className="border-t border-border bg-muted/30 py-12">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Designed for Everyone
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tailored experiences for students, alumni, and faculty members.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">Students</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground text-left">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Create professional profiles</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Discover alumni mentors</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Apply to jobs & internships</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Attend events & webinars</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-accent/20 hover:border-accent/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                  <Briefcase className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">Alumni</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground text-left">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> LinkedIn-style profiles</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Post jobs & referrals</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Mentor students</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Earn achievement badges</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-success/20 hover:border-success/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <Award className="h-8 w-8 text-success" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">Faculty / Admin</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground text-left">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Verify users</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Manage events</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> View analytics</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Highlight top alumni</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12">
        <div className="container">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                Your Path to Professional Growth Starts Here
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Join thousands of students and alumni who are already benefiting from meaningful connections.
              </p>
              <ul className="mt-6 space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 bg-primary hover:bg-primary/90">
                <Link to="/auth?mode=signup">
                  Join AllySphere
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <img 
                src={collegeCampus} 
                alt="Anjuman College of Engineering and Technology Campus" 
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-elevated"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Fundraising Teaser */}
      <section className="border-t border-border bg-gradient-to-r from-primary/5 to-accent/5 py-12">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Heart className="h-4 w-4" />
              Give Back to Your Alma Mater
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Support the Next Generation
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Contribute to scholarships, infrastructure, and college initiatives. 
              Your donations help shape the future of ACET students.
            </p>
            <Button asChild size="lg" className="mt-6 bg-primary hover:bg-primary/90">
              <Link to="/auth?mode=signup">
                Start Contributing
                <Heart className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Ready to Connect?
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Join the AllySphere community and unlock your professional potential.
            </p>
            <Button asChild size="lg" className="mt-6 bg-primary hover:bg-primary/90">
              <Link to="/auth?mode=signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
