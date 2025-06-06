
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Brain, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AirQualityData {
  co: { value: number; unit: string };
  vocs: { value: number; unit: string };
  ch4Lpg: { value: number; unit: string };
  pm1_0: { value: number; unit: string };
  pm2_5: { value: number; unit: string };
  pm10: { value: number; unit: string };
}

interface AIAnalyzerSectionProps {
  airData: AirQualityData | null;
}

interface AnalysisResult {
  overallStatus: 'good' | 'moderate' | 'unhealthy';
  summary: string;
  recommendations: string[];
  healthImpact: string;
  riskFactors: string[];
}

export function AIAnalyzerSection({ airData }: AIAnalyzerSectionProps) {
  const { t } = useTranslation();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeAirQuality = async () => {
    if (!airData) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-air-quality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sensorData: {
            CO_ppm: airData.co.value,
            VOCs_ppm: airData.vocs.value,
            CH4_LPG_ppm: airData.ch4Lpg.value,
            PM1_0_ug_m3: airData.pm1_0.value,
            PM2_5_ug_m3: airData.pm2_5.value,
            PM10_ug_m3: airData.pm10.value,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (err) {
      console.error('AI Analysis Error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (airData && !analysis && !isAnalyzing) {
      analyzeAirQuality();
    }
  }, [airData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'moderate':
        return <Info className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-blue-600" />
          {t('aiAnalysis')}
        </CardTitle>
        <CardDescription>
          {t('aiAnalysisDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!airData && (
          <div className="text-center py-8 text-muted-foreground">
            {t('waitingForData')}
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={analyzeAirQuality} 
              variant="outline"
              disabled={!airData}
            >
              {t('retryAnalysis')}
            </Button>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-muted-foreground">{t('analyzingData')}</span>
          </div>
        )}

        {analysis && !isAnalyzing && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(analysis.overallStatus)}
                <span className="font-medium">{t('overallStatus')}</span>
              </div>
              <Badge className={getStatusColor(analysis.overallStatus)}>
                {t(`status_${analysis.overallStatus}`)}
              </Badge>
            </div>

            {/* Summary */}
            <div>
              <h4 className="font-semibold mb-2">{t('summary')}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            {/* Health Impact */}
            <div>
              <h4 className="font-semibold mb-2">{t('healthImpact')}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.healthImpact}
              </p>
            </div>

            {/* Risk Factors */}
            {analysis.riskFactors && analysis.riskFactors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">{t('riskFactors')}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysis.riskFactors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">{t('recommendations')}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Refresh Button */}
            <div className="pt-4 border-t">
              <Button 
                onClick={analyzeAirQuality} 
                variant="outline"
                size="sm"
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('analyzing')}
                  </>
                ) : (
                  t('refreshAnalysis')
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
