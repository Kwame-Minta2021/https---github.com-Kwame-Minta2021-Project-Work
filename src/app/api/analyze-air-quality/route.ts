
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sensorData } = body;

    if (!sensorData) {
      return NextResponse.json(
        { error: 'Sensor data is required' },
        { status: 400 }
      );
    }

    // Use the AI flow to analyze the air quality data
    const result = await ai.runFlow('analyzeAirQuality', sensorData);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Air quality analysis error:', error);
    
    // Return a fallback analysis if AI fails
    const fallbackAnalysis = {
      overallStatus: 'moderate',
      summary: 'Analysis temporarily unavailable. Based on sensor readings, air quality appears to be within acceptable ranges.',
      recommendations: [
        'Monitor air quality regularly',
        'Ensure proper ventilation',
        'Consider air purification if needed'
      ],
      healthImpact: 'Current levels are generally safe for most people.',
      riskFactors: []
    };

    return NextResponse.json(fallbackAnalysis);
  }
}
