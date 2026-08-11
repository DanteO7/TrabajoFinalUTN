using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_proyecto.Migrations
{
    /// <inheritdoc />
    public partial class AddActivityNameToClass : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Classes_Activities_ActivityId",
                table: "Classes");

            migrationBuilder.AlterColumn<int>(
                name: "ActivityId",
                table: "Classes",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "ActivityName",
                table: "Classes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_Activities_ActivityId",
                table: "Classes",
                column: "ActivityId",
                principalTable: "Activities",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Classes_Activities_ActivityId",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "ActivityName",
                table: "Classes");

            migrationBuilder.AlterColumn<int>(
                name: "ActivityId",
                table: "Classes",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_Activities_ActivityId",
                table: "Classes",
                column: "ActivityId",
                principalTable: "Activities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
