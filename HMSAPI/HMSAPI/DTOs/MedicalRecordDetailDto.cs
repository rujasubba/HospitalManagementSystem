namespace HMSAPI.DTOs
{
    public class MedicalRecordDetailDto
    {
        public int Id { get; set; }

        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;

        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialty { get; set; } = string.Empty;

        public string Diagnosis { get; set; } = string.Empty;
        public string Prescription { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;

        public DateTime RecordDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
