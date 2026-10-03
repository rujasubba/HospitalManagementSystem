namespace HMSAPI.DTOs
{
    public class RescheduleAppointmentDto
    {
        public DateTime AppointmentDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
    }
}
