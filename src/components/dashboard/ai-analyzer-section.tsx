'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Brain, CheckCircle, Info, AlertTriangle, Loader2, RefreshCw, TrendingUp, Shield, Wind, Zap, Activity, Waves, Eye, Target } from 'lucide-react';
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
  gradient: string;
}

export function AIAnalyzerSection({ readings, lng }: AIAnalyzerSectionProps) {
  const { t } = useTranslation();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  const analyzeAirQuality = async () => {
    if (!readings) return;

    setIsAnalyzing(true);
    setError(null);
    setAnimationKey(prev => prev + 1);

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
        return <CheckCircle className="h-6 w-6 text-emerald-500" />;
      case 'moderate':
        return <Info className="h-6 w-6 text-amber-500" />;
      case 'unhealthy':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      default:
        return <Info className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'good':
        return 'from-emerald-50 to-green-50 border-emerald-200';
      case 'moderate':
        return 'from-amber-50 to-yellow-50 border-amber-200';
      case 'unhealthy':
        return 'from-red-50 to-rose-50 border-red-200';
      default:
        return 'from-gray-50 to-slate-50 border-gray-200';
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
    const maxThreshold = thresholds.unhealthy * 1.5;
    return Math.min((value / maxThreshold) * 100, 100);
  };

  const pollutantDetails: PollutantDetail[] = readings ? [
    {
      name: 'Carbon Monoxide',
      value: readings.co?.value || 0,
      unit: readings.co?.unit || 'ppm',
      status: getPollutantStatus(readings.co?.value || 0, readings.co?.thresholds),
      percentage: getPollutantPercentage(readings.co?.value || 0, readings.co?.thresholds),
      icon: <Zap className="h-5 w-5" />,
      description: 'Odorless gas from incomplete combustion',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      name: 'VOCs',
      value: readings.vocs?.value || 0,
      unit: readings.vocs?.unit || 'ppm',
      status: getPollutantStatus(readings.vocs?.value || 0, readings.vocs?.thresholds),
      percentage: getPollutantPercentage(readings.vocs?.value || 0, readings.vocs?.thresholds),
      icon: <Wind className="h-5 w-5" />,
      description: 'Organic compounds from solvents & fuels',
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      name: 'PM2.5',
      value: readings.pm2_5?.value || 0,
      unit: readings.pm2_5?.unit || 'µg/m³',
      status: getPollutantStatus(readings.pm2_5?.value || 0, readings.pm2_5?.thresholds),
      percentage: getPollutantPercentage(readings.pm2_5?.value || 0, readings.pm2_5?.thresholds),
      icon: <Shield className="h-5 w-5" />,
      description: 'Fine particles penetrating deep into lungs',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'PM10',
      value: readings.pm10?.value || 0,
      unit: readings.pm10?.unit || 'µg/m³',
      status: getPollutantStatus(readings.pm10?.value || 0, readings.pm10?.thresholds),
      percentage: getPollutantPercentage(readings.pm10?.value || 0, readings.pm10?.thresholds),
      icon: <Waves className="h-5 w-5" />,
      description: 'Inhalable particles from dust & pollen',
      gradient: 'from-indigo-500 to-purple-500'
    }
  ] : [];

  return (
    <section id="ai-analyzer" className="mb-8 scroll-mt-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RL Model Analysis
              </h2>
              <p className="text-muted-foreground">BreatheEasy Device • AI-Powered Assessment</p>
            </div>
          </div>
        </div>
        {lastAnalysisTime && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              Last analyzed: {lastAnalysisTime.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Analysis Card - Takes 2 columns */}
        <Card className="lg:col-span-2 shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Intelligent Air Quality Assessment
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Real-time analysis from your BreatheEasy monitoring device
                </CardDescription>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {!readings && (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 animate-pulse"></div>
                  </div>
                  <Wind className="h-16 w-16 mx-auto mb-6 text-blue-500 relative z-10" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Connecting to BreatheEasy Device</h3>
                <p className="text-gray-600">Waiting for sensor data from your monitoring device...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 max-w-md mx-auto">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Analysis Error</h3>
                  <p className="text-red-600 mb-6">{error}</p>
                  <Button 
                    onClick={analyzeAirQuality} 
                    variant="outline"
                    disabled={!readings}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Analysis
                  </Button>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin mx-auto flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                        <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">Analyzing Air Quality Data</h3>
                    <p className="text-gray-600">Processing sensor readings through RL model...</p>
                    <div className="flex items-center justify-center gap-1 mt-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analysis && !isAnalyzing && (
              <div key={animationKey} className="space-y-8 animate-in fade-in-50 duration-700">
                {/* Overall Status */}
                <div className={`p-6 rounded-2xl border-2 bg-gradient-to-r ${getStatusGradient(analysis.overallStatus)} transform transition-all duration-500 hover:scale-[1.02]`}>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-white/80 backdrop-blur-sm">
                      {getStatusIcon(analysis.overallStatus)}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="secondary" 
                          className="text-sm font-semibold px-3 py-1 bg-white/90 backdrop-blur-sm capitalize"
                        >
                          {analysis.overallStatus} Air Quality
                        </Badge>
                        <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></div>
                        <span className="text-sm font-medium opacity-80">Live Assessment</span>
                      </div>
                      <p className="text-base font-medium leading-relaxed">{analysis.summary}</p>
                    </div>
                  </div>
                </div>

                {/* Health Impact */}
                <div className="bg-white rounded-xl p-6 border shadow-sm">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    Health Impact Assessment
                  </h4>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-gray-700 leading-relaxed">{analysis.healthImpact}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border shadow-sm">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      Immediate Actions
                      <Badge variant="outline" className="ml-auto">
                        {analysis.recommendations.length} suggestions
                      </Badge>
                    </h4>
                    <div className="grid gap-3">
                      {analysis.recommendations.slice(0, 3).map((rec, index) => (
                        <div 
                          key={index} 
                          className="group flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-all duration-300"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                            {index + 1}
                          </div>
                          <span className="text-green-800 font-medium flex-1">{rec}</span>
                          <Eye className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                      {analysis.recommendations.length > 3 && (
                        <div className="text-center py-2">
                          <Badge variant="secondary" className="text-xs">
                            +{analysis.recommendations.length - 3} more recommendations available
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Risk Factors */}
                {analysis.riskFactors && analysis.riskFactors.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border shadow-sm">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      </div>
                      Risk Factors Detected
                    </h4>
                    <div className="space-y-3">
                      {analysis.riskFactors.map((risk, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border-l-3 border-amber-400">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                          <span className="text-amber-800 text-sm leading-relaxed">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Refresh Button */}
                <div className="pt-4">
                  <Button 
                    onClick={analyzeAirQuality} 
                    variant="outline"
                    disabled={isAnalyzing}
                    className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all duration-300"
                  >
                    <RefreshCw className="h-5 w-5 mr-3" />
                    Refresh Analysis
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pollutant Details Card - Takes 1 column */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Sensor Readings</CardTitle>
                <CardDescription className="text-sm">Live data from BreatheEasy device</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {readings ? (
              <div className="space-y-6">
                {pollutantDetails.map((pollutant, index) => (
                  <div key={index} className="group space-y-3 p-3 rounded-lg bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg bg-gradient-to-r ${pollutant.gradient} text-white group-hover:scale-105 transition-transform`}>
                          {pollutant.icon}
                        </div>
                        <div>
                          <span className="font-medium text-gray-800 text-sm">{pollutant.name}</span>
                          <p className="text-xs text-gray-500">{pollutant.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-gray-800">
                          {pollutant.value} <span className="text-xs font-normal text-gray-500">{pollutant.unit}</span>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs mt-0.5 ${
                            pollutant.status === 'good' ? 'bg-emerald-100 text-emerald-700' :
                            pollutant.status === 'moderate' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {pollutant.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Level</span>
                        <span>{Math.round(pollutant.percentage)}%</span>
                      </div>
                      <Progress 
                        value={pollutant.percentage} 
                        className="h-1.5 bg-gray-100"
                      />
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Activity className="h-4 w-4" />
                    <span className="font-medium">Device Status: Active</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">All sensors operational and reporting</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-100 to-blue-100 animate-pulse mx-auto flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Initializing Sensors</h3>
                  <p className="text-sm text-gray-600">Connecting to BreatheEasy device...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}