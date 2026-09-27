import React from "react";
import { Building2, MapPin, Phone, Calendar, ShieldCheck } from "lucide-react";

export default function OpportunityCard({ center, onEnroll }) {
  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        padding: "var(--space-5)",
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "var(--space-4)"
      }}
    >
      <div>
        {/* Header with PM-AJAY badge & distance */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--secondary-green)", display: "flex", alignItems: "center", gap: "4px" }}>
                <ShieldCheck size={13} />
                PM-AJAY Accredited
              </span>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>
                ({center.distance})
              </span>
            </div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.25 }}>
              {center.name}
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              {center.address}
            </p>
          </div>

          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              backgroundColor: "var(--accent-amber-light)",
              color: "var(--accent-amber)",
              padding: "2px 8px",
              borderRadius: "4px",
              whiteSpace: "nowrap"
            }}
          >
            Batch: {center.nextBatchDate}
          </span>
        </div>

        {/* Trades Offered */}
        <div style={{ margin: "var(--space-3) 0", padding: "var(--space-3) 0", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
            Available GIA Courses:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {center.trades.map((tr, i) => (
              <span
                key={i}
                style={{
                  fontSize: "11px",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  backgroundColor: "var(--surface-subtle)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontWeight: 600
                }}
              >
                {tr.name} ({tr.seats} seats)
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Contact & Action */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Phone size={13} /> {center.contact}
          </span>
          <span style={{ color: "var(--secondary-green)", fontWeight: 600 }}>
            {center.stipendStatus}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onEnroll(center)}
          className="gov-btn gov-btn-primary"
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          <span>Reserve Seat</span>
        </button>
      </div>
    </div>
  );
}
