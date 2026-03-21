import { GoogleGenAI, Type } from '@google/genai';
import { BusinessClinicReport, FounderProfile, FounderStrategy } from '../types';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;
const model = 'gemini-3-flash-preview';

const parseJson = <T>(text: string | undefined, fallback: T): T => {
  if (!text) return fallback;

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('Failed to parse model response', error);
    return fallback;
  }
};

const fallbackStrategy = (profile: FounderProfile): FounderStrategy => ({
  summary: `${profile.businessName} is positioned as a ${profile.stage}-stage ${profile.industry} company serving ${profile.targetCustomer} in ${profile.location.city}. The immediate focus is converting founder intent into a repeatable operating cadence.`,
  valueProposition: `Help ${profile.targetCustomer} solve a painful ${profile.industry.toLowerCase()} problem faster and more reliably than fragmented alternatives, while keeping operations lean enough for a founder-led team.`,
  priorities: [
    'Validate the highest-value customer pain point with direct outreach and short discovery calls.',
    'Turn the core offer into a simple, sellable package with pricing, deliverables, and proof points.',
    'Build a weekly operating rhythm covering sales, delivery, and cash tracking.',
  ],
  milestones: [
    'Week 1: sharpen positioning, define one core offer, and publish a concise landing page or one-pager.',
    'Week 2: contact at least 20 target customers or partners and log objections in the CRM.',
    'Week 4: close the first paying customer or pilot and document the delivery workflow as an SOP.',
    'Quarter 1: establish repeatable acquisition, delivery, and reporting processes.',
  ],
  goToMarket: [
    'Run founder-led outbound to warm networks, local communities, and niche channels where your customer already spends time.',
    'Use short case-study content and clear before/after outcomes to reduce trust friction.',
    'Track objections, conversion rate, and time-to-close weekly so the offer can be tightened quickly.',
  ],
  operations: [
    'Define a weekly planning routine with 3 priorities, task owners, and deadlines.',
    'Create SOPs for onboarding customers, delivery handoff, and follow-up after each sale.',
    'Keep all business context in one workspace so decisions compound instead of resetting each week.',
  ],
  financeNotes: [
    `Current runway is approximately ${Math.max(1, Math.floor(profile.capital / Math.max(profile.monthlyBurn, 1)))} months based on available capital and monthly burn.`,
    'Separate survival metrics from growth metrics: cash in bank, monthly burn, leads created, opportunities advanced, and revenue closed.',
    'Review pricing every two weeks until the gross margin and sales cycle become predictable.',
  ],
  risks: [
    'Building too much before validating willingness to pay.',
    'Operating without a consistent sales pipeline or follow-up system.',
    'Letting burn increase faster than revenue confidence.',
  ],
});

const fallbackClinicReport = (profile: FounderProfile, businessInfo: string): BusinessClinicReport => ({
  diagnosis: `${profile.businessName} appears to have an execution bottleneck rather than a pure idea problem. Based on the business description, the likely constraints are unclear prioritization, inconsistent demand generation, and limited operational systems.`,
  recoveryStrategies: [
    'Narrow the offer to one urgent customer problem and one measurable outcome.',
    'Create a weekly review for pipeline, delivery, and cash so decisions are based on evidence instead of intuition.',
    'Document one repeatable process each week to reduce founder dependency.',
  ],
  growthRecommendations: [
    `Turn this core narrative into short founder-led outreach and content: ${businessInfo.slice(0, 120)}.`,
    'Use customer interviews as both discovery and lead generation.',
    'Bundle onboarding, reporting, or support into the offer to raise perceived value.',
  ],
  pivotOpportunities: [
    'Move upmarket into customers with a higher urgency problem if current buyers are too slow.',
    'Productize the most repeated service or workflow into a standard package.',
    'Focus on a narrower customer segment in the same geography to improve distribution efficiency.',
  ],
  investmentReadySteps: [
    'Show 3 to 6 months of disciplined KPI tracking.',
    'Document customer traction, retention signals, and unit economics assumptions.',
    'Create a concise data room with deck, pipeline, financial model, and operating plan.',
  ],
});

export const generateFounderStrategy = async (profile: FounderProfile): Promise<FounderStrategy> => {
  const fallback = fallbackStrategy(profile);
  if (!genAI) return fallback;

  const prompt = `You are an elite startup operator. Generate a practical founder operating plan for this company.
Company: ${profile.businessName}
Founder: ${profile.founderName}
Stage: ${profile.stage}
Industry: ${profile.industry}
Location: ${profile.location.city}, ${profile.location.country}
Target customer: ${profile.targetCustomer}
Business model: ${profile.businessModel}
Founder background: ${profile.background}
Goals: ${profile.goals.join(', ')}
Capital: ${profile.capital}
Monthly burn: ${profile.monthlyBurn}

Make the output tactical, founder-friendly, and execution-focused.`;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            valueProposition: { type: Type.STRING },
            priorities: { type: Type.ARRAY, items: { type: Type.STRING } },
            milestones: { type: Type.ARRAY, items: { type: Type.STRING } },
            goToMarket: { type: Type.ARRAY, items: { type: Type.STRING } },
            operations: { type: Type.ARRAY, items: { type: Type.STRING } },
            financeNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['summary', 'valueProposition', 'priorities', 'milestones', 'goToMarket', 'operations', 'financeNotes', 'risks'],
        },
      },
    });

    return parseJson(response.text, fallback);
  } catch (error) {
    console.error('Falling back to local founder strategy', error);
    return fallback;
  }
};

export const diagnoseBusiness = async (
  businessInfo: string,
  profile: FounderProfile,
): Promise<BusinessClinicReport> => {
  const fallback = fallbackClinicReport(profile, businessInfo);
  if (!genAI) return fallback;

  const prompt = `Act as a high-end startup operator and turnaround advisor.
Business name: ${profile.businessName}
Stage: ${profile.stage}
Industry: ${profile.industry}
Location: ${profile.location.city}, ${profile.location.country}
Business context: ${businessInfo}

Diagnose the core business issues and produce a concrete recovery and growth plan.
Use direct, professional business language. Avoid slang, hype, or gimmicky wording.`;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING },
            recoveryStrategies: { type: Type.ARRAY, items: { type: Type.STRING } },
            growthRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            pivotOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            investmentReadySteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['diagnosis', 'recoveryStrategies', 'growthRecommendations', 'pivotOpportunities', 'investmentReadySteps'],
        },
      },
    });

    return parseJson(response.text, fallback);
  } catch (error) {
    console.error('Falling back to local clinic report', error);
    return fallback;
  }
};
