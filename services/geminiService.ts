
import { GoogleGenAI, Type } from "@google/genai";
import type { CVData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Full name of the person." },
    title: { type: Type.STRING, description: "Primary job title or role, e.g., 'ML/AI Engineer'." },
    summary: { type: Type.STRING, description: "A brief professional summary, 2-3 sentences long." },
    contact: {
      type: Type.OBJECT,
      properties: {
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING, description: "City and Country, e.g., 'Wien, Austria'." },
        github: { type: Type.STRING, description: "Full URL to GitHub profile." },
        linkedin: { type: Type.STRING, description: "Full URL to LinkedIn profile." },
      },
    },
    languages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          level: { type: Type.STRING, description: "Proficiency level, e.g., 'Native', 'B2', 'C1'." },
          icon: { type: Type.STRING, description: "The 2-letter country code for the flag icon URL, e.g., 'it' for Italian. Use 'gb' for English." },
          proficiency: { type: Type.INTEGER, description: "Proficiency on a scale of 0-100. Native=100, C1=75, B2=55, A2=25." },
        },
      },
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The category of the skills, e.g., 'AI & Data Science'." },
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING, description: "Individual skill. If a skill is important, wrap it in <strong> tags." },
          },
        },
      },
    },
    certifications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          link: { type: Type.STRING, description: "Full URL to the certification badge." },
          logoUrl: { type: Type.STRING, description: "A direct URL to the issuer's logo image." },
        },
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          university: { type: Type.STRING },
          period: { type: Type.STRING, description: "Start and end years, e.g., '2021–2023'." },
          thesis: { type: Type.STRING, description: "Title of the thesis." },
        },
      },
    },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          company: { type: Type.STRING },
          period: { type: Type.STRING, description: "Start month/year to end month/year, e.g., 'Oct 2025 – Present'." },
          location: { type: Type.STRING },
          description: {
            type: Type.ARRAY,
            items: { type: Type.STRING, description: "A bullet point describing a responsibility or achievement. If a term is important, wrap it in <strong> tags." },
          },
          logoUrl: { type: Type.STRING, description: "A direct URL to the company's logo image." },
        },
      },
    },
  },
};


export const parseResumeWithGemini = async (resumeText: string): Promise<CVData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Parse the following resume text and extract the information into a JSON format matching the provided schema. Be thorough and accurate. If a URL for a logo is not available, find a suitable public one. For language icons, provide the 2-letter country code to be used in the URL 'https://flagcdn.com/w20/{code}.png'.

Resume Text:
---
${resumeText}
---
`,
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedData: CVData = JSON.parse(jsonText);
    
    // Post-process flag URLs
    parsedData.languages.forEach(lang => {
        lang.icon = `https://flagcdn.com/w20/${lang.icon.toLowerCase()}.png`;
    });

    return parsedData;

  } catch (error) {
    console.error("Error parsing resume with Gemini:", error);
    throw new Error("Failed to parse the resume. Please check the format and try again.");
  }
};
