"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useDeepgram } from "@/context/DeepgramContextProvider";
import {
  MicrophoneState,
  useMicrophone,
} from "@/context/MicrophoneContextProvider";
import { setupTranscriptHandler } from "@/lib/actions/deepgram.action";
import {
  generateFeedbackUtil,
  initiateInterviewUtil,
} from "@/lib/actions/interview.actions";
import { cn, getInitials } from "@/lib/utils";
import { LiveConnectionState } from "@deepgram/sdk";
import ChatBox from "./ChatBox";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

const Agent = ({
  userName,
  jobDescription,
  resumeSummary,
  interviewId,
  feedbackId,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const messagesRef = useRef<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [endInterview, setEndInterview] = useState(false);
  const userInitials = useMemo(() => getInitials(userName), [userName]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    connection,
    connectToDeepgram,
    connectionState,
    disconnectFromDeepgram,
    speakText,
  } = useDeepgram();
  const {
    setupMicrophone,
    microphone,
    startMicrophone,
    microphoneState,
    stopMicrophone,
  } = useMicrophone();
  const captionTimeout = useRef<any>(null);
  const keepAliveInterval = useRef<any>(null);

  useEffect(() => {
    setupMicrophone();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      connectToDeepgram({
        model: "nova-3",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });

      setCallStatus(CallStatus.ACTIVE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState]);

  const initiateInterview = async () => {
    initiateInterviewUtil({
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
    });
  };
  useEffect(() => {
    if (endInterview && !isSpeaking && !isLoading) {
      disconnectFromServer();
    }
  }, [isSpeaking, endInterview, isLoading]);

  useEffect(() => {
    if (!microphone || !connection) return;

    if (connectionState === LiveConnectionState.OPEN && messages.length === 0) {
      initiateInterview();
    }

    const cleanup = setupTranscriptHandler({
      connection,
      startMicrophone,
      microphone,
      setMessages,
      messagesRef,
      isSpeaking,
      endInterview,
      captionTimeout,
      initiateInterview,
    });

    return cleanup;
  }, [connectionState]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === LiveConnectionState.OPEN
    ) {
      connection.keepAlive();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 30000);
    } else {
      clearInterval(keepAliveInterval.current);
    }

    return () => {
      clearInterval(keepAliveInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState, connectionState]);

  const handleFeedback = () => {
    generateFeedbackUtil({
      messagesRef,
      userName,
      interviewId,
      feedbackId,
      router,
    });
  };

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      handleFeedback();
    }
  }, [messages, callStatus, feedbackId, interviewId, router, userName]);
  const disconnectFromServer = () => {
    setCallStatus(CallStatus.FINISHED);
    stopMicrophone();
    disconnectFromDeepgram();
  };
  return (
    <>
      <div className="call-view">
        <div className="call-view relative">
          {/* AI Interviewer Card */}
          <div className="card-interviewer">
            <div className="avatar">
              <Image
                src="/ai-avatar.png"
                alt="profile-image"
                width={65}
                height={54}
                className="object-cover rounded-md"
              />
              {isSpeaking && <span className="animate-speak" />}
            </div>
            <h3>AI Interviewer</h3>
          </div>

          {/* User Profile Card */}
          <div className="card-border">
            <div className="card-content">
              <Avatar className="text-xl font-semibold w-[80px] h-[80px]">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        <ChatBox conversation={messages} />
      </div>

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" || isLoading ? (
          <Button
            className="btn-call bg-success-100"
            type="submit"
            disabled={isLoading}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "FINISHED"
                ? "Processing Feedback..."
                : "Processing. . ."}
            </span>
          </Button>
        ) : (
          <Button
            variant={isLoading ? "secondary" : "destructive"}
            onClick={() => disconnectFromServer()}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "End"}
          </Button>
        )}
      </div>
    </>
  );
};

export default Agent;
