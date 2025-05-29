
import { analyzeAirQuality, type AnalyzeAirQualityInput, type AnalyzeAirQualityOutput } from "@/ai/flows/analyze-air-quality";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from '@/i18n'; 

interface AIAnalyzerSectionProps {
  readings: Omit<AnalyzeAirQualityInput, 'language'>; // Receives raw readings without language
  lng: string; 
}

export default async function AIAnalyzerSection({ readings, lng }: AIAnalyzerSectionProps) {
  const { t } = await getTranslations(lng, 'common'); 
  let analysis: AnalyzeAirQualityOutput | null = null;
  let error = null;

  const aiInputWithLanguage: AnalyzeAirQualityInput = {
    ...readings,
    language: lng,
  };

  try {
    analysis = await analyzeAirQuality(aiInputWithLanguage);
  } catch (e) {
    console.error("AI Analyzer Error:", e);
    error = e instanceof Error ? e.message : "An unknown error occurred during AI analysis.";
    // Provide default empty strings for analysis in case of error to avoid undefined access
    analysis = { effectOnHumanHealth: "", bestActionToReducePresence: "" }; 
  }

  if (error) {
    return (
      <section id="analyzer" className="mb-8 scroll-mt-20">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">{t('aiAnalyzer')}</h2>
        <Card className="shadow-lg bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              {t('errorAnalyzingAirQuality')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">{t('errorTryAgain')}</p>
          </CardContent>
        </Card>
      </section>
    );
  }
  
  if (!analysis || (!analysis.effectOnHumanHealth && !analysis.bestActionToReducePresence)) {
     return (
      <section id="analyzer" className="mb-8 scroll-mt-20">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">{t('aiAnalyzer')}</h2>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                {t('rlModelAnalysis')}
            </CardTitle>
            <CardDescription>{t('rlModelAnalysisDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center"><AlertCircle className="h-5 w-5 mr-2 text-amber-500" />{t('effectOnHumanHealth')}</h3>
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center"><CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />{t('bestActionToReducePresence')}</h3>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section id="analyzer" className="mb-8 scroll-mt-20">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">{t('aiAnalyzer')}</h2>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            {t('rlModelAnalysis')}
          </CardTitle>
          <CardDescription>
            {t('rlModelAnalysisDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
              {t('effectOnHumanHealth')}
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {analysis.effectOnHumanHealth || "No specific health impact information available at this moment."}
            </p>
          </div>
          <hr className="my-4 border-border" />
          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
              {t('bestActionToReducePresence')}
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {analysis.bestActionToReducePresence || "No specific recommendations available at this moment."}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

