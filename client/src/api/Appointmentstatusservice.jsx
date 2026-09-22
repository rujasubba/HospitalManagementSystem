import axiosInstance from './axiosInstance';
 
export async function getAllAppointmentStatuses() {
    const res = await axiosInstance.get('/appointmentstatus');
    return res.data;
}