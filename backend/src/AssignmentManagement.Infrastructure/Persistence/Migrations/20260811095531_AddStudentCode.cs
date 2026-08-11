using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AssignmentManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StudentCode",
                table: "AspNetUsers",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_StudentCode",
                table: "AspNetUsers",
                column: "StudentCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_StudentCode",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "StudentCode",
                table: "AspNetUsers");
        }
    }
}
