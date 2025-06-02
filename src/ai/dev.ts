
import { config } from 'dotenv';
config();

import '@/ai/flows/interactive-ai-chatbot.ts';
import '@/ai/flows/recommend-actions.ts';
import '@/ai/flows/analyze-air-quality.ts';
import '@/ai/flows/send-sms-report-flow.ts';
import '@/ai/flows/send-short-alert-sms-flow.ts'; // Added new flow
