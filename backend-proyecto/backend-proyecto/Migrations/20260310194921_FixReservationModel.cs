using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_proyecto.Migrations
{
    /// <inheritdoc />
    public partial class FixReservationModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_User_StudentUserId",
                table: "Reservations");

            migrationBuilder.RenameColumn(
                name: "StudentUserId",
                table: "Reservations",
                newName: "StudentId");

            migrationBuilder.RenameIndex(
                name: "IX_Reservations_StudentUserId",
                table: "Reservations",
                newName: "IX_Reservations_StudentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Students_StudentId",
                table: "Reservations",
                column: "StudentId",
                principalTable: "Students",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Students_StudentId",
                table: "Reservations");

            migrationBuilder.RenameColumn(
                name: "StudentId",
                table: "Reservations",
                newName: "StudentUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Reservations_StudentId",
                table: "Reservations",
                newName: "IX_Reservations_StudentUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_User_StudentUserId",
                table: "Reservations",
                column: "StudentUserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
