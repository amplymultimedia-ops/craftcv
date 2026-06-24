export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  title?: string;
  photo?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  description: string;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface ResumeContent {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: string[];
  languages?: string[];
}

export type ToneOfVoice = 'professional' | 'personal' | 'human' | 'creative' | 'confident';

export interface Resume {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  content: ResumeContent;
  toneOfVoice?: ToneOfVoice | null;
  createdAt: string;
  updatedAt: string;
}

export interface CoverLetter {
  id: string;
  userId: string;
  resumeId?: string | null;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'trial' | 'monthly' | 'annual';
  status: 'active' | 'cancelled' | 'expired';
  trialEndsAt?: string | null;
  currentPeriodEndsAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BaselineProfile {
  id: string;
  userId: string;
  content: ResumeContent;
  updatedAt: string;
}

export interface ParsedJobAd {
  title: string;
  company?: string;
  responsibilities: string[];
  requirements: string[];
  keywords: string[];
  culture?: string;
  rawText: string;
}

export const EMPTY_RESUME_CONTENT: ResumeContent = {
  personalInfo: {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
    title: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
};
