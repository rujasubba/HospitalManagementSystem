namespace HMSAPI.DTOs
{
    public class UpdateMedicalRecordDto
    {
        public string Diagnosis { get; set; } = string.Empty;
        public string Prescription { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime RecordDate { get; set; }
    }
}
