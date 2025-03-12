"use client";

import React, { FormEvent, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "./input";
import * as Y from "yjs";
import { BotIcon, MessageCircleCode } from "lucide-react";
import { Button } from "./button";
import Markdown from "react-markdown";

function ChatToDocument({ doc }: { doc: Y.Doc }) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");

  const extractTextFromDocument = (doc: Y.Doc): string => {
    const documentFragment = doc.getXmlFragment("document-store");
    let textContent = "";

    documentFragment.forEach((node: any) => {
      if (node.nodeName === "paragraph") {
        textContent += node.textContent + "\n";
      }
    });

    return textContent.trim();
  };

  const handleAskQuestion = async (e: FormEvent) => {
    e.preventDefault();
    setQuestion(input);

    startTransition(async () => {
      try {
        const textContent = extractTextFromDocument(doc);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/ChatToDocument`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              documentData: textContent,
              question: input,
            }),
          }
        );

        if (res.ok) {
          
          const { message } = await res.json();
        setInput("");
        setSummary(message);
        toast.success("Question was asked successfully!");
        }

        
      } catch (error) {
        console.error(error);
        toast.error("Failed to ask the question. Please try again.");
      }
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setSummary("");
          setQuestion("");
        }
      }}
    >
      <Button asChild variant="outline">
        <DialogTrigger>
          <MessageCircleCode className="mr-2" />
          Chat to document
        </DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chat to Document</DialogTitle>
          <DialogDescription>
            Ask a question to the document with AI.
          </DialogDescription>
          {question && <p className="mt-5 text-gray-500">Q: {question}</p>}
        </DialogHeader>

        {summary && (
          <div className="flex flex-col items-start max-h-96 overflow-y-scroll gap-2 p-5 bg-gray-100">
            <div className="flex">
              <BotIcon className="w-10 flex-shrink-0" />
              <p className="font-bold">
                GPT {isPending ? "is thinking..." : "Says:"}
              </p>
            </div>
            <p>{isPending ? "Thinking..." : <Markdown>{summary}</Markdown>}</p>
          </div>
        )}

        <form className="flex gap-2" onSubmit={handleAskQuestion}>
          <Input
            type="text"
            placeholder="i.e what is this about??"
            className="w-full"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" disabled={!input || isPending}>
            {isPending ? "Asking..." : "Ask"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ChatToDocument;