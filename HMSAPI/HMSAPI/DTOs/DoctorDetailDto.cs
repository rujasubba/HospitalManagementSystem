namespace HMSAPI.DTOs
{
    public class DoctorDetailDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Specialty { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int ConfirmedPatientsCount { get; set; }
        public List<AppointmentSummaryDto> ConfirmedAppointments { get; set; } = new();
    }
}
