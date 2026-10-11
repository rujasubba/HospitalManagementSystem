using System.Security.Claims;
using HMSAPI.Data;
using HMSAPI.DTOs;
using HMSAPI.Models;
using HMSAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HMSAPI.Controllers
{
    // Everything a logged-in PATIENT is allowed to do. Staff use the other controllers.
    // Each action works out "who am I" from the login, never from anything the client sends.
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.Patient)]
    public class PortalController(AppDbContext context, SlotService slots) : ControllerBase
    {
        private const int MaxDaysAhead = 90;
        private const int MaxUpcomingAppointments = 5;

        // Which Patients row belongs to the logged-in account (read from the database, not the token,
        // so it can't go stale if the record changes).
        private async Task<int?> GetMyPatientIdAsync()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return null;

            var patientId = await context.Users
                .Where(u => u.Id == userId)
                .Select(u => u.PatientId)
                .FirstOrDefaultAsync();

            if (patientId == null) return null;
            return await context.Patients.AnyAsync(p => p.Id == patientId) ? patientId : null;
        }

        private static AppointmentSummaryDto ToSummary(Appointment a) => new()
        {
            Id = a.Id,
            PatientId = a.PatientId,
            PatientName = a.Patient.FullName,
            DoctorId = a.DoctorId,
            DoctorName = $"Dr. {a.Doctor.FirstName} {a.Doctor.LastName}",
            DoctorSpecialty = a.Doctor.Specialty,
            AppointmentTypeName = a.AppointmentType.Name,
            StatusName = a.AppointmentStatus.Name,
            AppointmentDate = a.AppointmentDate,
            TimeSlot = a.TimeSlot,
        };

        private IQueryable<Appointment> AppointmentsWithDetails() => context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Include(a => a.AppointmentType)
            .Include(a => a.AppointmentStatus);

        // GET api/portal/doctors
        [HttpGet("doctors")]
        public async Task<IActionResult> GetDoctors()
        {
            var doctors = await context.Doctors
                .Where(d => d.Status != "On Leave")
                .OrderBy(d => d.FirstName).ThenBy(d => d.LastName)
                .ToListAsync();

            return Ok(doctors.Select(d => new DoctorOptionDto
            {
                Id = d.Id,
                Name = $"Dr. {d.FirstName} {d.LastName}",
                Specialty = d.Specialty,
            }));
        }

        // GET api/portal/appointment-types
        [HttpGet("appointment-types")]
        public async Task<IActionResult> GetAppointmentTypes()
        {
            var types = await context.AppointmentType.OrderBy(t => t.Name).ToListAsync();
            return Ok(types.Select(t => new AppointmentTypeOptionDto { Id = t.Id, Name = t.Name }));
        }

        // GET api/portal/slots?doctorId=1&date=2026-10-12
        [HttpGet("slots")]
        public async Task<IActionResult> GetSlots([FromQuery] int doctorId, [FromQuery] DateTime date)
        {
            var doctor = await context.Doctors.FindAsync(doctorId);
            if (doctor == null || doctor.Status == "On Leave")
                return NotFound("This doctor is not available.");

            return Ok(await slots.GetSlotsAsync(doctorId, date));
        }

        // GET api/portal/appointments  - only MY appointments
        [HttpGet("appointments")]
        public async Task<IActionResult> GetMyAppointments()
        {
            var patientId = await GetMyPatientIdAsync();
            if (patientId == null) return StatusCode(403, "Your account isn't linked to a patient record.");

            var appointments = await AppointmentsWithDetails()
                .Where(a => a.PatientId == patientId)
                .OrderByDescending(a => a.AppointmentDate)
                .ThenByDescending(a => a.TimeSlot)
                .ToListAsync();

            return Ok(appointments.Select(ToSummary));
        }

        // POST api/portal/appointments  - book for myself, status starts as Pending
        [HttpPost("appointments")]
        public async Task<IActionResult> Book(PortalBookingDto dto)
        {
            var patientId = await GetMyPatientIdAsync();
            if (patientId == null) return StatusCode(403, "Your account isn't linked to a patient record.");

            var doctor = await context.Doctors.FindAsync(dto.DoctorId);
            if (doctor == null || doctor.Status == "On Leave")
                return BadRequest("Selected doctor is not available.");

            var typeExists = await context.AppointmentType.AnyAsync(t => t.Id == dto.AppointmentTypeId);
            if (!typeExists) return BadRequest("Selected appointment type does not exist.");

            var day = dto.AppointmentDate.Date;
            var today = DateTime.Today;

            if (!SlotService.AllSlots().Contains(dto.TimeSlot))
                return BadRequest("Selected time is not a valid appointment slot.");
            if (SlotService.IsInPast(day, dto.TimeSlot, DateTime.Now))
                return BadRequest("Selected slot is in the past.");
            if (day > today.AddDays(MaxDaysAhead))
                return BadRequest($"You can book up to {MaxDaysAhead} days ahead.");

            // The slot may have been taken since the patient loaded the list
            if (await slots.IsTakenAsync(dto.DoctorId, day, dto.TimeSlot))
                return BadRequest("That time slot has just been booked. Please pick another.");

            var nextDay = day.AddDays(1);

            // Can't be in two places at once
            var clash = await context.Appointments.AnyAsync(a =>
                a.PatientId == patientId
                && a.AppointmentDate >= day
                && a.AppointmentDate < nextDay
                && a.TimeSlot == dto.TimeSlot
                && a.AppointmentStatus.Name != "Cancelled");
            if (clash) return BadRequest("You already have an appointment at that time.");

            // Stops one account from hoarding slots
            var upcoming = await context.Appointments.CountAsync(a =>
                a.PatientId == patientId
                && a.AppointmentDate >= today
                && a.AppointmentStatus.Name != "Cancelled"
                && a.AppointmentStatus.Name != "Completed");
            if (upcoming >= MaxUpcomingAppointments)
                return BadRequest($"You can have up to {MaxUpcomingAppointments} upcoming appointments. Cancel one to book another.");

            var pending = await context.AppointmentStatus.FirstOrDefaultAsync(s => s.Name == "Pending");
            if (pending == null) return StatusCode(500, "Appointment statuses are not set up.");

            var appointment = new Appointment
            {
                PatientId = patientId.Value,
                DoctorId = dto.DoctorId,
                AppointmentTypeId = dto.AppointmentTypeId,
                AppointmentDate = day,
                TimeSlot = dto.TimeSlot,
                AppointmentStatusId = pending.Id,
                CreatedAt = DateTime.UtcNow,
            };

            context.Appointments.Add(appointment);
            await context.SaveChangesAsync();

            var created = await AppointmentsWithDetails().FirstAsync(a => a.Id == appointment.Id);
            return Ok(ToSummary(created));
        }

        // GET api/portal/appointments/5/slots?date=2026-10-12
        // Slots for rescheduling MY appointment: its own current slot shows as free.
        [HttpGet("appointments/{id}/slots")]
        public async Task<IActionResult> GetSlotsForReschedule(int id, [FromQuery] DateTime date)
        {
            var patientId = await GetMyPatientIdAsync();
            if (patientId == null) return StatusCode(403, "Your account isn't linked to a patient record.");

            var appointment = await context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.PatientId == patientId);
            if (appointment == null) return NotFound();

            return Ok(await slots.GetSlotsAsync(appointment.DoctorId, date, excludeAppointmentId: id));
        }

        // PUT api/portal/appointments/5/reschedule  - same doctor, new date/time, status back to Pending
        [HttpPut("appointments/{id}/reschedule")]
        public async Task<IActionResult> Reschedule(int id, RescheduleAppointmentDto dto)
        {
            var patientId = await GetMyPatientIdAsync();
            if (patientId == null) return StatusCode(403, "Your account isn't linked to a patient record.");

            var appointment = await AppointmentsWithDetails()
                .FirstOrDefaultAsync(a => a.Id == id && a.PatientId == patientId);
            if (appointment == null) return NotFound();

            var statusName = appointment.AppointmentStatus.Name;
            if (statusName == "Cancelled") return BadRequest("Cancelled appointments can't be rescheduled. Please book a new one.");
            if (statusName == "Completed") return BadRequest("Completed appointments can't be rescheduled.");
            if (SlotService.IsInPast(appointment.AppointmentDate, appointment.TimeSlot, DateTime.Now))
                return BadRequest("Past appointments can't be rescheduled.");

            if (appointment.Doctor.Status == "On Leave")
                return BadRequest("This doctor is not available right now. Please cancel and book another doctor.");

            var day = dto.AppointmentDate.Date;
            if (!SlotService.AllSlots().Contains(dto.TimeSlot))
                return BadRequest("Selected time is not a valid appointment slot.");
            if (SlotService.IsInPast(day, dto.TimeSlot, DateTime.Now))
                return BadRequest("Selected slot is in the past.");
            if (day > DateTime.Today.AddDays(MaxDaysAhead))
                return BadRequest($"You can book up to {MaxDaysAhead} days ahead.");

            if (await slots.IsTakenAsync(appointment.DoctorId, day, dto.TimeSlot, excludeAppointmentId: id))
                return BadRequest("That time slot has just been booked. Please pick another.");

            var nextDay = day.AddDays(1);
            var clash = await context.Appointments.AnyAsync(a =>
                a.PatientId == patientId
                && a.Id != id
                && a.AppointmentDate >= day
                && a.AppointmentDate < nextDay
                && a.TimeSlot == dto.TimeSlot
                && a.AppointmentStatus.Name != "Cancelled");
            if (clash) return BadRequest("You already have an appointment at that time.");

            var pending = await context.AppointmentStatus.FirstOrDefaultAsync(s => s.Name == "Pending");
            if (pending == null) return StatusCode(500, "Appointment statuses are not set up.");

            appointment.AppointmentDate = day;
            appointment.TimeSlot = dto.TimeSlot;
            appointment.AppointmentStatusId = pending.Id;
            appointment.AppointmentStatus = pending;
            await context.SaveChangesAsync();

            return Ok(ToSummary(appointment));
        }

        // PUT api/portal/appointments/5/cancel  - only if it's MINE
        [HttpPut("appointments/{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            var patientId = await GetMyPatientIdAsync();
            if (patientId == null) return StatusCode(403, "Your account isn't linked to a patient record.");

            // Someone else's appointment gets the same 404 as one that doesn't exist
            var appointment = await AppointmentsWithDetails()
                .FirstOrDefaultAsync(a => a.Id == id && a.PatientId == patientId);
            if (appointment == null) return NotFound();

            var statusName = appointment.AppointmentStatus.Name;
            if (statusName == "Cancelled") return BadRequest("This appointment is already cancelled.");
            if (statusName == "Completed") return BadRequest("Completed appointments can't be cancelled.");
            if (SlotService.IsInPast(appointment.AppointmentDate, appointment.TimeSlot, DateTime.Now))
                return BadRequest("Past appointments can't be cancelled.");

            var cancelled = await context.AppointmentStatus.FirstOrDefaultAsync(s => s.Name == "Cancelled");
            if (cancelled == null) return StatusCode(500, "Appointment statuses are not set up.");

            appointment.AppointmentStatusId = cancelled.Id;
            appointment.AppointmentStatus = cancelled;
            await context.SaveChangesAsync();

            return Ok(ToSummary(appointment));
        }
    }
}

