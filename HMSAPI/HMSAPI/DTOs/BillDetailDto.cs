namespace HMSAPI.DTOs
{
    public class BillDetailDto
    {
        public int Id { get; set; }

        public int AppointmentId { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }

        public string PaymentStatus { get; set; } = string.Empty;
        public string? PaymentMethod { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }

        public decimal TotalAmount { get; set; }
        public List<BillItemSummaryDto> Items { get; set; } = new();
    }
}
