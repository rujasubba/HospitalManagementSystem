namespace HMSAPI.DTOs
{
    public class LabResultDetailDto
    {
        public int Id { get; set; }

        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;

        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialty { get; set; } = string.Empty;

        public string TestName { get; set; } = string.Empty;
        public string ResultValue { get; set; } = string.Empty;
        public string ReferenceRange { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        public DateTime TestDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
