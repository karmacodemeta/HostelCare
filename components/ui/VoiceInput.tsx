'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Sparkles, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { parseVoiceInput } from '@/lib/voice/voiceParser';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VoiceInputProps {
    onResult: (data: any) => void;
    className?: string;
}

export function VoiceInput({ onResult, className }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [language, setLanguage] = useState<'en-US' | 'hi-IN'>('en-US'); // Default English
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Voice recognition is not supported in this browser. Please use Chrome.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.lang = language;
            recognitionRef.current.start();
            setIsListening(true);
            
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                console.log('Voice Input:', transcript);
                setIsProcessing(true);
                
                // Simulate processing delay for "AI Feel"
                setTimeout(() => {
                    const parsedData = parseVoiceInput(transcript);
                    onResult(parsedData);
                    setIsProcessing(false);
                    setIsListening(false);
                }, 800);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech Error:", event.error);
                setIsListening(false);
                setIsProcessing(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    };

    const toggleLanguage = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault(); // Prevent form submit if inside form
        setLanguage(prev => prev === 'en-US' ? 'hi-IN' : 'en-US');
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button" // Important: Don't submit form
                            onClick={toggleListening}
                            variant={isListening ? "destructive" : "outline"}
                            className={cn(
                                "relative overflow-hidden transition-all duration-300 border-indigo-200 dark:border-indigo-800",
                                isListening && "animate-pulse ring-4 ring-indigo-500/20"
                            )}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isListening ? (
                                <MicOff className="w-4 h-4" />
                            ) : (
                                <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            )}
                            
                            <span className="ml-2 hidden sm:inline">
                                {isListening ? "Listening..." : "Voice Fill"}
                            </span>

                            {/* Magic Sparkles Background if idle */}
                            {!isListening && !isProcessing && (
                                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 opacity-50" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Click to speak (English or Hindi)</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                title={`Current: ${language === 'en-US' ? 'English' : 'Hindi'}`}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    {language === 'en-US' ? 'EN' : 'HI'}
                </span>
            </Button>
        </div>
    );
}
