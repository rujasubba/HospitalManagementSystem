using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HMSAPI.Migrations
{
    /// <inheritdoc />
    public partial class AppStatusAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppointmentStatus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentStatus", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "AppointmentStatus",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Confirmed" },
                    { 2, "Completed" },
                    { 3, "Pending" },
                    { 4, "Cancelled" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppointmentStatus");
        }
    }
}
