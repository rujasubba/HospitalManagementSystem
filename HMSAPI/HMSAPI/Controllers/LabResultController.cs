using HMSAPI.Data;
using HMSAPI.DTOs;
using HMSAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HMSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LabResultController(AppDbContext context) : ControllerBase
    {
        private static readonly string[] ValidStatuses = { "Normal", "Abnormal", "Critical" };

        private static LabResultDetailDto ToDto(LabResult r) => new()
        {
            Id = r.Id,
            PatientId = r.PatientId,
            PatientName = r.Patient.FullName,
            DoctorId = r.DoctorId,
            DoctorName = $"Dr. {r.Doctor.FirstName} {r.Doctor.LastName}",
            DoctorSpecialty = r.Doctor.Specialty,
            TestName = r.TestName,
            ResultValue = r.ResultValue,
            ReferenceRange = r.ReferenceRange,
            Status = r.Status,
            TestDate = r.TestDate,
            CreatedAt = r.CreatedAt,
        };

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var results = await context.LabResults
                .Include(r => r.Patient)
                .Include(r => r.Doctor)
                .OrderByDescending(r => r.TestDate)
                .ToListAsync();

            return Ok(results.Select(ToDto));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await context.LabResults
                .Include(r => r.Patient)
                .Include(r => r.Doctor)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (result == null) return NotFound();
            return Ok(ToDto(result));
        }

        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetByPatientId(int patientId)
        {
            var results = await context.LabResults
                .Include(r => r.Patient)
                .Include(r => r.Doctor)
                .Where(r => r.PatientId == patientId)
                .OrderByDescending(r => r.TestDate)
                .ToListAsync();

            return Ok(results.Select(ToDto));
        }

      
        [HttpPost]
        public async Task<IActionResult> Create(CreateLabResultDto dto)
        {
            var patientExists = await context.Patients.AnyAsync(p => p.Id == dto.PatientId);
            if (!patientExists) return BadRequest("Selected patient does not exist.");

            var doctorExists = await context.Doctors.AnyAsync(d => d.Id == dto.DoctorId);
            if (!doctorExists) return BadRequest("Selected doctor does not exist.");

            if (string.IsNullOrWhiteSpace(dto.TestName))
                return BadRequest("Test name is required.");

            if (!ValidStatuses.Contains(dto.Status))
                return BadRequest("Status must be Normal, Abnormal, or Critical.");

            var result = new LabResult
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                TestName = dto.TestName,
                ResultValue = dto.ResultValue,
                ReferenceRange = dto.ReferenceRange,
                Status = dto.Status,
                TestDate = dto.TestDate ?? DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
            };

            context.LabResults.Add(result);
            await context.SaveChangesAsync();

            var created = await context.LabResults
                .Include(r => r.Patient)
                .Include(r => r.Doctor)
                .FirstOrDefaultAsync(r => r.Id == result.Id);

            return CreatedAtAction(nameof(GetById), new { id = result.Id }, ToDto(created!));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateLabResultDto dto)
        {
            var result = await context.LabResults.FindAsync(id);
            if (result == null) return NotFound();

            if (string.IsNullOrWhiteSpace(dto.TestName))
                return BadRequest("Test name is required.");

            if (!ValidStatuses.Contains(dto.Status))
                return BadRequest("Status must be Normal, Abnormal, or Critical.");

            result.TestName = dto.TestName;
            result.ResultValue = dto.ResultValue;
            result.ReferenceRange = dto.ReferenceRange;
            result.Status = dto.Status;
            result.TestDate = dto.TestDate;

            await context.SaveChangesAsync();

            var updated = await context.LabResults
                .Include(r => r.Patient)
                .Include(r => r.Doctor)
                .FirstOrDefaultAsync(r => r.Id == id);

            return Ok(ToDto(updated!));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await context.LabResults.FindAsync(id);
            if (result == null) return NotFound();

            context.LabResults.Remove(result);
            await context.SaveChangesAsync();
            return NoContent();
        }
    }
}
