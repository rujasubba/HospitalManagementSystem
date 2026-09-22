using HMSAPI.Data;
using HMSAPI.DTOs;
using HMSAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HMSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BillController(AppDbContext context) : ControllerBase
    {
        private static BillDetailDto ToDto(Bill bill)
        {
            var items = bill.Items
                .Select(i => new BillItemSummaryDto
                {
                    Id = i.Id,
                    Description = i.Description,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    LineTotal = i.Quantity * i.UnitPrice,
                })
                .ToList();

            return new BillDetailDto
            {
                Id = bill.Id,
                AppointmentId = bill.AppointmentId,
                PatientId = bill.Appointment.PatientId,
                PatientName = bill.Appointment.Patient.FullName,
                DoctorId = bill.Appointment.DoctorId,
                DoctorName = $"Dr. {bill.Appointment.Doctor.FirstName} {bill.Appointment.Doctor.LastName}",
                AppointmentDate = bill.Appointment.AppointmentDate,
                PaymentStatus = bill.PaymentStatus,
                PaymentMethod = bill.PaymentMethod,
                CreatedAt = bill.CreatedAt,
                PaidAt = bill.PaidAt,
                TotalAmount = items.Sum(i => i.LineTotal),
                Items = items,
            };
        }

        
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var bills = await context.Bills
                .Include(b => b.Appointment).ThenInclude(a => a.Patient)
                .Include(b => b.Appointment).ThenInclude(a => a.Doctor)
                .Include(b => b.Items)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return Ok(bills.Select(ToDto));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var bill = await context.Bills
                .Include(b => b.Appointment).ThenInclude(a => a.Patient)
                .Include(b => b.Appointment).ThenInclude(a => a.Doctor)
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (bill == null) return NotFound();
            return Ok(ToDto(bill));
        }

        
        [HttpGet("appointment/{appointmentId}")]
        public async Task<IActionResult> GetByAppointmentId(int appointmentId)
        {
            var bill = await context.Bills
                .Include(b => b.Appointment).ThenInclude(a => a.Patient)
                .Include(b => b.Appointment).ThenInclude(a => a.Doctor)
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.AppointmentId == appointmentId);

            if (bill == null) return NotFound();
            return Ok(ToDto(bill));
        }

      
        [HttpPost]
        public async Task<IActionResult> Create(CreateBillDto dto)
        {
            var appointment = await context.Appointments.FindAsync(dto.AppointmentId);
            if (appointment == null) return BadRequest("Selected appointment does not exist.");

            var alreadyBilled = await context.Bills.AnyAsync(b => b.AppointmentId == dto.AppointmentId);
            if (alreadyBilled) return BadRequest("This appointment has already been billed.");

            if (dto.Items == null || dto.Items.Count == 0)
                return BadRequest("A bill needs at least one item.");

            var bill = new Bill
            {
                AppointmentId = dto.AppointmentId,
                PaymentMethod = dto.PaymentMethod,
                PaymentStatus = "Unpaid",
                CreatedAt = DateTime.UtcNow,
                Items = dto.Items.Select(i => new BillItem
                {
                    Description = i.Description,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                }).ToList(),
            };

            context.Bills.Add(bill);
            await context.SaveChangesAsync();

            var created = await context.Bills
                .Include(b => b.Appointment).ThenInclude(a => a.Patient)
                .Include(b => b.Appointment).ThenInclude(a => a.Doctor)
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.Id == bill.Id);

            return CreatedAtAction(nameof(GetById), new { id = bill.Id }, ToDto(created!));
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateBillStatusDto dto)
        {
            var bill = await context.Bills.FindAsync(id);
            if (bill == null) return NotFound();

            var validStatuses = new[] { "Unpaid", "Paid", "Overdue" };
            if (!validStatuses.Contains(dto.PaymentStatus))
                return BadRequest("PaymentStatus must be Unpaid, Paid, or Overdue.");

            bill.PaymentStatus = dto.PaymentStatus;
            if (dto.PaymentMethod != null) bill.PaymentMethod = dto.PaymentMethod;
            bill.PaidAt = dto.PaymentStatus == "Paid" ? DateTime.UtcNow : null;

            await context.SaveChangesAsync();
            return Ok(bill);
        }

       
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var bill = await context.Bills.FindAsync(id);
            if (bill == null) return NotFound();

            context.Bills.Remove(bill);
            await context.SaveChangesAsync();
            return NoContent();
        }
    }
}

