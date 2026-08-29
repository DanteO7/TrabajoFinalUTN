using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend_proyecto.Migrations
{
    /// <inheritdoc />
    public partial class UpdateInvitationPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoutineExercise_Exercises_ExerciseId",
                table: "RoutineExercise");

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.AlterColumn<int>(
                name: "ExerciseId",
                table: "RoutineExercise",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "ExerciseName",
                table: "RoutineExercise",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 55, "INVITATION_READ" },
                    { 56, "INVITATION_CREATE" },
                    { 57, "INVITATION_DELETE" }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_RoutineExercise_Exercises_ExerciseId",
                table: "RoutineExercise",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoutineExercise_Exercises_ExerciseId",
                table: "RoutineExercise");

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 55);

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 56);

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 57);

            migrationBuilder.DropColumn(
                name: "ExerciseName",
                table: "RoutineExercise");

            migrationBuilder.AlterColumn<int>(
                name: "ExerciseId",
                table: "RoutineExercise",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 7, "STUDENT_INVITE" },
                    { 14, "PROFESSOR_INVITE" }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_RoutineExercise_Exercises_ExerciseId",
                table: "RoutineExercise",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
