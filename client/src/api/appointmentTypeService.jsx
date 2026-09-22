import axiosInstance from '../api/axiosInstance';

export const getAllAppointmentTypes = async () => {
    const res = await axiosInstance.get('/appointmenttype');
    return res.data;
};