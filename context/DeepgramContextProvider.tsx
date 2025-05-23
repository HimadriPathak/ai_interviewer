"use client";

import {
  createClient,
  LiveClient,
  LiveConnectionState,
  LiveTranscriptionEvents,
  type LiveSchema,
  type LiveTranscriptionEvent,
} from "@deepgram/sdk";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";

import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

interface DeepgramContextType {
  connection: LiveClient | null;
  connectToDeepgram: (options: LiveSchema, endpoint?: string) => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: LiveConnectionState;
  speakText: (
    text: string,
    setIsSpeaking: (isSpeaking: boolean) => void
  ) => Promise<void>;
  pauseAudio: () => void;
}

const DeepgramContext = createContext<DeepgramContextType | undefined>(
  undefined
);

interface DeepgramContextProviderProps {
  children: ReactNode;
}

const getApiKey = async (router: AppRouterInstance): Promise<string> => {
  try {
    const response = await fetch("/api/deepgram", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch API key");

    const result = await response.json();
    if (!result.key) throw new Error("API key not found");

    return result.key;
  } catch (error) {
    toast.error("Missing or invalid API key. Redirecting to home.");
    setTimeout(() => router.push("/"), 2000);
    return "";
  }
};

const DeepgramContextProvider: FunctionComponent<
  DeepgramContextProviderProps
> = ({ children }) => {
  const router = useRouter();
  const [connection, setConnection] = useState<LiveClient | null>(null);
  const [connectionState, setConnectionState] = useState<LiveConnectionState>(
    LiveConnectionState.CLOSED
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const connectToDeepgram = async (options: LiveSchema, endpoint?: string) => {
    const key = await getApiKey(router);
    const deepgram = createClient(key);

    const conn = deepgram.listen.live(options, endpoint);

    conn.addListener(LiveTranscriptionEvents.Open, () => {
      setConnectionState(LiveConnectionState.OPEN);
    });

    conn.addListener(LiveTranscriptionEvents.Close, () => {
      setConnectionState(LiveConnectionState.CLOSED);
    });

    setConnection(conn);
  };

  const speakText = async (
    text: string,
    setIsSpeaking: (isSpeaking: boolean) => void
  ) => {
    try {
      const res = await fetch("/api/deepgram/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        toast.error("Failed to fetch TTS audio. Redirecting to home.");
        setTimeout(() => router.push("/"), 2000);
        throw new Error("Failed to fetch TTS audio");
      }

      const audioData = await res.arrayBuffer();
      const blob = new Blob([audioData], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);

      setIsSpeaking(true);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        toast.error("Audio playback failed. Redirecting to home.");
        setTimeout(() => router.push("/"), 2000);
        setIsSpeaking(false);
        audioRef.current = null;
      };

      audio.play();
    } catch (error) {
      console.error(error);
      toast.error("Error occurred during speech playback. Redirecting.");
      setTimeout(() => router.push("/"), 2000);
      setIsSpeaking(false);
    }
  };

  const disconnectFromDeepgram = async () => {
    if (connection) {
      connection.finish();
      setConnection(null);
    }
  };
  const pauseAudio = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  };
  return (
    <DeepgramContext.Provider
      value={{
        connection,
        connectToDeepgram,
        disconnectFromDeepgram,
        connectionState,
        speakText,
        pauseAudio,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

function useDeepgram(): DeepgramContextType {
  const context = useContext(DeepgramContext);
  if (context === undefined) {
    throw new Error(
      "useDeepgram must be used within a DeepgramContextProvider"
    );
  }
  return context;
}

export {
  DeepgramContextProvider,
  LiveConnectionState,
  LiveTranscriptionEvents,
  useDeepgram,
  type LiveTranscriptionEvent,
};
