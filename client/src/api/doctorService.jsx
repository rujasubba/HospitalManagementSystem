import api from './axiosInstance';

export async function getAllDoctors() {
    const response = await api.get('/doctor');
    return response.data;
}

export async function getDoctorById(id) {
    const response = await api.get(`/doctor/${id}`);
    return response.data;
}

export async function createDoctor(doctorData) {
    const response = await api.post('/doctor', doctorData);
    return response.data;
}

export async function deleteDoctor(id) {
    await api.delete(`/doctor/${id}`);
}

