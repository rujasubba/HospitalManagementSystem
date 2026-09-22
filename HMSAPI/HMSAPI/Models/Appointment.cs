
namespace HMSAPI.Models
{
    public class Appointment
    {
        public int Id { get; set; }

        public int PatientId { get; set; }
        public Patient Patient { get; set; }

        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; }

        public int AppointmentTypeId { get; set; }
        public AppointmentType AppointmentType { get; set; }

        public int AppointmentStatusId { get; set; }
        public AppointmentStatus AppointmentStatus { get; set; }

        public DateTime AppointmentDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
