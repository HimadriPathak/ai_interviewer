import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userName: interview.userName!,
  });

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold">
          Interview Feedback -{" "}
          <span className="capitalize">{interview.userName}</span>
        </h1>
      </div>

      <div className="flex flex-row justify-center ">
        <div className="flex flex-row gap-5">
          {/* Overall Impression */}
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p>
              Overall Impression:{" "}
              <span className="text-primary-200 font-bold">
                {feedback?.totalScore}
              </span>
              /100
            </p>
          </div>

          {/* Date */}
          <div className="flex flex-row gap-2">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <hr />

      <p>{feedback?.finalAssessment}</p>

      {/* Interview Breakdown */}
      <div className="flex flex-col gap-4">
        <h2>Breakdown of the Interview:</h2>
        {feedback?.categoryScores?.map((category, index) => (
          <div key={index}>
            <p className="font-bold">
              {index + 1}. {category.name} ({category.score}/100)
            </p>
            <p>{category.comment}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3>Strengths</h3>
        {feedback?.strengths?.length === 0 ? (
          <p className="font-bold">
            No strengths were identified in this interview.
          </p>
        ) : (
          <ul>
            {feedback?.strengths?.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3>Areas for Improvement</h3>
        <ul>
          {feedback?.areasForImprovement?.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              Back to Home
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;
