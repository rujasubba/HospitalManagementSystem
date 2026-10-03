import axiosInstance from '../api/axiosInstance';

export const getAllAppointments = async () => {
    const res = await axiosInstance.get('/appointment');
    return res.data;
};


export const getAppointmentById = (id) => {
    return axiosInstance.get(`/appointment/${id}`);
};

export const createAppointment = async (appointmentData) => {
    const res = await axiosInstance.post('/appointment', appointmentData);
    return res.data;
};

export const updateAppointmentStatus = async (id, appointmentStatusId) => {
    const res = await axiosInstance.put(`/appointment/${id}/status`, {
        appointmentStatusId,
    });
    return res.data;
};

export const deleteAppointment = async (id) => {
    await axiosInstance.delete(`/appointment/${id}`);
};

export const getAvailableSlots = async (doctorId, date) => {
    const res = await axiosInstance.get('/appointment/slots', {
        params: { doctorId, date },
    });
    return res.data;
};

export const rescheduleAppointment = async (id, { appointmentDate, timeSlot }) => {
    const res = await axiosInstance.put(`/appointment/${id}/reschedule`, {
        appointmentDate,
        timeSlot,
    });
    return res.data;
};

export const getSlotsForReschedule = async (appointmentId, date) => {
    const res = await axiosInstance.get(`/appointment/${appointmentId}/slots`, {
        params: { date },
    });
    return res.data;
};