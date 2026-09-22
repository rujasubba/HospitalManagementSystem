namespace HMSAPI.DTOs
{
    public class CreateMedicalRecordDto
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public string Diagnosis { get; set; } = string.Empty;
        public string Prescription { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime? RecordDate { get; set; }
    }
}
