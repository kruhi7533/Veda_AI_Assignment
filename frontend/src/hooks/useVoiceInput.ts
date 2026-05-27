'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string };
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResult };
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognitionInstance };
    webkitSpeechRecognition?: { new (): SpeechRecognitionInstance };
  }
}

interface Options {
  onResult: (text: string, isFinal: boolean) => void;
  lang?: string;
}

interface VoiceInput {
  supported: boolean;
  listening: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

export function useVoiceInput({
  onResult,
  lang = 'en-US',
}: Options): VoiceInput {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const r = new Ctor();
    r.continuous = true;
    r.interimResults = true;
    r.lang = lang;

    r.onstart = () => {
      setListening(true);
      setError(null);
    };

    r.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) finalText += text;
        else interim += text;
      }
      if (finalText) onResultRef.current(finalText, true);
      else if (interim) onResultRef.current(interim, false);
    };

    r.onerror = (ev) => {
      setError(ev.error || 'recognition error');
      setListening(false);
    };

    r.onend = () => setListening(false);

    recognitionRef.current = r;

    return () => {
      try {
        r.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    try {
      r.start();
    } catch (e) {
      // Already started — ignore InvalidStateError
      setError((e as Error).message);
    }
  }, []);

  const stop = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    try {
      r.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { supported, listening, error, start, stop, toggle };
}
