"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { uploadResume } from "@/lib/actions/resume.action";
import { ResumeFormData, resumeSchema } from "@/lib/schema/resume.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import DropzoneField from "./DropzoneField";
import FormField from "./FormField";

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

  const onSubmit = (data: ResumeFormData) => {
    uploadResume(data, router, setIsLoading);
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

            <Button
              type="submit"
              className="w-full bg-success-100"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Submit"}
            </Button>
          </fieldset>
        </form>
      </Form>
    </>
  );
}
