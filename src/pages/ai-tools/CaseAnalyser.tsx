
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AiToolLayout from '@/components/AiToolLayout';

const CaseAnalyser = () => {
  const location = useLocation();
  const { caseData } = location.state || {};

  return (
    <AiToolLayout
      title="AI Case Analyser"
      description={caseData ? `Analyze legal case: ${caseData.title} (${caseData.case_number})` : "Analyze legal cases with AI-powered insights to identify key patterns, precedents, and case outcomes."}
      botName="AI Case Analyser Bot"
    />
  );
};

export default CaseAnalyser;
