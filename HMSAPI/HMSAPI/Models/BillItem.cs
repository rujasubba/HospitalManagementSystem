namespace HMSAPI.Models
{
    public class BillItem
    {
        public int Id { get; set; }

        public int BillId { get; set; }
        public Bill Bill { get; set; }

        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
    }
}
