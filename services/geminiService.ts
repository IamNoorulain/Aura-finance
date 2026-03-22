import { GoogleGenAI } from "@google/genai";
import { Asset, Liability, Transaction } from '../types';
import { calculateNetWorth, calculateBurnRate, getSpendingByCategory } from './financeEngine';

const SYSTEM_INSTRUCTION = `
You are Aura, an elite personal finance strategist. 
Your tone is professional, concise, and extremely data-driven.
CRITICAL: Keep responses extremely brief and concise to save tokens. 
Use bullet points for clarity. Avoid conversational filler.
Output formatted in Markdown. Use bolding for key figures.
`;

export const generateFinancialReport = async (
  transactions: Transaction[], 
  assets: Asset[], 
  liabilities: Liability[],
  query?: string,
  apiKey?: string,
  currency: string = 'USD'
): Promise<string> => {
  const finalApiKey = apiKey || process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!finalApiKey) {
    return "API Key is missing. Please provide a Gemini API key to enable Aura Intelligence.";
  }

  const ai = new GoogleGenAI({ apiKey: finalApiKey });

  // Prepare Data Summary for Context
  const netWorth = calculateNetWorth(assets, liabilities);
  const burnRate = calculateBurnRate(transactions);
  const topCategories = getSpendingByCategory(transactions).slice(0, 5);
  const recentTransactions = transactions.slice(0, 10);
  
  const financialContext = {
    currency,
    netWorth,
    monthlyBurnRate: burnRate,
    assetsSummary: assets.map(a => ({ name: a.name, val: a.value, type: a.type })),
    liabilitiesSummary: liabilities.map(l => ({ name: l.name, val: l.balance, rate: l.interestRate })),
    topSpendingCategories: topCategories,
    recentActivity: recentTransactions.map(t => `${t.date}: ${t.description} (${t.amount})`)
  };

  const userPrompt = query || "Generate a monthly executive summary of my financial health. Highlight risks and 1 investment opportunity.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
      Data Context (JSON):
      ${JSON.stringify(financialContext)}

      User Request:
      ${userPrompt}
      `,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "Could not generate insight.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to Aura Intelligence Core. Please check connectivity and API limits.";
  }
};