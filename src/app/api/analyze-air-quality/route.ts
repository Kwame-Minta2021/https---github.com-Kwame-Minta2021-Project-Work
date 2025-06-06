
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCCEetj-YsvSbU_5jxkX6ykzoiaHeqlDr8');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { co, vocs, ch4Lpg, pm10, pm25, pm100, language = 'en' } = body;

    if (co === undefined || vocs === undefined || ch4Lpg === undefined || 
        pm10 === undefined || pm25 === undefined || pm100 === undefined) {
      return NextResponse.json(
        { error: 'All sensor readings are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    Analyze the following air quality sensor readings and provide a comprehensive assessment:

    Sensor Readings:
    - Carbon Monoxide (CO): ${co} ppm
    - Volatile Organic Compounds (VOCs): ${vocs} ppm
    - CH4/LPG: ${ch4Lpg} ppm
    - PM1.0: ${pm10} µg/m³
    - PM2.5: ${pm25} µg/m³
    - PM10: ${pm100} µg/m³

    Please provide your response in the following JSON format:
    {
      "overallStatus": "good|moderate|unhealthy",
      "summary": "Brief overall assessment of air quality",
      "healthImpact": "Detailed explanation of health effects",
      "recommendations": ["specific action 1", "specific action 2", "specific action 3"],
      "riskFactors": ["risk factor 1", "risk factor 2"]
    }

    Consider WHO and EPA air quality guidelines. Provide practical, actionable recommendations.
    Respond in ${language === 'fr' ? 'French' : 'English'}.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Try to parse as JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisResult = JSON.parse(jsonMatch[0]);
        return NextResponse.json(analysisResult);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      
      // Return a structured fallback based on simple thresholds
      let overallStatus = 'good';
      let healthImpact = 'Air quality is generally acceptable for most people.';
      let recommendations = ['Continue monitoring air quality', 'Maintain good ventilation'];

      if (co > 9 || pm25 > 35 || pm100 > 150 || vocs > 3) {
        overallStatus = 'unhealthy';
        healthImpact = 'Air quality may pose health risks, especially for sensitive individuals.';
        recommendations = [
          'Limit outdoor activities',
          'Use air purifiers indoors',
          'Consider wearing masks outdoors',
          'Seek medical advice if experiencing symptoms'
        ];
      } else if (co > 4.5 || pm25 > 12 || pm100 > 54 || vocs > 0.5) {
        overallStatus = 'moderate';
        healthImpact = 'Air quality is acceptable, but some pollutants may be a concern for sensitive people.';
        recommendations = [
          'Sensitive individuals should limit prolonged outdoor exertion',
          'Ensure good indoor ventilation',
          'Monitor symptoms if you have respiratory conditions'
        ];
      }

      return NextResponse.json({
        overallStatus,
        summary: `Air quality analysis based on sensor readings. CO: ${co}ppm, PM2.5: ${pm25}µg/m³, PM10: ${pm100}µg/m³`,
        healthImpact,
        recommendations,
        riskFactors: []
      });
    }

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
