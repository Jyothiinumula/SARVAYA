import { useState, useEffect, useRef, useCallback } from 'react';

export type VoiceLanguage = 'en-IN' | 'te-IN' | 'hi-IN';

export interface UseSpeechToTextReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  errorMessage: string | null;
  recordingSeconds: number;
  language: VoiceLanguage;
  setLanguage: (lang: VoiceLanguage) => void;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setTranscript: (text: string) => void;
}

export function useSpeechToText(initialLanguage: VoiceLanguage = 'en-IN'): UseSpeechToTextReturn {
  const [language, setLanguageState] = useState<VoiceLanguage>(initialLanguage);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscriptState] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const hasSpokenRef = useRef(false);
  const accumulatedFinalRef = useRef('');

  // Check browser support for Web Speech API
  const isSupported = typeof window !== 'undefined' && Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds(sec => sec + 1);
    }, 1000);
  }, [stopTimer]);

  const resetTranscript = useCallback(() => {
    setTranscriptState('');
    setInterimTranscript('');
    setErrorMessage(null);
    accumulatedFinalRef.current = '';
    hasSpokenRef.current = false;
  }, []);

  const setTranscript = useCallback((text: string) => {
    setTranscriptState(text);
    accumulatedFinalRef.current = text;
    setErrorMessage(null);
  }, []);

  const setLanguage = useCallback((lang: VoiceLanguage) => {
    setLanguageState(lang);
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, []);

  const stopListening = useCallback(() => {
    stopTimer();
    setIsListening(false);
    setInterimTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Recognition already stopped
      }
    }
  }, [stopTimer]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setErrorMessage('Speech recognition is not supported in this browser. Please type your description directly.');
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    setErrorMessage(null);
    setInterimTranscript('');
    hasSpokenRef.current = false;
    accumulatedFinalRef.current = '';
    setTranscriptState('');

    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
        startTimer();
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            finalText += text + ' ';
          } else {
            interimText += text;
          }
        }

        const combinedText = (finalText.trim() + (interimText ? ' ' + interimText.trim() : '')).trim();

        if (combinedText.length > 0) {
          hasSpokenRef.current = true;
          setErrorMessage(null);
          accumulatedFinalRef.current = finalText.trim();
          setTranscriptState(finalText.trim() || combinedText);
          setInterimTranscript(interimText.trim());
        }
      };

      recognition.onerror = (event: any) => {
        const errorType = event?.error;
        console.warn('[SARVAYA SpeechRecognition Error]', errorType);

        if (errorType === 'no-speech') {
          // If no speech detected at all
          if (!hasSpokenRef.current) {
            setErrorMessage('Speech not recognized. Please try again.');
          }
        } else if (errorType === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permission in your browser.');
        } else if (errorType === 'network') {
          setErrorMessage('Speech recognition network error. Please check internet connection or type directly.');
        } else if (errorType !== 'aborted') {
          if (!hasSpokenRef.current) {
            setErrorMessage('Speech not recognized. Please try again.');
          }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        stopTimer();
        setInterimTranscript('');

        // If recognition ended and nothing was captured
        const finalRecorded = accumulatedFinalRef.current.trim();
        if (!finalRecorded && !hasSpokenRef.current) {
          setErrorMessage('Speech not recognized. Please try again.');
        } else if (finalRecorded) {
          setTranscriptState(finalRecorded);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('[SARVAYA SpeechRecognition Start Failed]', err);
      setIsListening(false);
      stopTimer();
      setErrorMessage('Could not start microphone recording. Please check permissions or try again.');
    }
  }, [isSupported, language, startTimer, stopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [stopTimer]);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    errorMessage,
    recordingSeconds,
    language,
    setLanguage,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}
