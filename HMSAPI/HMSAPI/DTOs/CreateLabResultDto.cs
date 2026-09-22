namespace HMSAPI.DTOs
{
    public class CreateLabResultDto
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public string TestName { get; set; } = string.Empty;
        public string ResultValue { get; set; } = string.Empty;
        public string ReferenceRange { get; set; } = string.Empty;
        public string Status { get; set; } = "Normal";
        public DateTime? TestDate { get; set; }
    }
}
