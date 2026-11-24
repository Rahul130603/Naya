import React from 'react';
import DoctorDirectory from '../components/DoctorDirectory';

export default function ConsultSexologistPage({ 
  selectedCity, 
  selectedSpecialty, 
  setSelectedSpecialty, 
  onBookAppointment, 
  onStartVideoConsult 
}) {
  return (
    <div className="pt-4">
      <DoctorDirectory
        selectedCity={selectedCity}
        selectedSpecialty={selectedSpecialty}
        setSelectedSpecialty={setSelectedSpecialty}
        onBookAppointment={onBookAppointment}
        onStartVideoConsult={onStartVideoConsult}
      />
    </div>
  );
}
