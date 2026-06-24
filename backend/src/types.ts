import { z } from "zod";

// Resume content structure
export const PersonalInfoSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
  title: z.string().optional(),
  photo: z.string().optional(),
});

export const ExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  current: z.boolean().optional(),
  description: z.string(),
  bullets: z.array(z.string()),
});

export const EducationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  gpa: z.string().optional(),
});

export const ResumeContentSchema = z.object({
  personalInfo: PersonalInfoSchema,
  summary: z.string(),
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(z.string()),
  certifications: z.array(z.string()),
  languages: z.array(z.string()).optional(),
});

export const ToneOfVoiceSchema = z.enum([
  "professional",
  "personal",
  "human",
  "creative",
  "confident",
]);

export const ResumeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  templateId: z.string(),
  content: ResumeContentSchema,
  toneOfVoice: ToneOfVoiceSchema.optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CoverLetterSchema = z.object({
  id: z.string(),
  userId: z.string(),
  resumeId: z.string().optional().nullable(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  plan: z.enum(["trial", "monthly", "annual"]),
  status: z.enum(["active", "cancelled", "expired"]),
  trialEndsAt: z.string().nullable().optional(),
  currentPeriodEndsAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BaselineProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  content: ResumeContentSchema,
  updatedAt: z.string(),
});

export const JobAdSchema = z.object({
  id: z.string(),
  userId: z.string(),
  url: z.string().optional().nullable(),
  rawText: z.string(),
  parsedData: z
    .object({
      title: z.string(),
      company: z.string().optional(),
      responsibilities: z.array(z.string()),
      requirements: z.array(z.string()),
      keywords: z.array(z.string()),
      culture: z.string().optional(),
      rawText: z.string(),
    })
    .optional()
    .nullable(),
  createdAt: z.string(),
});

// Request schemas
export const CreateResumeSchema = z.object({
  title: z.string(),
  templateId: z.string().default("classic"),
  content: ResumeContentSchema.optional(),
});

export const UpdateResumeSchema = z.object({
  title: z.string().optional(),
  templateId: z.string().optional(),
  content: ResumeContentSchema.optional(),
  toneOfVoice: ToneOfVoiceSchema.optional(),
});

export const GenerateResumeSchema = z.object({
  resumeId: z.string(),
  jobAdText: z.string(),
  jobAdUrl: z.string().optional(),
  toneOfVoice: ToneOfVoiceSchema,
});

export const GenerateCoverLetterSchema = z.object({
  resumeId: z.string(),
  jobAdText: z.string(),
  toneOfVoice: ToneOfVoiceSchema,
  coverLetterId: z.string().optional(),
});

export const ParseJobAdSchema = z.object({
  url: z.string().optional(),
  text: z.string().optional(),
});

export const ParsedJobAdSchema = z.object({
  title: z.string(),
  company: z.string().optional(),
  responsibilities: z.array(z.string()),
  requirements: z.array(z.string()),
  keywords: z.array(z.string()),
  culture: z.string().optional(),
  rawText: z.string(),
});

export const StartTrialSchema = z.object({
  plan: z.enum(["trial", "monthly", "annual"]),
});

export const CreateCoverLetterSchema = z.object({
  title: z.string(),
  content: z.string().default(""),
  resumeId: z.string().optional(),
});

export const UpdateCoverLetterSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  resumeId: z.string().optional().nullable(),
});

export const UpdateProfileSchema = z.object({
  content: ResumeContentSchema,
});

export const EditTextSchema = z.object({
  text: z.string().min(1),
  instruction: z.string().min(1),
});

export type EditText = z.infer<typeof EditTextSchema>;

// TypeScript types inferred from Zod schemas
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type ResumeContent = z.infer<typeof ResumeContentSchema>;
export type ToneOfVoice = z.infer<typeof ToneOfVoiceSchema>;
export type Resume = z.infer<typeof ResumeSchema>;
export type CoverLetter = z.infer<typeof CoverLetterSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type BaselineProfile = z.infer<typeof BaselineProfileSchema>;
export type JobAd = z.infer<typeof JobAdSchema>;
export type ParsedJobAd = z.infer<typeof ParsedJobAdSchema>;
export type CreateResume = z.infer<typeof CreateResumeSchema>;
export type UpdateResume = z.infer<typeof UpdateResumeSchema>;
export type GenerateResume = z.infer<typeof GenerateResumeSchema>;
export type GenerateCoverLetter = z.infer<typeof GenerateCoverLetterSchema>;
export type ParseJobAd = z.infer<typeof ParseJobAdSchema>;
export type StartTrial = z.infer<typeof StartTrialSchema>;
export type CreateCoverLetter = z.infer<typeof CreateCoverLetterSchema>;
export type UpdateCoverLetter = z.infer<typeof UpdateCoverLetterSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
