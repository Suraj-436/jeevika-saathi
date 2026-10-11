import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Trash2, Bot, ShieldCheck } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { isRelevantQuery, getDomainRestrictedResponse, answerRelevantQuery } from "../utils/domainFilter";
import { SUGGESTED_QUERIES } from "../data/faq";
import { useLanguage } from "../context/LanguageContext";

export default function SaathiChatbot() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "init-1",
      sender: "assistant",
      text: language === "hi"
        ? "नमस्ते! मैं 'साथी' (Saathi Citizen Assistance) हूँ। मैं पीएम-अजय योजनाओं, एनएसक्यूएफ कोर्स, पात्रता एवं वज़ीफ़ा संबंधी सवालों में आपकी सहायता कर सकता हूँ।"
        : "Namaste! I am Saathi (Citizen Assistance). I am here to help you with PM-AJAY schemes, NSQF courses, eligibility, and stipends. How can I help?",
      time: "Just now",
      isRestricted: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    setTimeout(() => {
      const isRelevant = isRelevantQuery(query);
      let responseText = "";
      let isRestricted = false;

      if (!isRelevant) {
        responseText = getDomainRestrictedResponse(language);
        isRestricted = true;
      } else {
        responseText = answerRelevantQuery(query, language);
      }

      const assistantMsg = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isRestricted: isRestricted
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 400);
  };

  return (
    <aside aria-label="Citizen Chatbot">
      {/* Floating Trigger Stacked at TOP of Where Am I */}
      {!isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "86px",
            right: "24px",
            zIndex: 991,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end"
          }}
        >
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            title="Open Citizen Assistance Chat (साथी नागरिक सहायता)"
            aria-label="Open Saathi Chatbot Guide"
            style={{
              height: "40px",
              padding: "0 14px",
              borderRadius: "20px",
              backgroundColor: "#ffffff",
              color: "#0f382c",
              border: "1.5px solid #0f382c",
              boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "12.5px",
              fontWeight: 700,
              transition: "all 0.18s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f0fdf4";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                backgroundColor: "#0f382c",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <MessageSquare size={13} />
            </div>
            <span>Guide / Chat</span>
          </button>
        </div>
      )}

      {/* Clean Drawer Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "24px",
            zIndex: 1000,
            width: "380px",
            maxWidth: "calc(100vw - 32px)",
            height: "500px",
            maxHeight: "calc(100vh - 120px)",
            backgroundColor: "#ffffff",
            borderRadius: "4px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "var(--gov-navy)",
              color: "#ffffff",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Bot size={16} />
              <div style={{ fontSize: "13px", fontWeight: 700 }}>
                PM-AJAY Saathi — Citizen Assistance
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", padding: "2px" }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px", backgroundColor: "#f8fafc" }}>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Queries */}
          <div
            style={{
              padding: "6px 10px",
              backgroundColor: "#ffffff",
              borderTop: "1px solid var(--border-light)",
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              whiteSpace: "nowrap"
            }}
          >
            {SUGGESTED_QUERIES.slice(0, 4).map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 8px",
                  borderRadius: "3px",
                  backgroundColor: "#f1f5f9",
                  color: "var(--gov-navy)",
                  border: "1px solid var(--border)",
                  cursor: "pointer"
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: "8px 10px",
              backgroundColor: "#ffffff",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "8px"
            }}
          >
            <input
              type="text"
              placeholder="Ask about PM-AJAY or courses..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 10px",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                fontSize: "12.5px",
                outline: "none"
              }}
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="gov-btn gov-btn-primary"
              style={{ padding: "0 12px" }}
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
