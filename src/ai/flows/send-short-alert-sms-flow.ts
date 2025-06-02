
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
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!toPhoneNumber) {
      const msg = "Recipient phone number (CONTROL_UNIT_PHONE env var or targetPhoneNumber input) is not set for SMS alert.";
      console.warn(`Warning: ${msg}`);
      return { status: `SMS alert failed: ${msg}`, messageSent: "" };
    }
    if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber) {
      const msg = "Twilio credentials for SMS alert are not fully configured in environment variables.";
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

    const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const requestBody = new URLSearchParams();
    requestBody.append('To', toPhoneNumber);
    requestBody.append('From', twilioFromNumber);
    requestBody.append('Body', smsMessage);

    try {
      const response = await fetch(twilioApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody.toString(),
      });

      const responseData = await response.json();

      if (response.ok && responseData.sid) {
        console.log(`SMS alert successfully sent to ${toPhoneNumber}. SID: ${responseData.sid}`);
        return { 
          status: `SMS alert successfully sent to ${toPhoneNumber}.`, 
          messageSent: smsMessage,
          messageSid: responseData.sid 
        };
      } else {
        console.error("Twilio API error for alert:", responseData);
        const errorMessage = responseData.message || `Twilio API responded with status ${response.status}`;
        return { 
          status: `Failed to send SMS alert to ${toPhoneNumber}. ${errorMessage}`, 
          messageSent: smsMessage,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error("Error sending SMS alert via Twilio:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during SMS alert sending.";
      return { 
        status: `Failed to send SMS alert to ${toPhoneNumber}. ${errorMessage}`,
        messageSent: smsMessage,
        error: errorMessage
      };
    }
  }
);
