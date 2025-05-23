import { toast } from "sonner";

export async function initiateInterviewUtil({
  messagesRef,
  resumeSummary,
  jobDescription,
  userName,
  setMessages,
  setIsSpeaking,
  setEndInterview,
  setIsLoading,
  setCallStatus,
  speakText,
}: any) {
  setIsLoading(true);
  try {
    const formData = new FormData();
    formData.append("messages", JSON.stringify(messagesRef.current));
    formData.append("resumeSummary", resumeSummary);
    formData.append("jobDescription", jobDescription);
    formData.append("userName", userName);

    const res = await fetch("/api/interview", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to fetch interview question");

    const result = await res.json();
    if (result.success) {
      const aiQuestion = result.object;
      await speakText(aiQuestion.content, setIsSpeaking);
      if (aiQuestion.endInterview) setEndInterview(true);
      setMessages((prev: any) => [
        ...prev,
        { role: aiQuestion.role, content: aiQuestion.content },
      ]);
    }
  } catch (err) {
    console.error("fetching:", err);
    toast.error("Something went wrong. Please try again.");
    setCallStatus("FINISHED");
  } finally {
    setIsLoading(false);
  }
}

export async function generateFeedbackUtil({
  messagesRef,
  userName,
  interviewId,
  feedbackId,
  router,
}: any) {
  const formData = new FormData();
  formData.append("messages", JSON.stringify(messagesRef.current));
  formData.append("userName", userName);
  formData.append("interviewId", interviewId);
  if (feedbackId) formData.append("feedbackId", feedbackId);

  const res = await fetch("/api/feedback", {
    method: "POST",
    body: formData,
  });

  const { success, feedbackId: id } = await res.json();

  if (success && id) {
    toast.success("Feedback generated successfully");
    router.push(`/interview/${interviewId}/feedback`);
  } else {
    toast.error("Something went wrong. Please try again.");
    router.push("/");
  }
}
