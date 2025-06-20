
// src/ai/flows/forecast-air-quality-flow.ts
'use server';
/**
 * @fileOverview Generates a textual air quality forecast for the coming weeks.
 *
 * - forecastAirQuality - A function that provides a general air quality forecast.
 * - ForecastAirQualityInput - The input type for the forecastAirQuality function.
 * - ForecastAirQualityOutput - The return type for the forecastAirQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastAirQualityInputSchema = z.object({
  language: z.string().describe('The language for the forecast (e.g., "en", "fr").'),
  currentCO: z.number().optional().describe('Current Carbon Monoxide (CO) level in ppm.'),
  currentVOCs: z.number().optional().describe('Current Volatile Organic Compounds (VOCs) level in ppm.'),
  currentPM25: z.number().optional().describe('Current Particulate Matter 2.5 (PM2.5) level in ug/m3.'),
});
export type ForecastAirQualityInput = z.infer<typeof ForecastAirQualityInputSchema>;

const ForecastAirQualityOutputSchema = z.object({
  weeklyForecast: z.string().describe('A general, textual forecast for air quality over the next 1-2 weeks. This response should be in the language specified in the input and contain no markdown formatting.'),
});
export type ForecastAirQualityOutput = z.infer<typeof ForecastAirQualityOutputSchema>;

export async function forecastAirQuality(input: ForecastAirQualityInput): Promise<ForecastAirQualityOutput> {
  return forecastAirQualityFlow(input);
}

const forecastPrompt = ai.definePrompt({
  name: 'forecastAirQualityPrompt',
  input: {schema: ForecastAirQualityInputSchema},
  output: {schema: ForecastAirQualityOutputSchema},
  prompt: `You are an environmental AI assistant providing generalized air quality forecasts.
Based on typical seasonal patterns and general knowledge (not real-time meteorological data), provide a brief air quality forecast for the next 1-2 weeks.
Consider factors like potential for temperature inversions, common pollutant sources, and general weather trends if applicable for a generic urban/suburban area.
The forecast should be advisory and not overly specific.

IMPORTANT: Respond ENTIRELY in the language specified by the '{{language}}' parameter. For example, if '{{language}}' is 'fr', your entire response must be in French.

IMPORTANT RESPONSE FORMATTING:
- Provide your response as plain text IN THE SPECIFIED LANGUAGE ({{language}}).
- Do NOT use any markdown formatting (e.g., no asterisks for bolding or italics, no hashes for headers, no lists starting with hyphens or asterisks, no markdown links).
- The "weeklyForecast" field should be a simple string without any special formatting characters.

Current (optional) context:
{{#if currentCO}}CO: {{currentCO}} ppm{{/if}}
{{#if currentVOCs}}VOCs: {{currentVOCs}} ppm{{/if}}
{{#if currentPM25}}PM2.5: {{currentPM25}} µg/m³{{/if}}
Language for response: {{language}}

Generate the "weeklyForecast".
`,
});

const forecastAirQualityFlow = ai.defineFlow(
  {
    name: 'forecastAirQualityFlow',
    inputSchema: ForecastAirQualityInputSchema,
    outputSchema: ForecastAirQualityOutputSchema,
  },
  async (input) => {
    const MAX_ATTEMPTS = 5; // 1 initial + 4 retries
    let attempts = 0;
    let lastError: any = null;

    while (attempts < MAX_ATTEMPTS) {
      try {
        const {output} = await forecastPrompt(input);
        return output!;
      } catch (error: any) {
        attempts++;
        lastError = error;
        const errorMessage = typeof error.message === 'string' ? error.message.toLowerCase() : '';
        const isRetriableError = errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('service unavailable');

        if (isRetriableError && attempts < MAX_ATTEMPTS) {
          const delay = 1000 * attempts; // e.g., 1s, 2s, 3s, 4s
          console.warn(`forecastAirQualityFlow attempt ${attempts} (max ${MAX_ATTEMPTS}) failed due to model overload. Retrying in ${delay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error(`forecastAirQualityFlow failed after ${attempts} attempt(s). Last error:`, lastError);
          throw lastError;
        }
      }
    }
    // This should only be reached if MAX_ATTEMPTS is 0 or loop logic is flawed,
    // but as a fallback, rethrow the last known error.
    if (lastError) {
        console.error(`forecastAirQualityFlow ultimately failed after ${attempts} attempts. Last error:`, lastError);
        throw lastError;
    }
    // Should not happen if MAX_ATTEMPTS > 0
    throw new Error("forecastAirQualityFlow failed after max retries without a specific caught error.");
  }
);
