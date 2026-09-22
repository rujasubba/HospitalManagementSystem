namespace HMSAPI.DTOs
{
    public class CreateBillDto
    {
        public int AppointmentId { get; set; }
        public string? PaymentMethod { get; set; }
        public List<BillItemDto> Items { get; set; } = new();
    }
}
