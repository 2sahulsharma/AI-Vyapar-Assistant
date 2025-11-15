import { useState, useEffect, useRef } from 'react';

// TypeScript definitions for SpeechRecognition API
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
    length: number;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

declare global {
    interface Window {
        SpeechRecognition: { new (): SpeechRecognition; };
        webkitSpeechRecognition: { new (): SpeechRecognition; };
    }
}

const SpeechRecognitionAPI = (typeof window !== 'undefined') && (window.SpeechRecognition || window.webkitSpeechRecognition);

export const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (!SpeechRecognitionAPI) {
            setError('Speech recognition is not supported in this browser.');
            return;
        }

        recognitionRef.current = new SpeechRecognitionAPI();
        const recognition = recognitionRef.current;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setError(`Speech recognition error: ${event.error}`);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                setTranscript(''); // Clear previous transcript
                setError(null);
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                 console.error("Speech recognition could not be started: ", err);
                 setError("Could not start recognition. Please check microphone permissions.");
                 setIsListening(false);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const hasSupport = !!SpeechRecognitionAPI;

    return {
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
        hasSupport
    };
};
