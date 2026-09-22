using HMSAPI.Models;
using Microsoft.EntityFrameworkCore;


namespace HMSAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Patient> Patients { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<AppointmentStatus> AppointmentStatus { get; set; }
        public DbSet<AppointmentType>AppointmentType { get; set; }
        public DbSet<AdmissionStatus> AdmissionStatus { get; set; }
        public DbSet<Bill> Bills { get; set; }
        public DbSet<BillItem> BillItems { get; set; }
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<LabResult> LabResults { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AppointmentStatus>().HasData(
        new AppointmentStatus { Id = 1, Name = "Confirmed" },
        new AppointmentStatus { Id = 2, Name = "Completed" },
        new AppointmentStatus { Id = 3, Name = "Pending" },
        new AppointmentStatus { Id = 4, Name = "Cancelled" }

         );

            modelBuilder.Entity<AdmissionStatus>().HasData(
           new AdmissionStatus { Id = 1, Name = "Admitted" },
           new AdmissionStatus { Id = 2, Name = "Outpatient" },
           new AdmissionStatus { Id = 3, Name = "Critical" },
           new AdmissionStatus { Id = 4, Name = "Discharged" }

            );

            modelBuilder.Entity<AppointmentType>().HasData(
          new AppointmentType { Id = 1, Name = "General CheckUp" },
          new AppointmentType { Id = 2, Name = "Follow-Up" },
          new AppointmentType { Id = 3, Name = "X-Ray" },
          new AppointmentType { Id = 4, Name = "Blood Work" },
           new AppointmentType { Id = 5, Name = "Skin Consultation" },
          new AppointmentType { Id = 6, Name = "Lung Function" },
          new AppointmentType { Id = 7, Name = "Chemo Review" },
          new AppointmentType { Id = 8, Name = "Urology Checkup" },
           new AppointmentType { Id = 9, Name = "Diabetes Review" },
          new AppointmentType { Id = 10, Name = "GI Consultation" }
          

           );
            base.OnModelCreating(modelBuilder);
        }

        }
}
