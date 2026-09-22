namespace HMSAPI.Models
{
    public class Bill
    {
        public int Id { get; set; }

        public int AppointmentId { get; set; }
        public Appointment Appointment { get; set; }

        public string PaymentStatus { get; set; } = "Unpaid";
        public string? PaymentMethod { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }

        public ICollection<BillItem> Items { get; set; } = new List<BillItem>();
    }
}
