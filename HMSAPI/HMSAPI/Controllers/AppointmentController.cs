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
            if (!patientExists) return BadRequest("No Patient found");

            var doctorExists = await context.Doctors.AnyAsync(d => d.Id == dto.DoctorId);
            if (!doctorExists) return BadRequest("No doctor found");

            var typeExists = await context.AppointmentType.AnyAsync(t => t.Id == dto.AppointmentTypeId);
            if (!typeExists) return BadRequest("Selected appointment type does not exist.");

            var appointment = new Appointment
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                AppointmentTypeId = dto.AppointmentTypeId,
                AppointmentDate = dto.AppointmentDate,
                TimeSlot = dto.TimeSlot,
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