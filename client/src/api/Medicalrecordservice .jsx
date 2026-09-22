import axiosInstance from '../api/axiosInstance';

export const getAllMedicalRecords = async () => {
    const res = await axiosInstance.get('/medicalrecord');
    return res.data;
};

export const getMedicalRecordById = async (id) => {
    const res = await axiosInstance.get(`/medicalrecord/${id}`);
    return res.data;
};

export const getMedicalRecordsByPatientId = async (patientId) => {
    const res = await axiosInstance.get(`/medicalrecord/patient/${patientId}`);
    return res.data;
};

export const createMedicalRecord = async (dto) => {
    const res = await axiosInstance.post('/medicalrecord', dto);
    return res.data;
};

export const updateMedicalRecord = async (id, dto) => {
    const res = await axiosInstance.put(`/medicalrecord/${id}`, dto);
    return res.data;
};

export const deleteMedicalRecord = async (id) => {
    await axiosInstance.delete(`/medicalrecord/${id}`);
};