namespace HospitalManagementAPI.Models
{
    public class Doctor
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Specialty { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Status { get; set; } = "On Duty"; // On Duty, Off Duty, On Leave
        public int PatientCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
