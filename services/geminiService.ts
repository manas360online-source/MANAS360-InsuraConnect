
import { GoogleGenAI, Type } from "@google/genai";

// Guideline: Always use a new instance right before making an API call 
// to ensure it uses the most up-to-date configuration.

export const geminiService = {
  async explainDenial(denialReason: string, claimDetails: any) {
    // Correct initialization with named parameters
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `An insurance claim was denied for: "${denialReason}". Details: ${JSON.stringify(claimDetails)}.
      Explain this to the patient in simple terms. Provide a list of 3 specific steps for an appeal, potentially including references to common medical codes (ICD-10 or CPT) if relevant. Format as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    // Correctly access the .text property (not a method)
    const text = response.text || "{}";
    return JSON.parse(text);
  },

  async researchProviderAPIs(companyName: string) {
    // Correct initialization with named parameters
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a technical summary for developers on how to integrate with ${companyName}'s health insurance APIs in India. Focus on FHIR, HL7, and the National Digital Health Mission (NDHM) sandbox standards.`,
    });
    // Correctly access the .text property
    return response.text || "";
  },

  async generateAppealLetter(claim: any, explanation: string) {
    // Correct initialization with named parameters
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Write a formal insurance appeal letter for a denied mental health therapy session.
      Patient: ${claim.patientName}
      Provider: MANAS360 Therapy Center
      Claim ID: ${claim.claimNumber}
      Denial Reason: ${explanation}
      Service Date: ${claim.serviceDate}
      Ensure the tone is professional and cites the importance of continuity of care.`,
    });
    // Correctly access the .text property
    return response.text || "";
  }
};
