using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_proyecto.Migrations
{
    /// <inheritdoc />
    public partial class FixDatesInClassModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Classes_User_ProfessorUserId",
                table: "Classes");

            migrationBuilder.RenameColumn(
                name: "ProfessorUserId",
                table: "Classes",
                newName: "ProfessorId");

            migrationBuilder.RenameIndex(
                name: "IX_Classes_ProfessorUserId",
                table: "Classes",
                newName: "IX_Classes_ProfessorId");

            migrationBuilder.AlterColumn<TimeOnly>(
                name: "StartTime",
                table: "Classes",
                type: "time",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<TimeOnly>(
                name: "EndTime",
                table: "Classes",
                type: "time",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<DateTime>(
                name: "Date",
                table: "Classes",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_Professors_ProfessorId",
                table: "Classes",
                column: "ProfessorId",
                principalTable: "Professors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Classes_Professors_ProfessorId",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "Classes");

            migrationBuilder.RenameColumn(
                name: "ProfessorId",
                table: "Classes",
                newName: "ProfessorUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Classes_ProfessorId",
                table: "Classes",
                newName: "IX_Classes_ProfessorUserId");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartTime",
                table: "Classes",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(TimeOnly),
                oldType: "time");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndTime",
                table: "Classes",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(TimeOnly),
                oldType: "time");

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_User_ProfessorUserId",
                table: "Classes",
                column: "ProfessorUserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
