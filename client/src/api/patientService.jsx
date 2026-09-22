
import api from './axiosInstance';

// ── matches GET api/patients ──────────────────────────────────
export async function getAllPatients() {
    const response = await api.get('/patients');
    return response.data;
}

export async function getPatientById(id) {
    const response = await api.get(`/patients/${id}`);
    return response.data;
}

export async function createPatient(patientData) {
    const response = await api.post('/patients', patientData);
    return response.data;
}


export async function updatePatient(id, patientData) {
    const response = await api.put(`/patients/${id}`, { ...patientData, id });
    return response.data;
}


export async function deletePatient(id) {
    await api.delete(`/patients/${id}`);
}