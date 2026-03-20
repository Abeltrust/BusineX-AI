import { GoogleGenAI, Type } from "@google/genai";
import { BusinessIdea, Roadmap, PitchDeck, BusinessClinicReport, UserProfile } from "../types";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey });

export const generateBusinessIdeas = async (user: UserProfile): Promise<BusinessIdea[]> => {
  const model = "gemini-3-flash-preview";
  const prompt = `As a world-class startup accelerator, generate 3 hyper-local, high-impact business ideas for a founder in ${user.location.city}, ${user.location.country}.
  Founder background: ${user.background}. Skills: ${user.skills.join(", ")}. Interests: ${user.interests.join(", ")}.
  Focus on real-world problems specific to their location.`;

  const response = await genAI.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            concept: { type: Type.STRING },
            problem: { type: Type.STRING },
            solution: { type: Type.STRING },
            targetMarket: { type: Type.STRING },
            competitiveAdvantage: { type: Type.STRING },
          },
          required: ["id", "name", "concept", "problem", "solution", "targetMarket", "competitiveAdvantage"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
};

export const generateRoadmap = async (idea: BusinessIdea, user: UserProfile): Promise<Roadmap> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Generate a detailed execution and growth roadmap for the business idea: "${idea.name}".
  Concept: ${idea.concept}. Location: ${user.location.city}, ${user.location.country}.
  Include Day 1, 30 days, 6 months, and 5-10 year vision. Also tools, costs, revenue, and risks.`;

  const response = await genAI.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          day1: { type: Type.STRING },
          first30Days: { type: Type.STRING },
          sixMonths: { type: Type.STRING },
          fiveToTenYears: { type: Type.STRING },
          tools: { type: Type.ARRAY, items: { type: Type.STRING } },
          costBreakdown: { type: Type.STRING },
          revenueStreams: { type: Type.ARRAY, items: { type: Type.STRING } },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["day1", "first30Days", "sixMonths", "fiveToTenYears", "tools", "costBreakdown", "revenueStreams", "risks"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const generatePitchDeck = async (idea: BusinessIdea): Promise<PitchDeck> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Transform this business idea into an investor-ready pitch deck: "${idea.name}".
  Concept: ${idea.concept}. Problem: ${idea.problem}. Solution: ${idea.solution}.`;

  const response = await genAI.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          marketOpportunity: { type: Type.STRING },
          businessModel: { type: Type.STRING },
          financialProjections: { type: Type.STRING },
          fundingRequired: { type: Type.NUMBER },
          suggestedEquity: { type: Type.NUMBER },
        },
        required: ["executiveSummary", "marketOpportunity", "businessModel", "financialProjections", "fundingRequired", "suggestedEquity"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const diagnoseBusiness = async (businessInfo: string, user: UserProfile): Promise<BusinessClinicReport> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Act as a high-end business consultant. Diagnose this existing business: "${businessInfo}".
  Location: ${user.location.city}, ${user.location.country}.
  Provide diagnosis, recovery strategies, growth hacks, pivot opportunities, and steps to make it investment-ready.`;

  const response = await genAI.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diagnosis: { type: Type.STRING },
          recoveryStrategies: { type: Type.ARRAY, items: { type: Type.STRING } },
          growthHacks: { type: Type.ARRAY, items: { type: Type.STRING } },
          pivotOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          investmentReadySteps: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["diagnosis", "recoveryStrategies", "growthHacks", "pivotOpportunities", "investmentReadySteps"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const generateInvestmentOpportunities = async (user: UserProfile): Promise<BusinessIdea[]> => {
  const model = "gemini-3-flash-preview";
  const prompt = `As a world-class investment advisor, generate 3 high-potential startup opportunities for an investor.
  Investor Profile: 
  - Risk Appetite: ${user.investorProfile?.riskAppetite}
  - Industry Preferences: ${user.investorProfile?.industryPreferences.join(", ")}
  - Investment Range: $${user.investorProfile?.minInvestment} - $${user.investorProfile?.maxInvestment}
  - Location: ${user.location.city}, ${user.location.country}
  
  Generate realistic, high-impact startup concepts that fit this profile.`;

  const response = await genAI.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            concept: { type: Type.STRING },
            problem: { type: Type.STRING },
            solution: { type: Type.STRING },
            targetMarket: { type: Type.STRING },
            competitiveAdvantage: { type: Type.STRING },
          },
          required: ["id", "name", "concept", "problem", "solution", "targetMarket", "competitiveAdvantage"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
};
