import React from "react";
import { Bot, User, Volume2, ShieldCheck, AlertCircle } from "lucide-react";

export default function ChatMessage({ message, onSpeak }) {
  const isUser = message.sender === "user";
  const isRestricted = message.isRestricted;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: "12px",
        width: "100%"
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "8px",
          maxWidth: "88%",
          flexDirection: isUser ? "row-reverse" : "row"
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            backgroundColor: isUser ? "#0e2a47" : (isRestricted ? "#dc2626" : "#15803d"),
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "11px",
            fontWeight: 700
          }}
        >
          {isUser ? <User size={14} /> : <Bot size={15} />}
        </div>

        {/* Message Bubble */}
        <div
          style={{
            backgroundColor: isUser 
              ? "#0e2a47" 
              : (isRestricted ? "#fef2f2" : "#ffffff"),
            color: isUser ? "#ffffff" : "#0f172a",
            border: isUser ? "none" : (isRestricted ? "1px solid #fecaca" : "1px solid #e2e8f0"),
            borderRadius: "10px",
            padding: "10px 14px",
            fontSize: "13px",
            lineHeight: 1.45,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            position: "relative"
          }}
        >
          {/* Header indicator for assistant */}
          {!isUser && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", marginBottom: "4px" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: isRestricted ? "#dc2626" : "#15803d",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                {isRestricted ? <AlertCircle size={11} /> : <ShieldCheck size={11} />}
                <span>{isRestricted ? "Domain Notice" : "Verified PM-AJAY / NSQF Help"}</span>
              </span>

              {onSpeak && (
                <button
                  type="button"
                  onClick={() => onSpeak(message.text)}
                  title="Listen to response"
                  style={{ color: "#64748b", cursor: "pointer", padding: "2px" }}
                >
                  <Volume2 size={13} />
                </button>
              )}
            </div>
          )}

          {/* Text Content */}
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {message.text}
          </p>

          <span
            style={{
              display: "block",
              fontSize: "10px",
              color: isUser ? "rgba(255,255,255,0.7)" : "#94a3b8",
              marginTop: "4px",
              textAlign: "right"
            }}
          >
            {message.time || "Just now"}
          </span>
        </div>
      </div>
    </div>
  );
}
