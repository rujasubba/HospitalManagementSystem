namespace HMSAPI.DTOs
{
    public class AppointmentSummaryDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialty { get; set; } = string.Empty;
        public string AppointmentTypeName { get; set; } = string.Empty;
        public string StatusName { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
    }
}
