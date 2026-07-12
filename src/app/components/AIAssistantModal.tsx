'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  onActionTriggered?: (action: string, data: any) => void;
}

export default function AIAssistantModal({ isOpen, onClose, onOpen, onActionTriggered }: AIAssistantModalProps) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'assistant'; text: string }[]>([
    { sender: 'assistant', text: 'Hello! I am your HOSAPP voice assistant. Ask me to "book an appointment", "show my reports", "read my prescription", or "take me to pharmacy".' }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Speech Recognition Reference
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize browser speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const speechToText = event.results[0][0].transcript;
          setInputText(speechToText);
          handleSendCommand(speechToText);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Handle TTS
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition', err);
      }
    } else {
      alert('Speech recognition is not supported in this browser. Please type your query.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSendCommand = async (commandToSend?: string) => {
    const textToSubmit = commandToSend || inputText;
    if (!textToSubmit.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: textToSubmit }]);
    setInputText('');
    setLoading(true);

    try {
      const localUser = localStorage.getItem('hosapp_user');
      const token = localUser ? JSON.parse(localUser).token : '';

      const res = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ command: textToSubmit }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Add assistant response
      setMessages((prev) => [...prev, { sender: 'assistant', text: data.response }]);
      speakText(data.response);

      if (data.action !== 'NONE' && onActionTriggered) {
        onActionTriggered(data.action, data.data);
      }

    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: 'assistant', text: 'Sorry, I encountered an error: ' + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  // If chat is closed, render the floating launcher bubble button in the bottom right corner
  if (!isOpen) {
    return (
      <button
        onClick={onOpen}
        type="button"
        className="fixed bottom-6 right-6 z-[999] bg-secondary hover:bg-secondary-container hover:scale-105 active:scale-95 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all animate-bounce"
        title="Open AI Voice Assistant"
      >
        <span className="material-symbols-outlined text-2xl">auto_awesome</span>
        {/* Glow indicator */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-tertiary-fixed rounded-full border border-white"></span>
      </button>
    );
  }

  // If chat is open, render as a support chat pop-up card
  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-outline-variant flex flex-col overflow-hidden z-[999] animate-zoomIn">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center relative ${isListening ? 'animate-ping' : ''}`}>
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-primary ${
              isListening ? 'bg-error animate-pulse' : isSpeaking ? 'bg-tertiary-fixed' : 'bg-green-500'
            }`}></span>
          </div>
          <div>
            <h3 className="font-bold text-xs">HOSAPP Voice Assistant</h3>
            <p className="text-[9px] text-on-primary-container font-medium uppercase tracking-wider mt-0.5">
              {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          title="Minimize Chat"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background scrollbar-hide">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-secondary text-white rounded-tr-none shadow-sm'
                  : 'bg-white text-on-surface border border-outline-variant/30 rounded-tl-none soft-card'
              }`}
            >
              {m.sender === 'assistant' && (
                <p className="font-bold text-secondary text-[9px] uppercase tracking-wider mb-0.5">AI Assistant</p>
              )}
              <p className="whitespace-pre-line">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-on-surface border border-outline-variant/30 rounded-2xl rounded-tl-none p-3 text-xs leading-relaxed flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Input Animation Wave */}
      {isListening && (
        <div className="bg-secondary/5 py-2.5 border-t border-outline-variant/10 flex items-center justify-center gap-1">
          <span className="w-1 h-5 bg-secondary rounded-full animate-pulse animate-delay-100"></span>
          <span className="w-1 h-8 bg-secondary rounded-full animate-pulse animate-delay-200"></span>
          <span className="w-1 h-6 bg-secondary rounded-full animate-pulse animate-delay-300"></span>
          <span className="w-1 h-9 bg-secondary rounded-full animate-pulse animate-delay-400"></span>
          <span className="w-1 h-4 bg-secondary rounded-full animate-pulse animate-delay-500"></span>
          <span className="text-[9px] text-secondary font-bold uppercase tracking-wider ml-1.5">Listening for voice...</span>
        </div>
      )}

      {/* Footer Input */}
      <div className="p-3 bg-white border-t border-outline-variant/30 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
          placeholder="Ask something..."
          className="flex-1 bg-surface-container-low border-none rounded-xl py-2 px-3 text-xs text-on-surface focus:ring-2 focus:ring-secondary outline-none"
        />
        
        {/* Mic Button */}
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`p-2.5 rounded-xl transition-all shadow flex items-center justify-center ${
            isListening ? 'bg-error text-white animate-pulse' : 'bg-surface-container-high hover:bg-surface-container-high/80 text-secondary'
          }`}
          title={isListening ? "Stop listening" : "Start Voice command"}
        >
          <span className="material-symbols-outlined text-sm">{isListening ? 'mic_off' : 'mic'}</span>
        </button>

        {/* Send Button */}
        <button
          type="button"
          onClick={() => handleSendCommand()}
          className="p-2.5 bg-secondary text-white rounded-xl hover:bg-secondary-container transition-colors shadow flex items-center justify-center"
          title="Send query"
        >
          <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </div>
    </div>
  );
}
