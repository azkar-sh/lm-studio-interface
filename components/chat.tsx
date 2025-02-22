"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LMStudioAPI } from "@/lib/api";
import { Message } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { SendIcon, ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";

interface ChatProps {
  api: LMStudioAPI;
  selectedModel: string;
}

export function Chat({ api, selectedModel }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [currentStreamedContent, setCurrentStreamedContent] = useState("");

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, currentStreamedContent]);

  const handleSubmit = async () => {
    if (!input.trim() || !selectedModel || isGenerating) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);
    setCurrentStreamedContent("");

    try {
      const assistantMessageId = uuidv4();
      let fullContent = "";

      await api.chat(
        messages
          .concat(userMessage)
          .map(({ role, content }) => ({ role, content })),
        selectedModel,
        (chunk) => {
          fullContent += chunk;
          setCurrentStreamedContent(fullContent);
        }
      );

      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: fullContent,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentStreamedContent("");
    } catch (error) {
      toast.error("Failed to get response from API");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg p-4 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {currentStreamedContent && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                <ReactMarkdown>{currentStreamedContent}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Button variant="outline" size="icon" disabled={isGenerating}>
            <ImageIcon className="h-5 w-5" />
          </Button>
          <div className="flex-1 flex gap-2">
            <TextareaAutosize
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 min-h-[44px] max-h-[200px] resize-none rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isGenerating}
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isGenerating || !selectedModel}
            >
              <SendIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
