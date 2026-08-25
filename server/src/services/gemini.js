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
    const prompt = `You are a personal finance advisor. Based on this monthly spending breakdown in Indian Rupees: ${spendingSummary}. Provide exactly ONE concise sentence of actionable financial advice. Keep it under 30 words. ALWAYS use Indian Rupees (₹) for any currency mentions. NEVER use dollar signs ($). Respond with ONLY the tip sentence, nothing else.`;
    
    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    return response.text.trim();
  } catch (error) {
    console.error('Gemini API Error (generateMonthlyTip):', error);
    return "Track your daily expenses closely in ₹ to build healthy saving habits.";
  }
}

export async function askFinancialAssistant(question, contextData = {}) {
  try {
    const prompt = `You are Vaultix AI, an intelligent personal finance assistant for the user.
The user is asking a question about their finances.
Context about the user's finances this month:
- Total Income: ₹${contextData.totalIncome || 0}
- Total Expenses: ₹${contextData.totalExpenses || 0}
- Net Balance: ₹${contextData.netBalance || 0}
- Spending by Category: ${JSON.stringify(contextData.spendingByCategory || [])}
- Budget vs Actual: ${JSON.stringify(contextData.budgetVsActual || [])}
- Recent Transactions: ${JSON.stringify(contextData.recentTransactions || [])}

User Question: "${question}"

Instructions:
1. Provide a direct, insightful, actionable answer (under 120 words).
2. ALWAYS use Indian Rupees (₹) as the currency. NEVER use dollar signs ($).
3. If giving advice, provide concrete steps to save money and stay within budget.
4. Keep the tone friendly, smart, and encouraging.`;

    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    return response.text.trim();
  } catch (error) {
    console.error('Gemini API Error (askFinancialAssistant):', error);
    return "I'm currently unable to analyze your finances. Please try again in a few seconds!";
  }
}
