using HMSAPI.Data;
using HMSAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HMSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentStatusController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AppointmentStatusController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppointmentStatus>>> GetAll()
        {
            var statuses = await _context.AppointmentStatus
                .OrderBy(s => s.Id)
                .ToListAsync();

            return Ok(statuses);
        }
    }
}
