namespace HMSAPI.Models
{
    public static class Roles
    {
        public const string Admin = "Admin";
        public const string Doctor = "Doctor";
        public const string Receptionist = "Receptionist";
        public const string Default = Receptionist;

        public static readonly string[] All = { Admin, Doctor, Receptionist };
    }
}
