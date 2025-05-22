"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner"; // ✅ import from sonner
import { z } from "zod";
import DropzoneField from "./DropzoneField";
import FormField from "./FormField";

const resumeSchema = z.object({
  jobDescription: z
    .string()
    .min(10, "Job description must be at least 10 characters"),
  resume: z.custom<File>((val) => val instanceof File, {
    message: "Please upload a valid file",
  }),
});

type ResumeFormData = z.infer<typeof resumeSchema>;

export default function ResumeForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      jobDescription: "",
      resume: undefined,
    },
  });

  const handleUpload = async (data: ResumeFormData) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("resume", data.resume);
    formData.append("jobDescription", data.jobDescription);

    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to parse resume");
      }

      const result = await res.json();
      console.log("Parsed Data:", result);
      toast.success("Resume parsed successfully. Redirecting to interview...!");
      if (result.success) {
        router.push(`/interview/${result?.id}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: ResumeFormData) => {
    handleUpload(data);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full max-w-4xl mx-auto p-5"
        >
          <fieldset disabled={isLoading} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2">
                <DropzoneField
                  control={form.control}
                  name="resume"
                  label="Upload Resume"
                />
              </div>

              <div className="w-full md:w-1/2">
                <FormField
                  control={form.control}
                  name="jobDescription"
                  placeholder="Enter the job description here"
                  type="textarea"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : "Submit"}
            </Button>
          </fieldset>
        </form>
      </Form>
    </>
  );
}
