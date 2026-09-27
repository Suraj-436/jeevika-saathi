import React from "react";
import VoiceAssessment from "../components/VoiceAssessment";

export default function VoiceAssessmentPage({ onNavigateToCenters, onComplete }) {
  return (
    <div>
      <VoiceAssessment
        onComplete={onComplete}
        onNavigateToCenters={onNavigateToCenters}
      />
    </div>
  );
}
