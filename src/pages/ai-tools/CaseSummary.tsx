
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AiToolLayout from '@/components/AiToolLayout';

const CaseSummary = () => {
  const location = useLocation();
  const { caseData } = location.state || {};

  return (
    <AiToolLayout
      title="AI Case Summary"
      description={caseData ? `Generate summary for case: ${caseData.title} (${caseData.case_number})` : "Generate comprehensive case summaries with key findings, timelines, and important legal points."}
      botName="AI Case Summary Bot"
    />
  );
};

export default CaseSummary;
