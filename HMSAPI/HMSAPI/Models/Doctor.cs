namespace HMSAPI.Models
{
    public class Doctor
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; }
        public string Specialty { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Status { get; set; } = "On Duty";
        public int PatientCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
