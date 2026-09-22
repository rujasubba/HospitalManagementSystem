
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Patients from './pages/patients/Patients';
import Dashboard from './Pages/dashboard/Dashboard';
import Doctors from './Pages/doctors/Doctors';
import PatientProfile from './pages/patients/PatientProfile';
import DoctorProfile from './pages/doctors/DoctorProfile';
import Appointments from './Pages/appointments/Appointments';
import AppointmentDetails from './Pages/appointments/AppointmentDetails';

import MedicalRecords from './Pages/medicalRecord/MedicalRecords';
import MedicalRecordDetails from './Pages/medicalRecord/MedicalRecordDetails';

import BillDetails from './Pages/billing/BillDetails';
import Bills from './Pages/billing/Bills';

import LabResults from './Pages/labResults/LabResults';
import LabResultDetails from './Pages/labResults/LabResultDetails';

function PlaceholderPage({ title }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            gap: 12,
            color: '#6b6b68',
        }}>
            <i className="ti ti-tools" style={{ fontSize: 40, color: '#1D9E75' }} />
            <h2 style={{ fontSize: 18, fontWeight: 500, color: '#1a1a18' }}>{title}</h2>
            <p style={{ fontSize: 14 }}>This page is under construction.</p>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route path="/patients" element={<Patients />} />
                    <Route path="patients/:id" element={<PatientProfile />} />

                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="appointments/:id" element={<AppointmentDetails />} />

                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="doctors/:id" element={<DoctorProfile />} />

                    <Route path="/records" element={<MedicalRecords />} />
                    <Route path="records/:id" element={<MedicalRecordDetails />} />

                    <Route path="lab" element={<LabResults />} />
                    <Route path="lab/:id" element={<LabResultDetails />} />

                    <Route path="/billing" element={<Bills />} />
                    <Route path="billing/:id" element={<BillDetails />} />

                    <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
                    <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}


