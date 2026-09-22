namespace HospitalManagementAPI.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;  // ECG Review, MRI, Follow-up etc
        public DateTime AppointmentDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty; // e.g. "09:00"
        public string Status { get; set; } = "Pending";  // Pending, Confirmed, Completed, Cancelled
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
