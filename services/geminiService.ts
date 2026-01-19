
import { GoogleGenAI, Type } from "@google/genai";
import { Account, JournalEntry } from "../types";

export const getFinancialAnalysis = async (accounts: Account[], entries: JournalEntry[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    أنت مستشار مالي خبير. قم بتحليل البيانات المالية التالية لشركة:
    الحسابات: ${JSON.stringify(accounts.map(a => ({ name: a.name, type: a.type, balance: a.balance })))}
    القيود الأخيرة: ${JSON.stringify(entries.slice(0, 5))}
    
    المطلوب: تقديم 3 نصائح أو رؤى (insights) حول الأداء المالي للشركة باللغة العربية.
    يجب أن يكون الرد بتنسيق JSON حصراً يحتوي على مصفوفة من الكائنات.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['success', 'warning', 'info'] }
            },
            required: ['title', 'content', 'type']
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return [
      { title: "تحليل سريع", content: "تأكد من توازن الأصول والالتزامات في ميزانيتك.", type: "info" }
    ];
  }
};
