using HMSAPI.Data;
using HMSAPI.DTOs;
using HMSAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HMSAPI.Controllers
{


    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentController(AppDbContext context) : ControllerBase
    {
        private const int DefaultPendingStatusId = 3;

        private static readonly TimeSpan WorkDayStart = TimeSpan.FromHours(9);
        private static readonly TimeSpan WorkDayEnd = TimeSpan.FromHours(17);
        private static readonly TimeSpan SlotLength = TimeSpan.FromMinutes(30);

        private static List<string> AllSlots()
        {
            var slots = new List<string>();
            for (var t = WorkDayStart; t + SlotLength <= WorkDayEnd; t += SlotLength)
                slots.Add(t.ToString(@"hh\:mm"));
            return slots;
        }

        private static bool IsInPast(DateTime day, string slot, DateTime now)
        {
            var slotStart = day.Date + TimeSpan.Parse(slot);
            return slotStart <= now;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var appointments = await context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Include(a => a.AppointmentType)
                .Include(a => a.AppointmentStatus)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return Ok(appointments);
        }

        [HttpGet("slots")]
        public async Task<IActionResult> GetSlots([FromQuery] int doctorId, [FromQuery] DateTime date)
        {
            var doctorExists = await context.Doctors.AnyAsync(d => d.Id == doctorId);
            if (!doctorExists) return NotFound("Doctor not found.");

            var day = date.Date;
            var nextDay = day.AddDays(1);

            var booked = await context.Appointments
                .Where(a => a.DoctorId == doctorId
                         && a.AppointmentDate >= day
                         && a.AppointmentDate < nextDay
                         && a.AppointmentStatus.Name != "Cancelled")
                .Select(a => a.TimeSlot)
                .ToListAsync();

            var now = DateTime.Now;
            var slots = AllSlots().Select(time => new AppointmentSlotDto
            {
                Time = time,
                Available = !booked.Contains(time) && !IsInPast(day, time, now),
            });

            return Ok(slots);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var appointment = await context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Include(a => a.AppointmentType)
                .Include(a => a.AppointmentStatus)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null) return NotFound();
            return Ok(appointment);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateAppointmentDto dto)
        {
            var patientExists = await context.Patients.AnyAsync(p => p.Id == dto.PatientId);
            if (!patientExists) return BadRequest("Selected patient does not exist.");

            var doctorExists = await context.Doctors.AnyAsync(d => d.Id == dto.DoctorId);
            if (!doctorExists) return BadRequest("Selected doctor does not exist.");

            var typeExists = await context.AppointmentType.AnyAsync(t => t.Id == dto.AppointmentTypeId);
            if (!typeExists) return BadRequest("Selected appointment type does not exist.");

            if (!AllSlots().Contains(dto.TimeSlot))
                return BadRequest("Selected time is not a valid appointment slot.");

            var day = dto.AppointmentDate.Date;
            if (IsInPast(day, dto.TimeSlot, DateTime.Now))
                return BadRequest("Selected slot is in the past.");

            var nextDay = day.AddDays(1);
            var slotTaken = await context.Appointments.AnyAsync(a =>
                a.DoctorId == dto.DoctorId
                && a.AppointmentDate >= day
                && a.AppointmentDate < nextDay
                && a.TimeSlot == dto.TimeSlot
                && a.AppointmentStatus.Name != "Cancelled");
            if (slotTaken) return BadRequest("This time slot is already booked for the selected doctor.");

            var appointment = new Appointment
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                AppointmentTypeId = dto.AppointmentTypeId,
                AppointmentDate = dto.AppointmentDate,
                TimeSlot = dto.TimeSlot,
                //Notes = dto.Notes,
                AppointmentStatusId = 3,
                CreatedAt = DateTime.UtcNow,
            };

            context.Appointments.Add(appointment);
            await context.SaveChangesAsync();

            var created = await context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Include(a => a.AppointmentType)
                .Include(a => a.AppointmentStatus)
                .FirstOrDefaultAsync(a => a.Id == appointment.Id);

            return CreatedAtAction(nameof(GetById), new { id = appointment.Id }, created);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateAppointmentStatusDto dto)
        {
            var appointment = await context.Appointments.FindAsync(id);
            if (appointment == null) return NotFound();

            var statusExists = await context.AppointmentStatus.AnyAsync(s => s.Id == dto.AppointmentStatusId);
            if (!statusExists) return BadRequest("Selected status does not exist.");

            appointment.AppointmentStatusId = dto.AppointmentStatusId;
            await context.SaveChangesAsync();
            return Ok(appointment);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var appointment = await context.Appointments.FindAsync(id);
            if (appointment == null) return NotFound();

            context.Appointments.Remove(appointment);
            await context.SaveChangesAsync();
            return NoContent();
        }
    }
}