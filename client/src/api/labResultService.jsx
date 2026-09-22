import axiosInstance from '../api/axiosInstance';

export const getAllLabResults = async () => {
    const res = await axiosInstance.get('/labresult');
    return res.data;
};

export const getLabResultById = async (id) => {
    const res = await axiosInstance.get(`/labresult/${id}`);
    return res.data;
};

export const getLabResultsByPatientId = async (patientId) => {
    const res = await axiosInstance.get(`/labresult/patient/${patientId}`);
    return res.data;
};

export const createLabResult = async (dto) => {
    const res = await axiosInstance.post('/labresult', dto);
    return res.data;
};

export const updateLabResult = async (id, dto) => {
    const res = await axiosInstance.put(`/labresult/${id}`, dto);
    return res.data;
};

export const deleteLabResult = async (id) => {
    await axiosInstance.delete(`/labresult/${id}`);
};