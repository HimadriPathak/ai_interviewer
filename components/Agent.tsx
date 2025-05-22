"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useDeepgram } from "@/context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "@/context/MicrophoneContextProvider";
import { cn, getInitials } from "@/lib/utils";
import {
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";
import { toast } from "sonner";
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
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("messages", JSON.stringify(messagesRef.current));
      formData.append("resumeSummary", resumeSummary!);
      formData.append("jobDescription", jobDescription!);
      formData.append("userName", userName!);
      const res = await fetch("/api/interview", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to fetch interview question");
      }
      const result = await res.json();
      if (result.success) {
        const aiQuestion = result.object;

        await speakText(aiQuestion.content, setIsSpeaking);
        if (aiQuestion.endInterview) {
          setEndInterview(true);
        }

        setMessages((prevMessages) => [
          ...prevMessages,
          { role: aiQuestion.role, content: aiQuestion.content },
        ]);
      }
    } catch (error) {
      console.error("fetching:", error);
      toast.error("Something went wrong. Please try again.");
      setCallStatus(CallStatus.FINISHED);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (endInterview && !isSpeaking && !isLoading) {
      disconnectFromServer();
    }
  }, [isSpeaking, endInterview, isLoading]);
  useEffect(() => {
    if (!microphone) return;
    if (!connection) return;

    if (connectionState === LiveConnectionState.OPEN && messages.length === 0) {
      initiateInterview();
    }
    const onData = (e: BlobEvent) => {
      // iOS SAFARI FIX:
      // Prevent packetZero from being sent. If sent at size 0, the connection will close.
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal, speech_final: speechFinal } = data;
      let thisCaption = data.channel.alternatives[0].transcript.trim();

      if (isSpeaking || !thisCaption || !(isFinal && speechFinal)) return;

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];

        if (lastMessage?.role === "user") {
          if (!lastMessage.content.includes(thisCaption)) {
            lastMessage.content += " " + thisCaption;
          }
        } else {
          updatedMessages.push({ role: "user", content: thisCaption });
        }

        messagesRef.current = updatedMessages;
        return updatedMessages;
      });

      if (captionTimeout.current) clearTimeout(captionTimeout.current);

      captionTimeout.current = setTimeout(() => {
        const latestMessages = messagesRef.current;

        if (
          latestMessages.length > 0 &&
          latestMessages[latestMessages.length - 1].role === "user"
        ) {
          initiateInterview();
        }
      }, 10000);
    };

    if (connectionState === LiveConnectionState.OPEN) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

      startMicrophone();
    }

    return () => {
      // prettier-ignore
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      clearTimeout(captionTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleGenerateFeedback = async (messages: SavedMessage[]) => {
    const formData = new FormData();
    formData.append("messages", JSON.stringify(messagesRef.current));
    formData.append("userName", userName!);
    formData.append("interviewId", interviewId!);
    if (feedbackId) formData.append("feedbackId", feedbackId);

    const res = await fetch("/api/feedback", {
      method: "POST",
      body: formData,
    });

    const { success, feedbackId: id } = await res.json();

    if (success && id) {
      router.push(`/interview/${interviewId}/feedback`);
    } else {
      console.log("Error saving feedback");
      router.push("/");
    }
  };
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      handleGenerateFeedback(messages);
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
        {callStatus !== "ACTIVE" ? (
          <Button
            className="btn-call bg-success-100"
            type="submit"
            disabled={isLoading}
            // onClick={connectToServer}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </Button>
        ) : (
          <Button
            variant={"destructive"}
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
