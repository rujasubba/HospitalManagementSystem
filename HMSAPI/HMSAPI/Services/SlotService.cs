using HMSAPI.Data;
using HMSAPI.DTOs;
using Microsoft.EntityFrameworkCore;

namespace HMSAPI.Services
{
    // Single source of truth for working hours and slot availability,
    // used by both the staff AppointmentController and the patient PortalController.
    public class SlotService(AppDbContext context)
    {
        // Clinic working hours - same for every doctor. Change these to adjust slots everywhere.
        private static readonly TimeSpan WorkDayStart = TimeSpan.FromHours(9);
        private static readonly TimeSpan WorkDayEnd = TimeSpan.FromHours(17);
        private static readonly TimeSpan SlotLength = TimeSpan.FromMinutes(30);

        // "09:00", "09:30", ... "16:30" (the last slot must finish by WorkDayEnd)
        public static List<string> AllSlots()
        {
            var slots = new List<string>();
            for (var t = WorkDayStart; t + SlotLength <= WorkDayEnd; t += SlotLength)
                slots.Add(t.ToString(@"hh\:mm"));
            return slots;
        }

        public static bool IsInPast(DateTime day, string slot, DateTime now)
        {
            var slotStart = day.Date + TimeSpan.Parse(slot);
            return slotStart <= now;
        }

        // Every slot for that doctor on that day, flagged available or not.
        // Unavailable = already booked (non-cancelled) or in the past.
        // excludeAppointmentId: when rescheduling, the appointment being moved doesn't block its own slot.
        public async Task<List<AppointmentSlotDto>> GetSlotsAsync(int doctorId, DateTime date, int? excludeAppointmentId = null)
        {
            var day = date.Date;
            var nextDay = day.AddDays(1);

            var booked = await context.Appointments
                .Where(a => a.DoctorId == doctorId
                         && a.AppointmentDate >= day
                         && a.AppointmentDate < nextDay
                         && a.AppointmentStatus.Name != "Cancelled"
                         && a.Id != excludeAppointmentId)
                .Select(a => a.TimeSlot)
                .ToListAsync();

            var now = DateTime.Now;
            return AllSlots()
                .Select(time => new AppointmentSlotDto
                {
                    Time = time,
                    Available = !booked.Contains(time) && !IsInPast(day, time, now),
                })
                .ToList();
        }

        public async Task<bool> IsTakenAsync(int doctorId, DateTime date, string timeSlot, int? excludeAppointmentId = null)
        {
            var day = date.Date;
            var nextDay = day.AddDays(1);

            return await context.Appointments.AnyAsync(a =>
                a.DoctorId == doctorId
                && a.AppointmentDate >= day
                && a.AppointmentDate < nextDay
                && a.TimeSlot == timeSlot
                && a.AppointmentStatus.Name != "Cancelled"
                && a.Id != excludeAppointmentId);
        }
    }
}
