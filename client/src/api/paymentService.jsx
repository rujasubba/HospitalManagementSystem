import axiosInstance from "./axiosInstance";
let mockPayments = [
    {
        id: 1,
        billNo: "01",
        patientName: "Ashton Cox",
        doctorName: "Dr. Anna Mull",
        billDate: "2022-12-28",
        paymentMethod: "Cash",
        status: "Paid",
        amount: 150,
    },
    {
        id: 2,
        billNo: "02",
        patientName: "Brielle Williamson",
        doctorName: "Dr. Hal Appeno",
        billDate: "2022-10-25",
        paymentMethod: "Cheque",
        status: "Pending",
        amount: 200,
    },
    {
        id: 3,
        billNo: "03",
        patientName: "Cedric Kelly",
        doctorName: "Dr. Pat Agonia",
        billDate: "2022-05-11",
        paymentMethod: "Credit Card",
        status: "Paid",
        amount: 350,
    },
];

const simulateDelay = (data) =>
    new Promise((resolve) => setTimeout(() => resolve(data), 300));

export function getPayments() {
    return simulateDelay([...mockPayments]);
}

export function addPayment(payload) {
    const newPayment = {
        id: mockPayments.length ? Math.max(...mockPayments.map((p) => p.id)) + 1 : 1,
        ...payload,
    };
    mockPayments = [...mockPayments, newPayment];
    return simulateDelay(newPayment);
}

export function deletePayment(id) {
    mockPayments = mockPayments.filter((p) => p.id !== id);
    return simulateDelay({ success: true });
}

export { axiosInstance };
