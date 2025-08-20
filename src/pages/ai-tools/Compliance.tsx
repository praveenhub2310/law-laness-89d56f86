
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AiToolLayout from '@/components/AiToolLayout';

const Compliance = () => {
  const location = useLocation();
  const { caseData } = location.state || {};

  return (
    <AiToolLayout
      title="AI Legal Compliance"
      description={caseData ? `Check compliance for case: ${caseData.title} (${caseData.case_number})` : "Provide information on legal compliance to ensure adherence to relevant laws and regulations."}
      botName="AI Legal Compliance Bot"
    />
  );
};

export default Compliance;
