using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HMSAPI.Migrations
{
    /// <inheritdoc />
    public partial class AppointmnetTypeAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppointmentType",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentType", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "AppointmentType",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "General CheckUp" },
                    { 2, "Follow-Up" },
                    { 3, "X-Ray" },
                    { 4, "Blood Work" },
                    { 5, "Skin Consultation" },
                    { 6, "Lung Function" },
                    { 7, "Chemo Review" },
                    { 8, "Urology Checkup" },
                    { 9, "Diabetes Review" },
                    { 10, "GI Consultation" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppointmentType");
        }
    }
}
