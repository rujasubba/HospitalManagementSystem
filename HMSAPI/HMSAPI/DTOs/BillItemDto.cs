namespace HMSAPI.DTOs
{
    public class BillItemDto
    {
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
    }
}
