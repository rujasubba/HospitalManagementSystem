using System.ComponentModel.DataAnnotations;

namespace HMSAPI.DTOs
{
 
    public class PortalBookingDto
    {
        public int DoctorId { get; set; }
        public int AppointmentTypeId { get; set; }
        public DateTime AppointmentDate { get; set; }

        [Required, StringLength(5)]
        public string TimeSlot { get; set; } = string.Empty;
    }
     public class DoctorOptionDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Specialty { get; set; } = string.Empty;
    }

    public class AppointmentTypeOptionDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
} 
