
using HMSAPI.Data;
using HMSAPI.DTOs;
using HMSAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HMSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController(AppDbContext dbContext) : ControllerBase
    {
      
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var patients = await dbContext.Patients.ToListAsync();
            return Ok(patients);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var patient = await dbContext.Patients
                .Include(p => p.Appointments).ThenInclude(a => a.Doctor)
                .Include(p => p.Appointments).ThenInclude(a => a.AppointmentType)
                .Include(p => p.Appointments).ThenInclude(a => a.AppointmentStatus)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (patient == null) return NotFound();

            var relevantAppointments = patient.Appointments
                .Where(a => a.AppointmentStatus.Name == "Confirmed" || a.AppointmentStatus.Name == "Pending")
                .OrderBy(a => a.AppointmentDate)
                .Select(a => new AppointmentSummaryDto
                {
                    Id = a.Id,
                    PatientId = patient.Id,
                    PatientName = patient.FullName,
                    DoctorId = a.DoctorId,
                    DoctorName = $"Dr. {a.Doctor.FirstName} {a.Doctor.LastName}",
                    DoctorSpecialty = a.Doctor.Specialty,
                    AppointmentTypeName = a.AppointmentType.Name,
                    StatusName = a.AppointmentStatus.Name,
                    AppointmentDate = a.AppointmentDate,
                    TimeSlot = a.TimeSlot,
                })
                .ToList();

            var dto = new PatientDetailDto
            {
                Id = patient.Id,
                FullName = patient.FullName,
                Gender = patient.Gender,
                Age = patient.Age,
                DateOfBirth = patient.DateOfBirth,
                Phone = patient.Phone,
                Email = patient.Email,
                Address = patient.Address,
                Department = patient.Department,
                Ward = patient.Ward,
                Status = patient.Status,
                CreatedAt = patient.CreatedAt,
                ConfirmedAppointmentsCount = relevantAppointments.Count(a => a.StatusName == "Confirmed"),
                PendingAppointmentsCount = relevantAppointments.Count(a => a.StatusName == "Pending"),
                Appointments = relevantAppointments,
            };

            return Ok(dto);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Patient patient)
        {
            dbContext.Patients.Add(patient);
            await dbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = patient.Id }, patient);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Patient patient)
        {
            if (id != patient.Id) return BadRequest();
            dbContext.Entry(patient).State = EntityState.Modified;
            await dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var patient = await dbContext.Patients.FindAsync(id);
            if (patient == null) return NotFound();
            dbContext.Patients.Remove(patient);
            await dbContext.SaveChangesAsync();
            return NoContent();
        }
    }
}
