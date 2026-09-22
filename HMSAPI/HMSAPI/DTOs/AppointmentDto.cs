namespace HMSAPI.DTOs
{
    public class CreateAppointmentDto
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public int AppointmentTypeId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class UpdateAppointmentStatusDto
    {
        public int AppointmentStatusId { get; set; }
    }
}
