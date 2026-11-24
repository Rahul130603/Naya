import React from 'react';
import MedicinesSection from '../components/MedicinesSection';

export default function WellnessStorePage({ onOrderMedicine, storeOrders, onOpenTracking }) {
  return (
    <div className="pt-4">
      <MedicinesSection 
        onOrderMedicine={onOrderMedicine} 
        storeOrders={storeOrders}
        onOpenTracking={onOpenTracking}
      />
    </div>
  );
}
