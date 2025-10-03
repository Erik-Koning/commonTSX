import React, { useState, useEffect, useRef, forwardRef } from "react";
import MicOutlinedIcon from "@mui/icons-material/MicOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import { Button } from "../ui/Button";

interface MicrophoneDictationIconProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  downloadChunks?: boolean;
  setTextValueState: React.Dispatch<React.SetStateAction<string>>;
}

export const MicrophoneDictationIcon = forwardRef<HTMLDivElement, MicrophoneDictationIconProps>(
  ({ className, downloadChunks, setTextValueState, ...props }, ref) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const silenceTimeoutRef = useRef<number | null>(null);
    const maxChunkTimerRef = useRef<number | null>(null);
    const maxChunkOverlapTimeoutRef = useRef<number | null>(null);

    const MAX_CHUNK_LENGTH = 58000; // 58,000 milliseconds (58 seconds)

    const handleMicClick = async () => {
      if (isRecording) {
        stopRecording();
      } else {
        await startRecording();
      }
    };

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioCtx = new AudioContext();
        setAudioContext(audioCtx);

        // Load the AudioWorkletProcessor
        await audioCtx.audioWorklet.addModule("worklet/silence-detector-processor.js");

        const sourceNode = audioCtx.createMediaStreamSource(stream);

        const workletNode = new AudioWorkletNode(audioCtx, "silence-detector-processor", {
          processorOptions: {
            silentThreshold: 0.01, // Adjust as needed
            silentDuration: 700, // Silence duration threshold in milliseconds
            ignoreSilenceDuration: 0, // Ignore silence for the first N milliseconds
          },
        });
        workletNodeRef.current = workletNode;

        workletNode.port.onmessage = (event) => {
          if (event.data && event.data.event === "silence") {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              // Start a timeout for 1.5 seconds
              if (silenceTimeoutRef.current === null) {
                silenceTimeoutRef.current = window.setTimeout(() => {
                  mediaRecorderRef.current?.requestData();
                  silenceTimeoutRef.current = null;
                }, 1500); // 1.5 seconds
              }
            }
          }
        };

        sourceNode.connect(workletNode);
        // Optionally connect to destination
        // workletNode.connect(audioCtx.destination);

        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }

          // Process the chunk
          processAudioChunk();
        };

        mediaRecorderRef.current.start();

        setIsRecording(true);

        // Start the maximum chunk length timer
        startMaxChunkTimer();
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;

      // Clear any pending silence timeout
      if (silenceTimeoutRef.current !== null) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }

      // Clear the maximum chunk length timer
      if (maxChunkTimerRef.current !== null) {
        clearTimeout(maxChunkTimerRef.current);
        maxChunkTimerRef.current = null;
      }

      // Clear the maximum chunk overlap delay timer
      if (maxChunkOverlapTimeoutRef.current !== null) {
        clearTimeout(maxChunkOverlapTimeoutRef.current);
        maxChunkOverlapTimeoutRef.current = null;
      }

      workletNodeRef.current?.port.postMessage({ command: "reset" });
      workletNodeRef.current?.disconnect();
      workletNodeRef.current = null;

      audioContext?.close();
      setAudioContext(null);

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      // We set isRecording to false here so ondataavailable knows recording has stopped
      setIsRecording(false);
    };

    const processAudioChunk = () => {
      if (audioChunksRef.current.length === 0) return;

      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      audioChunksRef.current = [];

      // Send the audio blob to the API for transcription
      // sendAudioToAPI(blob);

      // Download the audio chunk if downloadChunks is true
      if (downloadChunks) {
        downloadAudioBlob(blob);
      }

      // Reset timers
      resetMaxChunkTimer();
    };

    const downloadAudioBlob = (audioBlob: Blob) => {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;

      // Generate a unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      a.download = `audio-chunk-${timestamp}.webm`;

      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    };

    const sendAudioToAPI = async (audioBlob: Blob) => {
      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.webm");

        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = (await response.json()) as Record<string, any>;
          const transcribedText = data.transcript;

          // Update the textarea value
          setTextValueState((prevValue) => prevValue + transcribedText + " ");
        } else {
          console.error("API response not OK:", response.statusText);
        }
      } catch (error) {
        console.error("Error sending audio to API:", error);
      }
    };

    // Start the maximum chunk length timer
    const startMaxChunkTimer = () => {
      // Clear any existing timer
      if (maxChunkTimerRef.current !== null) {
        clearTimeout(maxChunkTimerRef.current);
      }

      maxChunkTimerRef.current = window.setTimeout(() => {
        // Start a 1.5-second overlap delay before processing the chunk
        startMaxChunkOverlapDelay();
        maxChunkTimerRef.current = null;
      }, MAX_CHUNK_LENGTH);
    };

    // Start the maximum chunk overlap delay
    const startMaxChunkOverlapDelay = () => {
      // Clear any existing overlap timeout
      if (maxChunkOverlapTimeoutRef.current !== null) {
        clearTimeout(maxChunkOverlapTimeoutRef.current);
      }

      maxChunkOverlapTimeoutRef.current = window.setTimeout(() => {
        mediaRecorderRef.current?.requestData();
        maxChunkOverlapTimeoutRef.current = null;
      }, 1500); // 1.5 seconds
    };

    // Reset the maximum chunk length timer
    const resetMaxChunkTimer = () => {
      startMaxChunkTimer();
    };

    useEffect(() => {
      return () => {
        if (isRecording) {
          stopRecording();
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div className="relative" ref={ref}>
        {/* Microphone Icon */}
        <Button
          variant={"ghost"}
          onClick={handleMicClick}
          className="absolute right-2 top-2 z-10 flex items-center justify-center p-1 text-gray-500 hover:text-gray-700"
        >
          {isRecording ? <MicOffOutlinedIcon sx={{ fontSize: 20 }} /> : <MicOutlinedIcon sx={{ fontSize: 20 }} />}
        </Button>
      </div>
    );
  }
);

MicrophoneDictationIcon.displayName = "MicrophoneDictationIcon";
