namespace HMSAPI.DTOs
{
    public class UpdateBillStatusDto
    {
        public string PaymentStatus { get; set; } = string.Empty;
        public string? PaymentMethod { get; set; }
    }
}
