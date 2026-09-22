using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HMSAPI.Data;
using HMSAPI.Models;

namespace HMSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentTypeController(AppDbContext context) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var types = await context.AppointmentType.ToListAsync();
            return Ok(types);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var type = await context.AppointmentType.FindAsync(id);
            if (type == null) return NotFound();
            return Ok(type);
        }

        [HttpPost]
        public async Task<IActionResult> Create(AppointmentType newType)
        {
            if (string.IsNullOrWhiteSpace(newType.Name))
                return BadRequest("Name is required.");

            context.AppointmentType.Add(newType);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = newType.Id }, newType);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, AppointmentType updatedType)
        {
            var existing = await context.AppointmentType.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Name = updatedType.Name;
            await context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await context.AppointmentType.FindAsync(id);
            if (existing == null) return NotFound();

            bool inUse = await context.Appointments.AnyAsync(a => a.AppointmentTypeId == id);
            if (inUse) return BadRequest("Cannot delete: this appointment type is in use by existing appointments.");

            context.AppointmentType.Remove(existing);
            await context.SaveChangesAsync();
            return NoContent();
        }
    }
}
