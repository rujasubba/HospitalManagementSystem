namespace HMSAPI.DTOs
{
    public class UpdateLabResultDto
    {
        public string TestName { get; set; } = string.Empty;
        public string ResultValue { get; set; } = string.Empty;
        public string ReferenceRange { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime TestDate { get; set; }
    }
}
