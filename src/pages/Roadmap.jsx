import React from "react";
import RoadmapComponent from "../components/Roadmap";
import { useLanguage } from "../context/LanguageContext";
import { Workflow, Sparkles, ShieldCheck } from "lucide-react";

export default function Roadmap({ userProfile, onStartVoice }) {
  return <RoadmapComponent userProfile={userProfile} onStartVoice={onStartVoice} />;
}
