import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";
import {
  ParseResumeSchemaResponse,
  ResumeFormData,
} from "../schema/resume.schema";

export async function uploadResume(
  data: ResumeFormData,
  router: AppRouterInstance,
  setIsLoading: (loading: boolean) => void
) {
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
    const data: ParseResumeSchemaResponse = result.data;
    if (!data.isResume || !data.isJobDescription) {
      toast.error(
        "The uploaded file is not a valid resume or job description."
      );
      setIsLoading(false);
      return;
    }
    toast.success("Resume parsed successfully. Redirecting to interview...!");
    if (result.success) {
      router.push(`/interview/${data?.id}`);
    }
  } catch (error) {
    console.error("Upload error:", error);
    toast.error("Something went wrong. Please try again.");
    setIsLoading(false);
  }
}
