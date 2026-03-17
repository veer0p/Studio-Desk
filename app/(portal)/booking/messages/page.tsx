"use client";

import { usePortalSession } from "@/lib/portal/session";
import { SessionExpiredScreen } from "@/components/portal/SessionExpiredScreen";
import { 
  Send, 
  ChevronLeft, 
  User, 
  MoreHorizontal,
  Check,
  CheckCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: 'client' | 'studio';
  text: string;
  timestamp: string;
  status: 'sent' | 'read';
}

export default function PortalMessagesPage() {
  const { session, isLoading, isValid } = usePortalSession();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'studio', text: "Hello! We've uploaded your contract. Please review and sign.", timestamp: "10:30 AM", status: 'read' },
    { id: '2', sender: 'client', text: "Thanks, checking it now.", timestamp: "10:35 AM", status: 'read' },
    { id: '3', sender: 'studio', text: "Great. Let us know if you have any questions!", timestamp: "10:40 AM", status: 'read' },
  ]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) return null;
  if (!isValid) return <SessionExpiredScreen studio={session?.studio} />;

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'client',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    
    setMessages([...messages, newMessage]);
    setInputText("");
    
    // Simulate studio response
    setTimeout(() => {
       const reply: Message = {
         id: (Date.now() + 1).toString(),
         sender: 'studio',
         text: "Got it! Our team will get back to you shortly.",
         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
         status: 'sent'
       };
       setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] -mt-4">
      <div className="flex items-center gap-4 pb-6 border-b border-slate-50 bg-white sticky top-0 z-10">
         <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50" asChild>
            <Link href="/booking">
               <ChevronLeft className="w-5 h-5 text-slate-400" />
            </Link>
         </Button>
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
               <User className="w-5 h-5" />
            </div>
            <div>
               <h1 className="text-sm font-black text-slate-900 tracking-tight">{session?.studio.name}</h1>
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Online</p>
               </div>
            </div>
         </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-8 space-y-6 scroll-smooth px-1"
      >
         {messages.map((msg) => (
           <div 
             key={msg.id} 
             className={cn(
               "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500",
               msg.sender === 'client' ? "ml-auto items-end" : "items-start"
             )}
           >
              <div className={cn(
                "p-4 rounded-[2rem] text-sm font-bold leading-relaxed shadow-sm",
                msg.sender === 'client' 
                  ? "bg-primary text-white rounded-tr-none shadow-primary/10" 
                  : "bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100"
              )}>
                 {msg.text}
              </div>
              <div className="flex items-center gap-1.5 mt-2 px-2">
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{msg.timestamp}</span>
                 {msg.sender === 'client' && (
                   msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-primary" /> : <Check className="w-3 h-3 text-slate-200" />
                 )}
              </div>
           </div>
         ))}
      </div>

      <div className="pt-6 border-t border-slate-100 sticky bottom-0 bg-white">
         <div className="flex gap-2">
            <Input 
              placeholder="Type your message..." 
              className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold focus-visible:ring-primary/20"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button 
              className="h-14 w-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20"
              onClick={handleSend}
            >
               <Send className="w-5 h-5" />
            </Button>
         </div>
         <p className="text-[9px] font-bold text-center text-slate-300 uppercase tracking-widest mt-4">
            End-to-end encrypted chat
         </p>
      </div>
    </div>
  );
}
