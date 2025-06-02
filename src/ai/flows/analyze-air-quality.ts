
// src/ai/flows/analyze-air-quality.ts
'use server';
/**
 * @fileOverview Analyzes air quality data and provides a health impact assessment and best actions, simulating an RL model.
 *
 * - analyzeAirQuality - A function that analyzes air quality and provides health effects and best actions.
 * - AnalyzeAirQualityInput - The input type for the analyzeAirQuality function.
 * - AnalyzeAirQualityOutput - The return type for the analyzeAirQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAirQualityInputSchema = z.object({
  co: z.number().describe('Carbon Monoxide (CO) level in ppm.'),
  vocs: z.number().describe('Volatile Organic Compounds (VOCs) level in ppm.'),
  ch4Lpg: z.number().describe('Methane/Liquefied Petroleum Gas (CH4/LPG) level in ppm.'),
  pm10: z.number().describe('Particulate Matter 1.0 (PM1.0) level in ug/m3.'),
  pm25: z.number().describe('Particulate Matter 2.5 (PM2.5) level in ug/m3.'),
  pm100: z.number().describe('Particulate Matter 10 (PM10) level in ug/m3.'),
  language: z.string().describe('The language for the response (e.g., "en", "fr").'),
});
export type AnalyzeAirQualityInput = z.infer<typeof AnalyzeAirQualityInputSchema>;

const AnalyzeAirQualityOutputSchema = z.object({
  effectOnHumanHealth: z.string().describe('A concise, user-friendly statement detailing the health implications of the detected air quality levels, as if determined by an RL model. This response should be in the language specified in the input and contain no markdown formatting.'),
  bestActionToReducePresence: z.string().describe('Specific, actionable recommendations to improve air quality, including precautionary measures to take and advice on how to reduce gas concentrations. This response should be in the language specified in the input and contain no markdown formatting.'),
});
export type AnalyzeAirQualityOutput = z.infer<typeof AnalyzeAirQualityOutputSchema>;

export async function analyzeAirQuality(input: AnalyzeAirQualityInput): Promise<AnalyzeAirQualityOutput> {
  return analyzeAirQualityFlow(input);
}

const analyzeAirQualityPrompt = ai.definePrompt({
  name: 'analyzeAirQualityRLSimPrompt', 
  input: {schema: AnalyzeAirQualityInputSchema},
  output: {schema: AnalyzeAirQualityOutputSchema},
  prompt: `You are an advanced Reinforcement Learning (RL) model pre-trained on diverse air quality datasets, health outcomes, and environmental interventions.
Your task is to analyze the following air quality data.
Based on your learned policy, assess the current conditions, predict the "Effect on Human Health", and recommend the "Best Action to Reduce Presence" of pollutants.

IMPORTANT: Respond ENTIRELY in the language specified by the '{{language}}' parameter. For example, if '{{language}}' is 'fr', your entire response for "Effect on Human Health" and "Best Action to Reduce Presence" must be in French.

IMPORTANT RESPONSE FORMATTING:
- Provide ALL responses as plain text IN THE SPECIFIED LANGUAGE ({{language}}).
- Do NOT use any markdown formatting (e.g., no asterisks for bolding or italics, no hashes for headers, no lists starting with hyphens or asterisks, no markdown links).
- Ensure that the "Effect on Human Health" and "Best Action to Reduce Presence" fields are simple strings without any special formatting characters. All content should be suitable for direct display as plain text.

Air Quality Data:
CO (Carbon Monoxide): {{co}} ppm
VOCs (Volatile Organic Compounds): {{vocs}} ppm
CH4/LPG (Methane/Liquefied Petroleum Gas): {{ch4Lpg}} ppm
PM1.0 (Particulate Matter 1.0): {{pm10}} ug/m3
PM2.5 (Particulate Matter 2.5): {{pm25}} ug/m3
PM10 (Particulate Matter 10): {{pm100}} ug/m3
Language for response: {{language}}

Based on this data, provide:
1.  Effect on Human Health: (Plain text, in {{language}}, no markdown)
2.  Best Action to Reduce Presence: (Plain text, in {{language}}, no markdown, including precautionary measures and advice on reducing pollutant concentrations)
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const analyzeAirQualityFlow = ai.defineFlow(
  {
    name: 'analyzeAirQualityRLSimFlow', 
    inputSchema: AnalyzeAirQualityInputSchema,
    outputSchema: AnalyzeAirQualityOutputSchema,
  },
  async (input) => {
    const MAX_ATTEMPTS = 6; // 1 initial + 5 retries
    let attempts = 0;
    let lastError: any = null;

    while (attempts < MAX_ATTEMPTS) {
      try {
        const {output} = await analyzeAirQualityPrompt(input);
        return output!;
      } catch (error: any) {
        attempts++;
        lastError = error; 
        const errorMessage = typeof error.message === 'string' ? error.message.toLowerCase() : '';
        const isRetriableError = errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('service unavailable');

        if (isRetriableError && attempts < MAX_ATTEMPTS) {
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s for the 5 retries
          const delay = 1000 * Math.pow(2, attempts - 1); 
          console.warn(`analyzeAirQualityFlow attempt ${attempts} of ${MAX_ATTEMPTS-1} retries failed for prompt '${analyzeAirQualityPrompt.name}'. Retrying in ${delay / 1000}s... Error: ${error.message}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error(`analyzeAirQualityFlow failed for prompt '${analyzeAirQualityPrompt.name}' after ${attempts} attempt(s) (including initial). Last error:`, lastError);
          throw lastError; 
        }
      }
    }
    
    // This part should ideally not be reached if MAX_ATTEMPTS > 0 and loop/throw logic is correct.
    // However, as a safeguard:
    if (lastError) {
        console.error(`analyzeAirQualityFlow ultimately failed for prompt '${analyzeAirQualityPrompt.name}' after ${attempts} attempts. Last error:`, lastError);
        throw lastError;
    }
    
    // Fallback, should not happen with MAX_ATTEMPTS > 0.
    throw new Error(`analyzeAirQualityFlow failed for prompt '${analyzeAirQualityPrompt.name}' after max retries. Unknown error during retry loop.`);
  }
);

