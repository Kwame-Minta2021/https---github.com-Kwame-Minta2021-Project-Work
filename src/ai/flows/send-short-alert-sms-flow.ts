
// src/ai/flows/send-short-alert-sms-flow.ts
'use server';
/**
 * @fileOverview A Genkit flow to send a short SMS alert about critical air quality levels.
 *
 * - sendShortAlertSms - A function that formats a concise SMS and sends it via Twilio.
 * - SendShortAlertInput - The input type for the sendShortAlertSms function.
 * - SendShortAlertOutput - The return type for the sendShortAlertSms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SendShortAlertInputSchema = z.object({
  pollutantName: z.string().describe("The name of the pollutant exceeding threshold (e.g., PM2.5, CO)."),
  currentValue: z.number().describe("The current measured value of the pollutant."),
  thresholdValue: z.number().describe("The threshold value that was exceeded."),
  unit: z.string().describe("The unit of measurement for the pollutant (e.g., µg/m³, ppm)."),
  language: z.string().describe("The language for the alert message (e.g., 'en', 'fr')."),
  targetPhoneNumber: z.string().optional().describe("The phone number to send the SMS to. If not provided, uses CONTROL_UNIT_PHONE environment variable."),
});
export type SendShortAlertInput = z.infer<typeof SendShortAlertInputSchema>;

const SendShortAlertOutputSchema = z.object({
  status: z.string().describe('A message indicating the outcome of the SMS sending attempt.'),
  messageSent: z.string().optional().describe('The content of the message that was attempted to be sent.'),
  messageSid: z.string().optional().describe('The Twilio message SID if successfully sent.'),
  error: z.string().optional().describe('Error message if sending failed.'),
});
export type SendShortAlertOutput = z.infer<typeof SendShortAlertOutputSchema>;

export async function sendShortAlertSms(input: SendShortAlertInput): Promise<SendShortAlertOutput> {
  return sendShortAlertSmsFlow(input);
}

const sendShortAlertSmsFlow = ai.defineFlow(
  {
    name: 'sendShortAlertSmsFlow',
    inputSchema: SendShortAlertInputSchema,
    outputSchema: SendShortAlertOutputSchema,
  },
  async (input): Promise<SendShortAlertOutput> => {
    const { pollutantName, currentValue, thresholdValue, unit, language } = input;
    
    const toPhoneNumber = input.targetPhoneNumber || process.env.CONTROL_UNIT_PHONE;
    const vonageApiKey = process.env.VONAGE_API_KEY;
    const vonageApiSecret = process.env.VONAGE_API_SECRET;

    if (!toPhoneNumber) {
      const msg = "Recipient phone number (CONTROL_UNIT_PHONE env var or targetPhoneNumber input) is not set for SMS alert.";
      console.warn(`Warning: ${msg}`);
      return { status: `SMS alert failed: ${msg}`, messageSent: "" };
    }
    if (!vonageApiKey || !vonageApiSecret) {
      const msg = "Vonage credentials for SMS alert are not fully configured in environment variables.";
      console.error(`Error: ${msg}`);
      return { status: `SMS alert failed: ${msg}`, messageSent: "" };
    }

    let smsMessage = "";
    if (language === 'fr') {
      smsMessage = `Alerte BreatheEasy: ${pollutantName} (${currentValue.toFixed(1)}${unit}) dépasse le seuil (${thresholdValue.toFixed(1)}${unit}).`;
    } else { // Default to English
      smsMessage = `BreatheEasy Alert: ${pollutantName} (${currentValue.toFixed(1)}${unit}) is above threshold (${thresholdValue.toFixed(1)}${unit}).`;
    }

    // Standard SMS limit is 160 characters.
    if (smsMessage.length > 160) {
        smsMessage = smsMessage.substring(0, 157) + "...";
    }

    const vonageApiUrl = 'https://rest.nexmo.com/sms/json';
    
    const requestBody = {
      api_key: vonageApiKey,
      api_secret: vonageApiSecret,
      to: toPhoneNumber,
      from: 'BreatheEasy',
      text: smsMessage,
    };

    try {
      const response = await fetch(vonageApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (response.ok && responseData.messages && responseData.messages[0].status === '0') {
        const messageId = responseData.messages[0]['message-id'];
        console.log(`SMS alert successfully sent to ${toPhoneNumber}. Message ID: ${messageId}`);
        return { 
          status: `SMS alert successfully sent to ${toPhoneNumber}.`, 
          messageSent: smsMessage,
          messageSid: messageId 
        };
      } else {
        console.error("Vonage API error for alert:", responseData);
        const errorMessage = responseData.messages?.[0]?.['error-text'] || `Vonage API responded with status ${response.status}`;
        return { 
          status: `Failed to send SMS alert to ${toPhoneNumber}. ${errorMessage}`, 
          messageSent: smsMessage,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error("Error sending SMS alert via Vonage:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during SMS alert sending.";
      return { 
        status: `Failed to send SMS alert to ${toPhoneNumber}. ${errorMessage}`,
        messageSent: smsMessage,
        error: errorMessage
      };
    }
  }
);
