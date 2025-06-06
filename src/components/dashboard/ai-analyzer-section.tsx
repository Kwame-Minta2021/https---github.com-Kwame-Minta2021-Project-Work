'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Brain, CheckCircle, Info, AlertTriangle, Loader2, RefreshCw, TrendingUp, Shield, Wind, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AirQualityData } from '@/types';

interface AIAnalyzerSectionProps {
  readings: AirQualityData | null;
  lng: string;
}

interface AnalysisResult {
  overallStatus: 'good' | 'moderate' | 'unhealthy';
  summary: string;
  recommendations: string[];
  healthImpact: string;
  riskFactors: string[];
}

interface PollutantDetail {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'moderate' | 'unhealthy';
  percentage: number;
  icon: React.ReactNode;
  description: string;
}

export function AIAnalyzerSection({ readings, lng }: AIAnalyzerSectionProps) {
  const { t } = useTranslation();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);

  const analyzeAirQuality = async () => {
    if (!readings) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-air-quality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          co: readings.co?.value || 0,
          vocs: readings.vocs?.value || 0,
          ch4Lpg: readings.ch4Lpg?.value || 0,
          pm10: readings.pm1_0?.value || 0,
          pm25: readings.pm2_5?.value || 0,
          pm100: readings.pm10?.value || 0,
          language: lng,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      setAnalysis(result);
      setLastAnalysisTime(new Date());
    } catch (err) {
      console.error('AI Analysis Error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (readings && !analysis && !isAnalyzing) {
      analyzeAirQuality();
    }
  }, [readings]);

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
        return 'bg-green-50 text-green-700 border-green-200';
      case 'moderate':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'unhealthy':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPollutantStatus = (value: number, thresholds: any) => {
    if (!thresholds) return 'good';
    if (value > thresholds.unhealthy) return 'unhealthy';
    if (value > thresholds.moderate) return 'moderate';
    return 'good';
  };

  const getPollutantPercentage = (value: number, thresholds: any) => {
    if (!thresholds) return 0;
    const maxThreshold = thresholds.unhealthy * 1.5; // 150% of unhealthy threshold as max
    return Math.min((value / maxThreshold) * 100, 100);
  };

  const pollutantDetails: PollutantDetail[] = readings ? [
    {
      name: 'Carbon Monoxide',
      value: readings.co?.value || 0,
      unit: readings.co?.unit || 'ppm',
      status: getPollutantStatus(readings.co?.value || 0, readings.co?.thresholds),
      percentage: getPollutantPercentage(readings.co?.value || 0, readings.co?.thresholds),
      icon: <Zap className="h-4 w-4" />,
      description: 'Colorless, odorless gas from combustion'
    },
    {
      name: 'VOCs',
      value: readings.vocs?.value || 0,
      unit: readings.vocs?.unit || 'ppm',
      status: getPollutantStatus(readings.vocs?.value || 0, readings.vocs?.thresholds),
      percentage: getPollutantPercentage(readings.vocs?.value || 0, readings.vocs?.thresholds),
      icon: <Wind className="h-4 w-4" />,
      description: 'Organic compounds that evaporate at room temperature'
    },
    {
      name: 'PM2.5',
      value: readings.pm2_5?.value || 0,
      unit: readings.pm2_5?.unit || 'µg/m³',
      status: getPollutantStatus(readings.pm2_5?.value || 0, readings.pm2_5?.thresholds),
      percentage: getPollutantPercentage(readings.pm2_5?.value || 0, readings.pm2_5?.thresholds),
      icon: <Shield className="h-4 w-4" />,
      description: 'Fine particles that can penetrate deep into lungs'
    },
    {
      name: 'PM10',
      value: readings.pm10?.value || 0,
      unit: readings.pm10?.unit || 'µg/m³',
      status: getPollutantStatus(readings.pm10?.value || 0, readings.pm10?.thresholds),
      percentage: getPollutantPercentage(readings.pm10?.value || 0, readings.pm10?.thresholds),
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Inhalable particles from dust, pollen, and smoke'
    }
  ] : [];

  return (
    <section id="ai-analyzer" className="mb-8 scroll-mt-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">{t('aiAnalyzer')}</h2>
        {lastAnalysisTime && (
          <p className="text-sm text-muted-foreground">
            Last analyzed: {lastAnalysisTime.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main Analysis Card */}
        <Card className="shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-600" />
              {t('rlModelAnalysis')}
            </CardTitle>
            <CardDescription>
              AI-powered comprehensive air quality assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!readings && (
              <div className="text-center py-8 text-muted-foreground">
                <Wind className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('waitingForData')}</p>
              </div>
            )}

            {error && (
              <div className="text-center py-4">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button 
                  onClick={analyzeAirQuality} 
                  variant="outline"
                  disabled={!readings}
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('retryAnalysis')}
                </Button>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('analyzingData')}</p>
                  <p className="text-sm text-muted-foreground mt-2">This may take a few moments...</p>
                </div>
              </div>
            )}

            {analysis && !isAnalyzing && (
              <div className="space-y-6">
                {/* Overall Status */}
                <div className={`p-4 rounded-lg border-2 ${getStatusColor(analysis.overallStatus)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(analysis.overallStatus)}
                    <Badge variant="secondary" className="capitalize">
                      {analysis.overallStatus} Air Quality
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{analysis.summary}</p>
                </div>

                {/* Health Impact */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    Health Impact Assessment
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.healthImpact}
                  </p>
                </div>

                {/* Risk Factors */}
                {analysis.riskFactors && analysis.riskFactors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Risk Factors
                    </h4>
                    <div className="grid gap-2">
                      {analysis.riskFactors.map((risk, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Recommended Actions
                    </h4>
                    <div className="grid gap-3">
                      {analysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-sm text-green-800">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Refresh Button */}
                <div className="flex justify-center">
                  <Button 
                    onClick={analyzeAirQuality} 
                    variant="outline"
                    size="sm"
                    disabled={isAnalyzing}
                    className="w-full max-w-sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('refreshAnalysis')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pollutant Details Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Pollutant Breakdown
            </CardTitle>
            <CardDescription>
              Detailed analysis of individual pollutant levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {readings ? (
              <div className="space-y-6">
                {pollutantDetails.map((pollutant, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {pollutant.icon}
                        <span className="font-medium text-sm">{pollutant.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(pollutant.status)}`}
                        >
                          {pollutant.status}
                        </Badge>
                        <span className="text-sm font-mono">
                          {pollutant.value} {pollutant.unit}
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={pollutant.percentage} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {pollutant.description}
                    </p>
                    {index < pollutantDetails.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Waiting for sensor data...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}