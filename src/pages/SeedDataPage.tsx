import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import alumniData from '@/data/alumni-seed-data.json';
import { Database, Upload, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const SeedDataPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setProgress(0);
    setResults(null);

    try {
      // Seed in batches to avoid timeout
      const batchSize = 10;
      const totalBatches = Math.ceil(alumniData.length / batchSize);
      let totalSuccess = 0;
      let totalFailed = 0;
      const allErrors: string[] = [];

      for (let i = 0; i < totalBatches; i++) {
        const batch = alumniData.slice(i * batchSize, (i + 1) * batchSize);
        
        const { data, error } = await supabase.functions.invoke('seed-alumni', {
          body: { alumni: batch },
        });

        if (error) {
          throw error;
        }

        if (data) {
          totalSuccess += data.success || 0;
          totalFailed += data.failed || 0;
          if (data.errors) {
            allErrors.push(...data.errors);
          }
        }

        setProgress(((i + 1) / totalBatches) * 100);
      }

      setResults({
        success: totalSuccess,
        failed: totalFailed,
        errors: allErrors.slice(0, 10), // Only show first 10 errors
      });

      toast({
        title: 'Seeding Complete',
        description: `Successfully created ${totalSuccess} alumni profiles.`,
      });
    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: 'Error',
        description: 'Failed to seed alumni data. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Seed Alumni Database</h1>
          <p className="mt-1 text-muted-foreground">
            Import alumni profiles from the provided dataset
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Alumni Dataset</CardTitle>
                <CardDescription>
                  {alumniData.length} alumni profiles ready to import
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!loading && !results && (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-2">This will:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Create auth accounts for each alumni (password: Alumni@123)</li>
                    <li>Create profile records with personal details</li>
                    <li>Create alumni_details records with professional info</li>
                    <li>Skip existing emails (no duplicates)</li>
                  </ul>
                </div>
                <Button onClick={handleSeed} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Start Seeding
                </Button>
              </div>
            )}

            {loading && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Importing alumni profiles...
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round(progress)}% complete
                </p>
              </div>
            )}

            {results && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 rounded-lg bg-success/10 p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold text-success">{results.success}</p>
                    <p className="text-sm text-muted-foreground">Successful</p>
                  </div>
                  <div className="flex-1 rounded-lg bg-destructive/10 p-4 text-center">
                    <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                    <p className="text-2xl font-bold text-destructive">{results.failed}</p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                </div>

                {results.errors.length > 0 && (
                  <div className="rounded-lg border border-destructive/20 p-4">
                    <p className="text-sm font-medium text-destructive mb-2">Errors:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                      {results.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate('/alumni')} className="flex-1">
                    View Alumni Directory
                  </Button>
                  <Button onClick={() => setResults(null)} className="flex-1">
                    Seed More
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SeedDataPage;
