using HMSAPI.Data;
using HMSAPI.DTOs;
using HMSAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HMSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicalRecordController(AppDbContext context) : ControllerBase
    {
        private static MedicalRecordDetailDto ToDto(MedicalRecord r) => new()
        {
            Id = r.Id,
            PatientId = r.PatientId,
            PatientName = r.Patient.FullName,
            DoctorId = r.DoctorId,
            DoctorName = $"Dr. {r.Doctor.FirstName} {r.Doctor.LastName}",
            DoctorSpecialty = r.Doctor.Specialty,
            Diagnosis = r.Diagnosis,
            Prescription = r.Prescription,
            Notes = r.Notes,
            RecordDate = r.RecordDate,
            CreatedAt = r.CreatedAt,
        };

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var records = await context.MedicalRecords
                .Include(r => r.Patient)
                .Include(r => r.Doctor)
                .OrderByDescending(r => r.RecordDate)
                .ToListAsync();

            return Ok(records.Select(ToDto));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var record = await context.MedicalRecords
                .Include(r => r.Patient)
                .Include(r => r.Doctor)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (record == null) return NotFound();
            return Ok(ToDto(record));
        }


        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetByPatientId(int patientId)
        {
            var records = await context.MedicalRecords
                .Include(r => r.Patient)
                .Include(r => r.Doctor)
                .Where(r => r.PatientId == patientId)
                .OrderByDescending(r => r.RecordDate)
                .ToListAsync();

            return Ok(records.Select(ToDto));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateMedicalRecordDto dto)
        {
            var patientExists = await context.Patients.AnyAsync(p => p.Id == dto.PatientId);
            if (!patientExists) return BadRequest("Selected patient does not exist.");

            var doctorExists = await context.Doctors.AnyAsync(d => d.Id == dto.DoctorId);
            if (!doctorExists) return BadRequest("Selected doctor does not exist.");

            if (string.IsNullOrWhiteSpace(dto.Diagnosis))
                return BadRequest("Diagnosis is required.");

            var record = new MedicalRecord
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                Diagnosis = dto.Diagnosis,
                Prescription = dto.Prescription,
                Notes = dto.Notes,
                RecordDate = dto.RecordDate ?? DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
            };

            context.MedicalRecords.Add(record);
            await context.SaveChangesAsync();

            var created = await context.MedicalRecords
                .Include(r => r.Patient)
                .Include(r => r.Doctor)
                .FirstOrDefaultAsync(r => r.Id == record.Id);

            return CreatedAtAction(nameof(GetById), new { id = record.Id }, ToDto(created!));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateMedicalRecordDto dto)
        {
            var record = await context.MedicalRecords.FindAsync(id);
            if (record == null) return NotFound();

            if (string.IsNullOrWhiteSpace(dto.Diagnosis))
                return BadRequest("Diagnosis is required.");

            record.Diagnosis = dto.Diagnosis;
            record.Prescription = dto.Prescription;
            record.Notes = dto.Notes;
            record.RecordDate = dto.RecordDate;

            await context.SaveChangesAsync();

            var updated = await context.MedicalRecords
                .Include(r => r.Patient)
                .Include(r => r.Doctor)
                .FirstOrDefaultAsync(r => r.Id == id);

            return Ok(ToDto(updated!));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var record = await context.MedicalRecords.FindAsync(id);
            if (record == null) return NotFound();

            context.MedicalRecords.Remove(record);
            await context.SaveChangesAsync();
            return NoContent();
        }
    }
}
