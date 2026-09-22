import axiosInstance from '../api/axiosInstance';

export const getAllBills = async () => {
    const res = await axiosInstance.get('/bill');
    return res.data;
};

export const getBillById = async (id) => {
    const res = await axiosInstance.get(`/bill/${id}`);
    return res.data;
};

export const getBillByAppointmentId = async (appointmentId) => {
    try {
        const res = await axiosInstance.get(`/bill/appointment/${appointmentId}`);
        return res.data;
    } catch (err) {
        if (err.response?.status === 404) return null;
        throw err;
    }
};

export const createBill = async ({ appointmentId, paymentMethod, items }) => {
    const res = await axiosInstance.post('/bill', {
        appointmentId,
        paymentMethod,
        items,
    });
    return res.data;
};

export const updateBillStatus = async (id, paymentStatus, paymentMethod) => {
    const res = await axiosInstance.put(`/bill/${id}/status`, {
        paymentStatus,
        paymentMethod,
    });
    return res.data;
};

export const deleteBill = async (id) => {
    await axiosInstance.delete(`/bill/${id}`);
};
