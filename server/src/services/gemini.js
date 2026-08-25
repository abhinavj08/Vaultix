import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export async function categorizeTransaction(description) {
  try {
    const prompt = `You are a financial transaction categorizer. Given this bank transaction description: '${description}'. Categorize it into EXACTLY ONE of these categories: Food & Dining, Shopping, Transportation, Bills & Utilities, Entertainment, Health & Fitness, Travel, Income, Groceries, Education, Other. Respond with ONLY a JSON object: {"category": "...", "confidence": 0.0-1.0}. Nothing else.`;
    
    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    
    let text = response.text.trim();
    if (text.startsWith('```json')) {
      text = text.substring(7, text.length - 3).trim();
    } else if (text.startsWith('```')) {
      text = text.substring(3, text.length - 3).trim();
    }
    
    const result = JSON.parse(text);
    return {
      category: result.category || 'Other',
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.5
    };
  } catch (error) {
    console.error('Gemini API Error (categorizeTransaction):', error);
    return { category: 'Other', confidence: 0.0 };
  }
}

export async function generateMonthlyTip(spendingSummary) {
  try {
    const prompt = `You are a personal finance advisor. Based on this monthly spending breakdown: ${spendingSummary}. Provide exactly ONE concise sentence of actionable financial advice. Keep it under 30 words. Respond with ONLY the tip sentence, nothing else.`;
    
    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    return response.text.trim();
  } catch (error) {
    console.error('Gemini API Error (generateMonthlyTip):', error);
    return "Keep tracking your expenses to better understand your financial habits.";
  }
}
