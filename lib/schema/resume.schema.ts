import { z } from "zod";

export const resumeSchema = z.object({
  jobDescription: z
    .string()
    .min(10, "Job description must be at least 10 characters"),
  resume: z.custom<File>((val) => val instanceof File, {
    message: "Please upload a valid file",
  }),
});

export type ResumeFormData = z.infer<typeof resumeSchema>;

export const ParseResumeSchema = z.object({
  userName: z
    .string()
    .describe("The capitalized name of the person on the resume"),

  summary: z
    .string()
    .describe(
      "A concise summary of the candidate's professional experience and skills, ideally 3-4 sentences long."
    ),

  isResume: z
    .boolean()
    .describe("Indicates whether the uploaded PDF is identified as a resume"),

  isJobDescription: z
    .boolean()
    .describe(
      "Indicates whether the job description is identified as a job description"
    ),
});

export type ParseResumeSchemaResponse = z.infer<typeof ParseResumeSchema> & {
  id: string;
};
