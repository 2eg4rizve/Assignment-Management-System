using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AssignmentManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTeacherCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TeacherCode",
                table: "AspNetUsers",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_TeacherCode",
                table: "AspNetUsers",
                column: "TeacherCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_TeacherCode",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "TeacherCode",
                table: "AspNetUsers");
        }
    }
}
