using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HMSAPI.Migrations
{
    /// <inheritdoc />
    public partial class AdmissionStatusAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdmissionStatus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdmissionStatus", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "AdmissionStatus",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Admitted" },
                    { 2, "Outpatient" },
                    { 3, "Critical" },
                    { 4, "Discharged" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdmissionStatus");
        }
    }
}
