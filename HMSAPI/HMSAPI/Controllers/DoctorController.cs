
using HMSAPI.Data;
using HMSAPI.DTOs;
using HMSAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HMSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorController(AppDbContext dbContext) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var doctors = await dbContext.Doctors.ToListAsync();
            return Ok(doctors);
        }

        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var doctor = await dbContext.Doctors
                .Include(d => d.Appointments).ThenInclude(a => a.Patient)
                .Include(d => d.Appointments).ThenInclude(a => a.AppointmentType)
                .Include(d => d.Appointments).ThenInclude(a => a.AppointmentStatus)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (doctor == null) return NotFound();

            var confirmed = doctor.Appointments
                .Where(a => a.AppointmentStatus.Name == "Confirmed")
                .OrderBy(a => a.AppointmentDate)
                .Select(a => new AppointmentSummaryDto
                {
                    Id = a.Id,
                    PatientId = a.PatientId,
                    PatientName = a.Patient.FullName,
                    DoctorId = doctor.Id,
                    DoctorName = $"Dr. {doctor.FirstName} {doctor.LastName}",
                    DoctorSpecialty = doctor.Specialty,
                    AppointmentTypeName = a.AppointmentType.Name,
                    StatusName = a.AppointmentStatus.Name,
                    AppointmentDate = a.AppointmentDate,
                    TimeSlot = a.TimeSlot,
                })
                .ToList();

            var dto = new DoctorDetailDto
            {
                Id = doctor.Id,
                FirstName = doctor.FirstName,
                LastName = doctor.LastName,
                Specialty = doctor.Specialty,
                Phone = doctor.Phone,
                Email = doctor.Email,
                Status = doctor.Status,
                CreatedAt = doctor.CreatedAt,
                ConfirmedPatientsCount = confirmed.Select(a => a.PatientId).Distinct().Count(),
                ConfirmedAppointments = confirmed,
            };

            return Ok(dto);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Doctor doctor)
        {
            dbContext.Doctors.Add(doctor);
            await dbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = doctor.Id }, doctor);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var doctor = await dbContext.Doctors.FindAsync(id);
            if (doctor == null) return NotFound();
            dbContext.Doctors.Remove(doctor);
            await dbContext.SaveChangesAsync();
            return NoContent();
        }
    }
}

