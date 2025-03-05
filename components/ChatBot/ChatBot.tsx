"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { IoMdCloseCircle, IoMdRefreshCircle } from "react-icons/io";

interface Message {
  type: 'bot' | 'user';
  text: string;
}

interface ConversationStep {
  question: string;
  key: string;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [input, setInput] = useState('');
  const [botTyping, setBotTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conversationFlow: ConversationStep[] = useMemo(
    () => [
      { question: "Hello! What's your name?", key: "name" },
      { question: "What brings you to our store today?", key: "purpose" },
      { question: "OK! What is your favorite product from our store?", key: "product" },
      { question: "OK! Do you have any message for us?", key: "message" },
      { question: "Nice to meet you! What's your mobile number?", key: "mobile" },
    ],
    []
  );

  // Trigger the initial question only once when the chat opens.
  useEffect(() => {
    if (isChatOpen && !chatStarted) {
      setBotTyping(true);
      const timer = setTimeout(() => {
        setMessages([{ type: 'bot', text: conversationFlow[0].question }]);
        setBotTyping(false);
        setChatStarted(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isChatOpen, chatStarted, conversationFlow]);

  // For subsequent questions (from step 1 onward)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (chatStarted && currentStep > 0 && currentStep < conversationFlow.length) {
      setBotTyping(true);
      timer = setTimeout(() => {
        setMessages((prev: Message[]) => [
          ...prev,
          { type: 'bot', text: conversationFlow[currentStep].question }
        ]);
        setBotTyping(false);
      }, 1500);
    } else if (chatStarted && currentStep >= conversationFlow.length) {
      handleSubmit();
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStep, conversationFlow, chatStarted]);

  const handleNext = () => {
    if (input.trim() !== '') {
      setMessages((prev: Message[]) => [...prev, { type: 'user', text: input }]);
      setInput('');
      // Increment the step after a slight delay
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 500);
    }
  };

  const handleSubmit = useCallback(async () => {
    const payload = messages
      .filter((m: Message) => m.type === 'user')
      .map((m: Message, i: number) => ({
        key: conversationFlow[i]?.key,
        value: m.text
      }));

    const response = await fetch('/api/messages/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log("response ",response);

  }, [messages, conversationFlow]);

  const handleClear = () => {
    setCurrentStep(0);
    setMessages([]);
    setChatStarted(false);
    setBotTyping(true);
    const timer = setTimeout(() => {
      setMessages([{ type: 'bot', text: conversationFlow[0].question }]);
      setBotTyping(false);
      setChatStarted(true);
    }, 1500);
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!botTyping && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, botTyping]);

  return (
    <div>
      <Image
        onClick={() => setIsChatOpen(true)}
        src="/ChatBot.gif"
        width={120}
        height={120}
        priority
        className="cursor-pointer"
        alt="ChatBot Icon"
      />

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            key="chat-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-300 rounded-lg shadow-md w-72 sm:w-80 md:w-96 overflow-y-auto flex flex-col fixed h-[500px] md:bottom-5 bottom-2 lg:bottom-7 right-4 border border-gray-300 text-black overflow-x-hidden"
          >
            <div className="bg-blue-600 h-[50px] w-full font-bold text-white flex justify-between items-center px-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl cursor-pointer">🤖</div>
                <div className="cursor-pointer text-lg">Indian Baazaar</div>
              </div>
              <div className="flex items-center gap-3">
                <IoMdRefreshCircle
                  className="h-6 w-6 cursor-pointer"
                  onClick={handleClear}
                />
                <IoMdCloseCircle
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => setIsChatOpen(false)}
                />
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {messages.map((msg: Message, index: number) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    msg.type === "bot" ? "justify-start" : "justify-end"
                  }`}
                >
                  {msg.type === "bot" && <span className="mr-2">🤖</span>}
                  <div
                    className={`p-2 rounded-lg max-w-xs sm:max-w-[70%] mb-2 ${
                      msg.type === "bot" ? "bg-white text-black" : "bg-blue-500 text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {botTyping && (
                <div className="p-2 bg-white rounded-lg text-left max-w-xs self-start">
                  🤖 Typing...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-gray-400 bg-gray-300">
              {currentStep < conversationFlow.length ? (
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded sm:text-sm w-[85%] text-black bg-white "
                    ref={inputRef}
                    value={input}
                    disabled={botTyping}
                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                  />
                  <button
                    className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleNext}
                  >
                    Send
                  </button>
                </div>
              ) : (
                <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded w-full cursor-not-allowed">
                  Thanks! We will get back to you
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
