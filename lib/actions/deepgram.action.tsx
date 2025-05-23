// lib/deepgramHandlers.ts
import { MicrophoneEvents } from "@/context/MicrophoneContextProvider";
import {
  ListenLiveClient,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";

export const setupTranscriptHandler = ({
  connection,
  startMicrophone,
  microphone,
  setMessages,
  messagesRef,
  isSpeaking,
  endInterview,
  captionTimeout,
  initiateInterview,
}: {
  connection: ListenLiveClient | null;
  startMicrophone: () => void;
  microphone: MediaRecorder | null;
  setMessages: React.Dispatch<React.SetStateAction<SavedMessage[]>>;
  messagesRef: React.MutableRefObject<SavedMessage[]>;
  isSpeaking: boolean;
  endInterview: boolean;
  captionTimeout: React.MutableRefObject<any>;
  initiateInterview: () => void;
}) => {
  if (!connection || !microphone) return () => {};

  const onData = (e: BlobEvent) => {
    if (e.data.size > 0) connection?.send(e.data);
  };

  const onTranscript = (data: LiveTranscriptionEvent) => {
    handleTranscript(data, {
      isSpeaking,
      endInterview,
      setMessages,
      messagesRef,
      captionTimeout,
      initiateInterview,
    });
  };

  connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
  microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

  startMicrophone();

  return () => {
    connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
    microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
    clearTimeout(captionTimeout.current);
  };
};

const handleTranscript = (
  data: LiveTranscriptionEvent,
  {
    isSpeaking,
    endInterview,
    setMessages,
    messagesRef,
    captionTimeout,
    initiateInterview,
  }: {
    setMessages: React.Dispatch<React.SetStateAction<SavedMessage[]>>;
    messagesRef: React.MutableRefObject<SavedMessage[]>;
    isSpeaking: boolean;
    endInterview: boolean;
    captionTimeout: React.MutableRefObject<any>;
    initiateInterview: () => void;
  }
) => {
  const { is_final: isFinal, speech_final: speechFinal } = data;
  let thisCaption = data.channel.alternatives[0].transcript.trim();

  if (isSpeaking || endInterview || !thisCaption || !(isFinal && speechFinal))
    return;

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
  }, 7000);
};
