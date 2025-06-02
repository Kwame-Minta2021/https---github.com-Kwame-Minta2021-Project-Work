
'use server';

/**
 * @fileOverview An interactive AI chatbot for answering user questions about air quality.
 *
 * - askChatbot - A function that handles user questions and returns chatbot responses.
 * - AskChatbotInput - The input type for the askChatbot function.
 * - AskChatbotOutput - The return type for the askChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskChatbotInputSchema = z.object({
  question: z.string().describe('The user question about air quality.'),
  coLevel: z.number().describe('The current level of Carbon Monoxide (CO) in ppm.'),
  vocLevel: z.number().describe('The current level of Volatile Organic Compounds (VOCs) in ppm.'),
  ch4LpgLevel: z.number().describe('The current level of Methane/Liquefied Petroleum Gas (CH4/LPG) in ppm.'),
  pm1Level: z.number().describe('The current level of Particulate Matter 1.0 (PM1.0) in ug/m3.'),
  pm25Level: z.number().describe('The current level of Particulate Matter 2.5 (PM2.5) in ug/m3.'),
  pm10Level: z.number().describe('The current level of Particulate Matter 10 (PM10) in ug/m3.'),
  language: z.string().describe('The language for the response (e.g., "en", "fr").'),
});
export type AskChatbotInput = z.infer<typeof AskChatbotInputSchema>;

const AskChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user question. This response should be in the language specified in the input and contain no markdown formatting.'),
});
export type AskChatbotOutput = z.infer<typeof AskChatbotOutputSchema>;

export async function askChatbot(input: AskChatbotInput): Promise<AskChatbotOutput> {
  return askChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askChatbotPrompt',
  input: {schema: AskChatbotInputSchema},
  output: {schema: AskChatbotOutputSchema},
  prompt: `You are an AI chatbot for the "BreatheEasy Dashboard", specializing in air quality information related to this project.
Your primary function is to answer user questions about:
- Current gas conditions and their levels as displayed on the dashboard.
- The effects of specific gases/particulates on health (general information, not medical advice).
- Recommended actions for improving air quality based on general knowledge and the type of pollutants.
- Interpretations of displayed sensor readings.
- Historical data trends if the user refers to data available on the dashboard.
- How the AI analyzer (simulated RL model) on the dashboard works.

IMPORTANT: Respond ENTIRELY in the language specified by the '{{language}}' parameter. For example, if '{{language}}' is 'fr', your entire response must be in French.

IMPORTANT RESPONSE FORMATTING:
- Provide your response as plain text IN THE SPECIFIED LANGUAGE ({{language}}).
- Do NOT use any markdown formatting. Specifically, do not use double asterisks (**) for bolding, hashes (#) for headers, hyphens (-) or asterisks (*) for lists, or markdown links like [text](url).
- Your entire response should be a single block of plain text, suitable for direct display in a chat interface.

You have access to the following real-time sensor readings from the dashboard:
- CO (MQ-9): {{{coLevel}}} ppm
- VOCs (MQ-135): {{{vocLevel}}} ppm
- CH4/LPG (MQ-5): {{{ch4LpgLevel}}} ppm
- PM1.0: {{{pm1Level}}} ug/m3
- PM2.5: {{{pm25Level}}} ug/m3
- PM10: {{{pm10Level}}} ug/m3
Language for response: {{language}}

IMPORTANT SCOPE LIMITATIONS:
- You MUST strictly adhere to questions related to air quality, the BreatheEasy dashboard's data, and its features.
- If the user asks a question unrelated to these topics (e.g., general knowledge, personal advice not related to air quality, math problems, coding help, current events, etc.), you MUST politely decline to answer in the specified '{{language}}'.
- Example responses for out-of-scope questions (adapt to '{{language}}'):
    - "I can only answer questions about air quality and the BreatheEasy dashboard. Could you ask something related to that?"
    - "My apologies, but my expertise is limited to air quality information relevant to this dashboard. How can I help you with that?"
    - "That question is outside of my current capabilities. I'm here to help with your air quality queries!"

Answer the following user question accurately, helpfully, and in a user-friendly manner, using the sensor data to inform your answer where relevant. Ensure the response is in {{language}} and is plain text without markdown.

User Question: {{{question}}}
`,
});

const askChatbotFlow = ai.defineFlow(
  {
    name: 'askChatbotFlow',
    inputSchema: AskChatbotInputSchema,
    outputSchema: AskChatbotOutputSchema,
  },
  async (input) => {
    const MAX_ATTEMPTS = 3; // Total attempts: 1 initial + 2 retries
    let attempts = 0;

    while (attempts < MAX_ATTEMPTS) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (error: any) {
        attempts++;
        const errorMessage = typeof error.message === 'string' ? error.message.toLowerCase() : '';
        const isRetriableError = errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('service unavailable');

        if (isRetriableError && attempts < MAX_ATTEMPTS) {
          console.warn(`askChatbotFlow attempt ${attempts} failed due to model overload. Retrying in ${attempts * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Wait (1s, 2s for 2nd and 3rd attempt)
        } else {
          // Not a retriable error or max retries reached
          console.error(`askChatbotFlow failed after ${attempts} attempts. Last error:`, error);
          throw error; // Re-throw the error to be caught by the calling UI
        }
      }
    }
    // This fallback should theoretically not be reached given MAX_ATTEMPTS > 0
    // and the logic re-throwing the error. It's here for exhaustive error handling.
    throw new Error("askChatbotFlow failed after max retries and did not correctly throw the last error.");
  }
);

