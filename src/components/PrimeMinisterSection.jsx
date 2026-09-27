import React from "react";

export default function PrimeMinisterSection() {
  return (
    <section
      aria-label="Government Leadership and National Skilling Mission"
      className="gov-panel"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-5)",
        flexWrap: "wrap",
        padding: "var(--space-4) var(--space-5)"
      }}
    >
      {/* Official Government Photograph of Hon'ble Prime Minister */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            width: "76px",
            height: "76px",
            borderRadius: "var(--radius-xs)",
            overflow: "hidden",
            border: "1px solid var(--border)",
            backgroundColor: "#f8fafc"
          }}
        >
          <img
            src="/pm-modi.png"
            alt="Official portrait of Shri Narendra Modi, Prime Minister of India"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Narendra_Modi_official_portrait_2022.jpg/320px-Narendra_Modi_official_portrait_2022.jpg";
            }}
          />
        </div>
      </div>

      {/* Leadership Details & Factual Contextual Statement */}
      <div style={{ flex: 1, minWidth: "260px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)", marginBottom: "2px" }}>
          Prime Minister of India
        </div>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)", margin: "0 0 4px 0" }}>
          Shri Narendra Modi
        </h3>
        <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
          India's Digital Public Infrastructure and targeted affirmative initiatives such as PM-AJAY empower citizens through accessible, paperless service delivery, fostering grassroots skilling, Direct Benefit Transfers (DBT), and sustainable livelihood pathways for Scheduled Caste communities.
        </p>
      </div>

      {/* Official National Initiative Tag */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            backgroundColor: "var(--surface-subtle)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xs)",
            padding: "8px 14px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Government of India
          </div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--gov-navy)", marginTop: "2px" }}>
            National Skilling Mission
          </div>
        </div>
      </div>
    </section>
  );
}
