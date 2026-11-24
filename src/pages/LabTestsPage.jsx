import React from 'react';
import LabTestsSection from '../components/LabTestsSection';

export default function LabTestsPage({ selectedCity, onTestBooked }) {
  return (
    <div className="pt-4">
      <LabTestsSection selectedCity={selectedCity} onTestBooked={onTestBooked} />
    </div>
  );
}
