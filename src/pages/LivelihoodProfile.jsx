import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession, formatFieldValue, countFilledSteps } from '../context/SessionContext';
import { ASSESSMENT_FIELDS, REQUIRED_STEPS } from '../config/demoData';

export default function LivelihoodProfile() {
  const navigate = useNavigate();
  const { assessmentStatus, beneficiaryProfile, startNewSession } = useSession();

  // If there's absolutely no data (idle)
  const isIdle = assessmentStatus === 'idle';
  const isActive = assessmentStatus === 'active';
  const isComplete = assessmentStatus === 'completed';

  const filledSteps = countFilledSteps(beneficiaryProfile, REQUIRED_STEPS);
  const totalSteps = REQUIRED_STEPS.length;
  const completionPercentage = Math.round((filledSteps / totalSteps) * 100);

  if (isIdle) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] max-w-3xl mx-auto text-center px-4">
        <span className="material-symbols-outlined text-6xl text-secondary mb-4">assignment_ind</span>
        <h1 className="font-display-hero text-4xl text-primary font-bold mb-4">Your Livelihood Profile</h1>
        <p className="text-on-surface-variant text-lg mb-8">
          No livelihood profile available yet.
        </p>
        <button 
          className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-90"
          onClick={() => {
            startNewSession(false);
            navigate('/voice');
          }}
        >
          <span className="material-symbols-outlined">mic</span>
          Start Voice Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full relative">
      <section className="relative w-full px-space-md sm:px-space-xl py-space-xl overflow-hidden bg-surface">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-space-2xs rounded-full">
              <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="font-label-sm text-label-sm text-on-surface tracking-wide uppercase">PM-AJAY Sovereign Skill Registry</span>
            </div>
            <div className="flex items-center gap-space-sm text-on-surface-variant font-label-sm text-label-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
              <span>Source: <strong className="text-secondary">Live Voice Assessment</strong></span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
            <div className="max-w-3xl space-y-space-xs">
              <h1 className="font-display-hero text-display-hero text-primary tracking-tight font-extrabold">
                {isActive ? 'Profile in progress...' : 'Livelihood Profile'}
              </h1>
              {isActive && (
                <p className="font-body-xl text-body-xl text-on-surface-variant italic">
                  Your livelihood profile is being built from your conversation.
                </p>
              )}
            </div>
            
            <div className="flex-shrink-0 flex gap-2">
              <button 
                className="px-4 py-2 bg-surface-container-high text-primary rounded-xl font-bold flex items-center gap-2 hover:bg-surface-container-highest transition"
                onClick={() => navigate('/voice')}
              >
                <span className="material-symbols-outlined text-sm">record_voice_over</span>
                {isActive ? 'Return to Assessment' : 'Restart Assessment'}
              </button>
            </div>
          </div>

          {/* Profile Confidence Overview Strip */}
          <div className="relative bg-surface-container-low rounded-3xl p-space-lg shadow-sm overflow-hidden mt-4">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary-fixed-dim/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative flex flex-col xl:flex-row items-start xl:items-center gap-space-lg">
              <div className="flex items-center gap-space-lg w-full">
                <div className="relative flex items-center justify-center w-20 h-20 flex-shrink-0">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 72 72">
                    <circle className="text-surface-container-high" cx="36" cy="36" fill="transparent" r="30" stroke="currentColor" strokeWidth="6"></circle>
                    <circle className="text-secondary" cx="36" cy="36" fill="transparent" r="30" stroke="currentColor" strokeDasharray="188.4" strokeDashoffset={`${188.4 - (188.4 * completionPercentage) / 100}`} strokeLinecap="round" strokeWidth="6"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline-sm text-headline-sm font-bold text-primary">{completionPercentage}%</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-space-xs">
                    <h3 className="font-headline-sm text-headline-sm text-primary">Data Collection</h3>
                    <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isComplete ? 'check_circle' : 'pending'}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-1">
                    {filledSteps} of {totalSteps} core fields detected.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* The Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {ASSESSMENT_FIELDS.map(({ key, label, icon }) => {
              const value = beneficiaryProfile[key];
              const isDetected = value !== null && value !== undefined && (Array.isArray(value) ? value.length > 0 : String(value).trim() !== '');
              const formattedValue = formatFieldValue(key, value);

              return (
                <div key={key} className={`p-6 rounded-2xl shadow-sm border transition-colors ${isDetected ? 'bg-surface-container-lowest border-primary/20' : 'bg-surface-container-low border-transparent opacity-70'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDetected ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-outline'}`}>
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
                        {isDetected && (
                          <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                        )}
                      </div>
                      
                      {isDetected ? (
                        <div className="font-body-lg text-body-lg font-bold text-on-surface">
                          {formattedValue}
                        </div>
                      ) : (
                        <div className="font-body-md text-body-md text-outline italic">
                          Not yet detected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {isComplete && (
            <div className="mt-8 flex justify-end">
              <button 
                className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center gap-2 shadow-md hover:opacity-90"
                onClick={() => navigate('/skills')}
              >
                Proceed to Skill Analysis
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
