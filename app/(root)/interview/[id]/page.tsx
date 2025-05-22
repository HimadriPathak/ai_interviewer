import { redirect } from "next/navigation";

import Agent from "@/components/Agent";
import { DeepgramContextProvider } from "@/context/DeepgramContextProvider";
import { MicrophoneContextProvider } from "@/context/MicrophoneContextProvider";
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";

const InterviewDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userName: interview?.userName,
  });
  if (feedback && feedback.id) redirect(`/interview/${id}/feedback`);
  return (
    <>
      <MicrophoneContextProvider>
        <DeepgramContextProvider>
          <Agent
            userName={interview?.userName}
            interviewId={id}
            jobDescription={interview?.jobDescription}
            resumeSummary={interview?.resumeSummary}
            feedbackId={feedback?.id}
          />
        </DeepgramContextProvider>
      </MicrophoneContextProvider>
    </>
  );
};

export default InterviewDetails;
