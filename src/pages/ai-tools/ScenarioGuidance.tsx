import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AiToolLayout from '@/components/AiToolLayout';

const ScenarioGuidance = () => {
  const location = useLocation();
  const { caseData } = location.state || {};

  return (
    <AiToolLayout
      title="AI Scenario Guidance"
      description={caseData ? `Get strategic guidance for case: ${caseData.title} (${caseData.case_number})` : "Get AI-powered guidance for case scenarios and strategic decision-making."}
      botName="AI Scenario Guidance Bot"
    />
  );
};

export default ScenarioGuidance;