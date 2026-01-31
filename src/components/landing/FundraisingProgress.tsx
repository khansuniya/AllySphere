import React from 'react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Target, ArrowRight, TrendingUp } from 'lucide-react';

interface FundraisingProgressProps {
  currentAmount?: number;
  targetAmount?: number;
  donorCount?: number;
  campaignTitle?: string;
}

const FundraisingProgress: React.FC<FundraisingProgressProps> = ({
  currentAmount = 2450000, // ₹24.5 Lakhs raised
  targetAmount = 5000000, // ₹50 Lakhs target
  donorCount = 342,
  campaignTitle = "Campus Development Fund 2025"
}) => {
  const progressPercentage = Math.min((currentAmount / targetAmount) * 100, 100);
  
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakhs`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  return (
    <section className="py-12 border-y border-border bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
      <div className="container">
        <Card className="border-2 border-primary/20 bg-card/80 backdrop-blur overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Left: Info */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-3">
                  <TrendingUp className="h-4 w-4" />
                  Active Campaign
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">
                  {campaignTitle}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Help us build a better future for ACET students with modern facilities and infrastructure.
                </p>
              </div>

              {/* Center: Progress */}
              <div className="flex-1 lg:max-w-md">
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Raised</p>
                      <p className="text-2xl md:text-3xl font-bold text-primary">
                        {formatCurrency(currentAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Goal</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(targetAmount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Progress value={progressPercentage} className="h-4 bg-muted" />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 text-xs font-medium text-primary-foreground"
                      style={{ left: `${Math.max(progressPercentage / 2, 10)}%` }}
                    >
                      {progressPercentage.toFixed(0)}%
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span><strong className="text-foreground">{donorCount}</strong> donors</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span><strong className="text-foreground">{formatCurrency(targetAmount - currentAmount)}</strong> to go</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: CTA */}
              <div className="flex flex-col gap-2 lg:items-end">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 w-full lg:w-auto">
                  <Link to="/auth?redirect=/fundraising">
                    <Heart className="h-4 w-4 mr-2" />
                    Donate Now
                  </Link>
                </Button>
                <Button asChild variant="link" size="sm" className="text-muted-foreground">
                  <Link to="/auth?redirect=/fundraising">
                    View all campaigns
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FundraisingProgress;
