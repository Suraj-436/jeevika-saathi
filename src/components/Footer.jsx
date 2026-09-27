import React from "react";
import { Link } from "react-router-dom";
import NationalEmblem from "./NationalEmblem";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const lastUpdated = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  return (
    <footer
      style={{
        backgroundColor: "#1a1a2e",
        color: "#d0d0d0",
        fontSize: "12px",
        marginTop: "32px"
      }}
    >
      {/* 4 Columns */}
      <div
        style={{
          maxWidth: "var(--max-content-width)",
          margin: "0 auto",
          padding: "32px 24px 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "28px"
        }}
      >
        {/* Column 1: PM-AJAY */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <NationalEmblem size={26} light={true} showMotto={false} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                PM-AJAY
              </div>
              <div style={{ fontSize: "10px", color: "#a0a0a0" }}>
                Jeevika Saathi Portal
              </div>
            </div>
          </div>
          <p style={{ lineHeight: 1.6, color: "#a0a0a0", fontSize: "11px", margin: 0 }}>
            Pradhan Mantri Anusuchit Jaati Abhyuday Yojana (PM-AJAY) is an initiative by the Ministry of Social Justice and Empowerment for comprehensive livelihood development.
          </p>
        </div>

        {/* Column 2: Important Links */}
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff", marginBottom: "10px" }}>
            Important Links
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
            <li><a href="https://socialjustice.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "#b0b0d0", textDecoration: "none" }}>Ministry of Social Justice & Empowerment</a></li>
            <li><a href="https://www.msde.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "#b0b0d0", textDecoration: "none" }}>Ministry of Skill Development (MSDE)</a></li>
            <li><a href="https://www.skillindiadigital.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "#b0b0d0", textDecoration: "none" }}>Skill India Digital Hub</a></li>
            <li><a href="https://ncvet.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "#b0b0d0", textDecoration: "none" }}>NCVET Qualification Portal</a></li>
            <li><a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "#b0b0d0", textDecoration: "none" }}>National Portal of India</a></li>
          </ul>
        </div>

        {/* Column 3: Citizen Services */}
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff", marginBottom: "10px" }}>
            Citizen Services
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", color: "#a0a0a0" }}>
            <li>Voice-Based Skill Assessment</li>
            <li>Beneficiary Livelihood Profile</li>
            <li>NSQF Certified Courses</li>
            <li>Nearby Training Centers Directory</li>
          </ul>
        </div>

        {/* Column 4: Help & Support */}
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff", marginBottom: "10px" }}>
            Help & Support
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "11px", color: "#a0a0a0" }}>
            <div>National Toll-Free: <strong style={{ color: "#ffffff" }}>14449</strong></div>
            <div>Email: support-pmajay@gov.in</div>
            <div>Working Hours: Mon–Fri, 9:00 AM – 5:30 PM</div>
            <div style={{ marginTop: "4px" }}>
              <a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "#8ab4f8", textDecoration: "none" }}>
                CPGRAMS Grievance Portal
              </a>
            </div>
            <div style={{ marginTop: "4px" }}>
              <Link to="/help" style={{ color: "#8ab4f8", textDecoration: "none", fontWeight: 700 }}>
                Help & FAQ →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Government standard links row */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "12px 24px"
        }}
      >
        <div
          style={{
            maxWidth: "var(--max-content-width)",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "16px",
            fontSize: "11px"
          }}
        >
          <a href="#" style={{ color: "#b0b0d0", textDecoration: "none" }}>Sitemap</a>
          <span style={{ color: "#555" }}>|</span>
          <a href="#" style={{ color: "#b0b0d0", textDecoration: "none" }}>RTI</a>
          <span style={{ color: "#555" }}>|</span>
          <a href="#" style={{ color: "#b0b0d0", textDecoration: "none" }}>Terms of Use</a>
          <span style={{ color: "#555" }}>|</span>
          <a href="#" style={{ color: "#b0b0d0", textDecoration: "none" }}>Privacy Policy</a>
          <span style={{ color: "#555" }}>|</span>
          <a href="#" style={{ color: "#b0b0d0", textDecoration: "none" }}>Accessibility Statement</a>
          <span style={{ color: "#555" }}>|</span>
          <a href="#" style={{ color: "#b0b0d0", textDecoration: "none" }}>Web Information Manager</a>
          <span style={{ color: "#555" }}>|</span>
          <a href="#" style={{ color: "#b0b0d0", textDecoration: "none" }}>Disclaimer</a>
        </div>
      </div>

      {/* Bottom Bar: NIC attribution, Last Updated, Visitors */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "10px 24px"
        }}
      >
        <div
          style={{
            maxWidth: "var(--max-content-width)",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
            fontSize: "10px",
            color: "#888888"
          }}
        >
          <div>
            © {currentYear} Government of India | Ministry of Social Justice & Empowerment
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span>Last Updated: {lastUpdated}</span>
            <span>Visitors: 1,28,547</span>
          </div>
          <div>
            Designed, Developed and Hosted by National Informatics Centre (NIC)
          </div>
        </div>
      </div>
    </footer>
  );
}
