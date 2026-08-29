using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_proyecto.Migrations
{
    /// <inheritdoc />
    public partial class RemoveExerciseName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoutineExercise_Exercises_ExerciseId",
                table: "RoutineExercise");

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

            migrationBuilder.AddForeignKey(
                name: "FK_RoutineExercise_Exercises_ExerciseId",
                table: "RoutineExercise",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoutineExercise_Exercises_ExerciseId",
                table: "RoutineExercise");

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

            migrationBuilder.AddForeignKey(
                name: "FK_RoutineExercise_Exercises_ExerciseId",
                table: "RoutineExercise",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
