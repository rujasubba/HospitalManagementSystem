namespace HospitalManagementAPI.Models
{
    public class Patient
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public int Age { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Ward { get; set; } = string.Empty;
        public string Status { get; set; } = "Admitted"; // Admitted, Outpatient, Discharged, Critical
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
