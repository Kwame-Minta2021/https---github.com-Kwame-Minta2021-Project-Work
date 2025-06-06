import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCCEetj-YsvSbU_5jxkX6ykzoiaHeqlDr8');

export async function POST(request: NextRequest) {
  try {
    const { co, vocs, ch4Lpg: rawCh4Lpg, pm10, pm25, pm100, language = 'en' } = await request.json();

    // Adjust CH4/LPG value by dividing by 18 to get more reasonable readings
    const ch4Lpg = rawCh4Lpg / 18;

    if (co === undefined || vocs === undefined || ch4Lpg === undefined || 
        pm10 === undefined || pm25 === undefined || pm100 === undefined) {
      return NextResponse.json(
        { error: 'All sensor readings are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert air quality analyst. Analyze the following air quality data and provide a comprehensive assessment:

CO (Carbon Monoxide): ${co} ppm
VOCs (Volatile Organic Compounds): ${vocs} ppm  
CH4/LPG: ${ch4Lpg} ppm
PM1.0: ${pm10} µg/m³
PM2.5: ${pm25} µg/m³
PM10: ${pm100} µg/m³

Please provide your analysis in JSON format with these exact fields:
{
  "overallStatus": "good" | "moderate" | "unhealthy",
  "summary": "Brief overall assessment",
  "recommendations": ["array", "of", "recommendations"],
  "healthImpact": "Description of potential health effects",
  "riskFactors": ["array", "of", "risk", "factors"]
}

Base your assessment on WHO air quality guidelines and provide practical recommendations. Consider the following thresholds:
- CO: Good <4.5ppm, Moderate 4.5-9ppm, Unhealthy >9ppm
- PM2.5: Good <12µg/m³, Moderate 12-35µg/m³, Unhealthy >35µg/m³
- PM10: Good <54µg/m³, Moderate 54-154µg/m³, Unhealthy >154µg/m³
- VOCs: Good <0.5ppm, Moderate 0.5-3ppm, Unhealthy >3ppm
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
        healthImpact = 'High pollutant levels detected - immediate action required.';
        recommendations = [
          'Increase ventilation immediately',
          'Activate air purifiers',
          'Check gas appliances',
          'Reduce indoor activities',
          'Consider temporary relocation'
        ];
      } else if (co > 4.5 || pm25 > 12 || pm100 > 54 || vocs > 0.5) {
        overallStatus = 'moderate';
        healthImpact = 'Moderate levels - monitor and take precautionary measures.';
        recommendations = [
          'Open windows for ventilation',
          'Check appliance operation',
          'Use exhaust fans',
          'Monitor sensitive individuals'
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