import React from 'react';
import SurgeriesSection from '../components/SurgeriesSection';

export default function ProceduresPage({ selectedCity }) {
  return (
    <div className="pt-4">
      <SurgeriesSection selectedCity={selectedCity} />
    </div>
  );
}
