using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HMSAPI.Migrations
{
    /// <inheritdoc />
    public partial class DoctorModelupdated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FullName",
                table: "Doctors",
                newName: "LastName");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Doctors",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Doctors");

            migrationBuilder.RenameColumn(
                name: "LastName",
                table: "Doctors",
                newName: "FullName");
        }
    }
}
