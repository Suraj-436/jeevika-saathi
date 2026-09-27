import React, { useState } from "react";
import { 
  Users, CheckCircle2, TrendingUp, AlertTriangle, Building2, 
  MapPin, Award, Download, Filter, FileText, Check, ArrowUpRight
} from "lucide-react";
import NationalEmblem from "./NationalEmblem";
import JeevikaLogo from "./JeevikaLogo";
import { useLanguage } from "../context/LanguageContext";

export default function AdminDashboard({ darkMode }) {
  const { language } = useLanguage();
  const [selectedState, setSelectedState] = useState("All");

  const kpis = [
    { 
      label: "Total SC Beneficiaries Mobilized", 
      value: "4,821", 
      badge: "+14.2% this quarter", 
      icon: Users,
      badgeColor: "#15803d",
      bgBadge: "#dcfce7"
    },
    { 
      label: "Interviews & Assessments Completed", 
      value: "3,947", 
      badge: "81.8% completion rate", 
      icon: CheckCircle2,
      badgeColor: "#0369a1",
      bgBadge: "#e0f2fe"
    },
    { 
      label: "Enrolled in NSQF Level 3-5 Trades", 
      value: "2,103", 
      badge: "100% GIA Grant Funded", 
      icon: Award,
      badgeColor: "#b45309",
      bgBadge: "#fef3c7"
    },
    { 
      label: "Post-Skilling Placement & Self-Emp.", 
      value: "74.1%", 
      badge: "1,547 verified at 90 days", 
      icon: TrendingUp,
      badgeColor: "#6b21a8",
      bgBadge: "#f3e8ff"
    },
  ];

  const stateCohorts = [
    { state: "Uttar Pradesh", registered: 1840, enrolled: 890, placed: 680, rate: "76.4%", riskCount: 82, budget: "Rs 4.12 Cr" },
    { state: "Tamil Nadu", registered: 720, enrolled: 390, placed: 310, rate: "79.5%", riskCount: 28, budget: "Rs 1.85 Cr" },
    { state: "Telangana", registered: 610, enrolled: 290, placed: 220, rate: "75.8%", riskCount: 34, budget: "Rs 1.48 Cr" },
    { state: "Maharashtra", registered: 580, enrolled: 240, placed: 180, rate: "75.0%", riskCount: 22, budget: "Rs 1.35 Cr" },
    { state: "West Bengal", registered: 430, enrolled: 160, placed: 110, rate: "68.7%", riskCount: 31, budget: "Rs 0.98 Cr" },
    { state: "Punjab", registered: 340, enrolled: 133, placed: 97, rate: "72.9%", riskCount: 17, budget: "Rs 0.79 Cr" },
  ];

  const filteredCohorts = selectedState === "All" 
    ? stateCohorts 
    : stateCohorts.filter(c => c.state === selectedState);

  const handleExport = () => {
    alert("Official MIS Export Initiated: Generating PM-AJAY Q2 2026-27 GIA Performance Progress Report (PDF/Excel)...");
  };

  const handleDispatch = () => {
    alert("Outreach Task Dispatched: District Livelihood Officers and field counselors notified to conduct doorstep supportive counseling.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Government Identity Header for Dashboard */}
      <div className="gov-panel" style={{ borderLeft: "4px solid var(--gov-navy)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <NationalEmblem size={40} light={false} />
            <JeevikaLogo size={38} />
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                Ministry of Social Justice & Empowerment • Government of India
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--gov-navy)", margin: "2px 0 0" }}>
                PM-AJAY GIA Component — Management Information System (MIS)
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                Real-time monitoring of SC beneficiary skilling, GIA fund utilization, and 90-day post-training livelihood retention.
              </p>
            </div>
          </div>

          {/* Action Bar: Filter & Export */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label htmlFor="state-select" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
                State:
              </label>
              <select
                id="state-select"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                style={{
                  padding: "6px 10px",
                  fontSize: "12px",
                  border: "1px solid var(--border)",
                  borderRadius: "3px",
                  backgroundColor: "#ffffff",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  outline: "none"
                }}
              >
                <option value="All">All States (National Summary)</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Punjab">Punjab</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="gov-btn gov-btn-primary"
              style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Download size={13} />
              <span>Export MIS Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Official Institutional KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="gov-card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-secondary)" }}>
                  {kpi.label}
                </span>
                <div style={{ padding: "5px", borderRadius: "3px", backgroundColor: "#f1f5f9", color: "var(--gov-navy)" }}>
                  <Icon size={16} />
                </div>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--gov-navy)", lineHeight: 1.1 }}>
                {kpi.value}
              </div>
              <div style={{ marginTop: "6px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: kpi.badgeColor,
                    backgroundColor: kpi.bgBadge,
                    padding: "2px 6px",
                    borderRadius: "2px",
                    display: "inline-block"
                  }}
                >
                  {kpi.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Official Early Dropout Warning Alert */}
      <div
        className="gov-panel"
        style={{
          borderLeft: "4px solid #dc2626",
          backgroundColor: "#fff5f5",
          padding: "14px 18px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", maxWidth: "800px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "3px",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#991b1b" }}>
              Targeted Audit Alert: 214 Beneficiaries Flagged at Risk of Mid-Training Dropout
            </div>
            <p style={{ fontSize: "12px", color: "#7f1d1d", margin: "3px 0 0", lineHeight: 1.4 }}>
              Predictive livelihood monitoring detected travel distance impediments and stipend delay risks. District Livelihood Counseling Cells have been instructed to conduct direct field visits.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDispatch}
          className="gov-btn"
          style={{
            backgroundColor: "#dc2626",
            color: "#ffffff",
            padding: "8px 14px",
            fontSize: "12px",
            fontWeight: 700,
            whiteSpace: "nowrap"
          }}
        >
          Dispatch Support Teams
        </button>
      </div>

      {/* State SC Development Corporation Table */}
      <div className="gov-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "12px 18px",
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Building2 size={16} color="var(--gov-navy)" />
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--gov-navy)", margin: 0 }}>
              State Scheduled Caste Development Corporation (SCDC) Performance Matrix
            </h3>
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>
            Source: PM-AJAY MoSJE Direct API Feed • Q2 2026-27
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="gov-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>State / Implementing Body</th>
                <th style={{ textAlign: "right" }}>Beneficiaries Registered</th>
                <th style={{ textAlign: "right" }}>NSQF Enrolled</th>
                <th style={{ textAlign: "right" }}>Placed / Self-Employed</th>
                <th style={{ textAlign: "right" }}>Success Rate</th>
                <th style={{ textAlign: "right" }}>Dropout Risk</th>
                <th style={{ textAlign: "right" }}>GIA Allocation</th>
                <th style={{ textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCohorts.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: "var(--gov-navy)" }}>
                    {row.state} SCDC
                  </td>
                  <td style={{ textAlign: "right" }}>{row.registered.toLocaleString()}</td>
                  <td style={{ textAlign: "right" }}>{row.enrolled.toLocaleString()}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "var(--gov-green)" }}>
                    {row.placed.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    {row.rate}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span
                      style={{
                        padding: "2px 6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        borderRadius: "2px",
                        backgroundColor: row.riskCount > 30 ? "#fee2e2" : "#fef3c7",
                        color: row.riskCount > 30 ? "#991b1b" : "#92400e"
                      }}
                    >
                      {row.riskCount} flagged
                    </span>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{row.budget}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className="gov-badge gov-badge-approved">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
