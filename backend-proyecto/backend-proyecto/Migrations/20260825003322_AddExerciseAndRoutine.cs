using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend_proyecto.Migrations
{
    /// <inheritdoc />
    public partial class AddExerciseAndRoutine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // =====================================================
            // EXERCISES
            // =====================================================

            migrationBuilder.CreateTable(
                name: "Exercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),

                    TenantId = table.Column<int>(type: "integer", nullable: false),

                    Name = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false),

                    Description = table.Column<string>(
                        type: "character varying(300)",
                        maxLength: 300,
                        nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Exercises", x => x.Id);

                    table.ForeignKey(
                        name: "FK_Exercises_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });


            // =====================================================
            // ROUTINES
            // =====================================================

            migrationBuilder.CreateTable(
                name: "Routines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),

                    TenantId = table.Column<int>(type: "integer", nullable: false),

                    Name = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false),

                    Description = table.Column<string>(
                        type: "character varying(300)",
                        maxLength: 300,
                        nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Routines", x => x.Id);

                    table.ForeignKey(
                        name: "FK_Routines_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });


            // =====================================================
            // ROUTINE EXERCISE
            // =====================================================

            migrationBuilder.CreateTable(
                name: "RoutineExercise",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),

                    RoutineId = table.Column<int>(
                        type: "integer",
                        nullable: false),

                    ExerciseId = table.Column<int>(
                        type: "integer",
                        nullable: false),

                    Sets = table.Column<int>(
                        type: "integer",
                        nullable: false),

                    Repetitions = table.Column<int>(
                        type: "integer",
                        nullable: false),

                    Weight = table.Column<decimal>(
                        type: "numeric(10,2)",
                        precision: 10,
                        scale: 2,
                        nullable: true),

                    Order = table.Column<int>(
                        type: "integer",
                        nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoutineExercise", x => x.Id);

                    table.ForeignKey(
                        name: "FK_RoutineExercise_Exercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);

                    table.ForeignKey(
                        name: "FK_RoutineExercise_Routines_RoutineId",
                        column: x => x.RoutineId,
                        principalTable: "Routines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });


            // =====================================================
            // PERMISSIONS
            // =====================================================
            // Primero eliminamos las relaciones que apuntan a
            // Permissions.

            migrationBuilder.Sql("""
        DELETE FROM "ProfessorPermissions";
    """);

            migrationBuilder.Sql("""
        DELETE FROM "GroupPermissions";
    """);


            // =====================================================
            // PERMISSIONS
            // =====================================================
            // Eliminamos todos los permisos existentes para poder
            // recrearlos con los IDs correctos.

            migrationBuilder.Sql("""
        DELETE FROM "Permissions";
    """);


            // =====================================================
            // NUEVOS PERMISOS
            // =====================================================

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
            // TENANT
            { 1, "TENANT_READ" },
            { 2, "TENANT_UPDATE" },

            // STUDENTS
            { 3, "STUDENT_READ" },
            { 4, "STUDENT_CREATE" },
            { 5, "STUDENT_UPDATE" },
            { 6, "STUDENT_DELETE" },
            { 7, "STUDENT_INVITE" },

            // PROFESSORS
            { 8, "PROFESSOR_READ" },
            { 9, "PROFESSOR_CREATE" },
            { 10, "PROFESSOR_UPDATE" },
            { 11, "PROFESSOR_DELETE" },
            { 12, "PROFESSOR_ASSIGN_SPECIALITY" },
            { 13, "PROFESSOR_REMOVE_SPECIALITY" },
            { 14, "PROFESSOR_INVITE" },

            // ACTIVITIES
            { 15, "ACTIVITY_READ" },
            { 16, "ACTIVITY_CREATE" },
            { 17, "ACTIVITY_UPDATE" },
            { 18, "ACTIVITY_DELETE" },

            // SPECIALITIES
            { 19, "SPECIALITY_READ" },
            { 20, "SPECIALITY_CREATE" },
            { 21, "SPECIALITY_UPDATE" },
            { 22, "SPECIALITY_DELETE" },

            // CLASSES
            { 23, "CLASS_READ" },
            { 24, "CLASS_CREATE" },
            { 25, "CLASS_UPDATE" },
            { 26, "CLASS_DELETE" },

            // RESERVATIONS
            { 27, "RESERVATION_READ" },
            { 28, "RESERVATION_CREATE" },
            { 29, "RESERVATION_DELETE" },
            { 30, "RESERVATION_CHANGE_STATUS" },

            // PAYMENTS
            { 31, "PAYMENT_READ" },
            { 32, "PAYMENT_CREATE" },
            { 33, "PAYMENT_UPDATE" },
            { 34, "PAYMENT_DELETE" },

            // STUDENT PLANS
            { 35, "STUDENT_PLAN_READ" },
            { 36, "STUDENT_PLAN_CREATE" },
            { 37, "STUDENT_PLAN_UPDATE" },
            { 38, "STUDENT_PLAN_DELETE" },

            // NEWS
            { 39, "NEWS_READ" },
            { 40, "NEWS_CREATE" },
            { 41, "NEWS_UPDATE" },
            { 42, "NEWS_DELETE" },

            // WAITLIST
            { 43, "WAITLIST_READ" },
            { 44, "WAITLIST_CREATE" },
            { 45, "WAITLIST_DELETE" },

            // GROUPS
            { 46, "GROUP_READ" },

            // EXERCISE
            { 47, "EXERCISE_READ" },
            { 48, "EXERCISE_CREATE" },
            { 49, "EXERCISE_UPDATE" },
            { 50, "EXERCISE_DELETE" },

            // ROUTINE
            { 51, "ROUTINE_READ" },
            { 52, "ROUTINE_CREATE" },
            { 53, "ROUTINE_UPDATE" },
            { 54, "ROUTINE_DELETE" }
                });


            // =====================================================
            // INDEXES
            // =====================================================

            migrationBuilder.CreateIndex(
                name: "IX_Exercises_TenantId_Name",
                table: "Exercises",
                columns: new[] { "TenantId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoutineExercise_ExerciseId",
                table: "RoutineExercise",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_RoutineExercise_RoutineId_Order",
                table: "RoutineExercise",
                columns: new[] { "RoutineId", "Order" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Routines_TenantId_Name",
                table: "Routines",
                columns: new[] { "TenantId", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // =====================================================
            // REMOVE ROUTINES / EXERCISES
            // =====================================================

            migrationBuilder.DropTable(
                name: "RoutineExercise");

            migrationBuilder.DropTable(
                name: "Exercises");

            migrationBuilder.DropTable(
                name: "Routines");


            // =====================================================
            // PERMISSION RELATIONS
            // =====================================================

            migrationBuilder.Sql("""
        DELETE FROM "ProfessorPermissions";
    """);

            migrationBuilder.Sql("""
        DELETE FROM "GroupPermissions";
    """);


            // =====================================================
            // PERMISSIONS
            // =====================================================

            migrationBuilder.Sql("""
        DELETE FROM "Permissions";
    """);


            // =====================================================
            // RESTORE OLD PERMISSIONS
            // =====================================================

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
            // TENANT
            { 1, "TENANT_READ" },
            { 2, "TENANT_UPDATE" },

            // STUDENTS
            { 3, "STUDENT_READ" },
            { 4, "STUDENT_CREATE" },
            { 5, "STUDENT_UPDATE" },
            { 6, "STUDENT_DELETE" },

            // PROFESSORS
            { 7, "PROFESSOR_READ" },
            { 8, "PROFESSOR_CREATE" },
            { 9, "PROFESSOR_UPDATE" },
            { 10, "PROFESSOR_DELETE" },
            { 11, "PROFESSOR_ASSIGN_SPECIALITY" },
            { 12, "PROFESSOR_REMOVE_SPECIALITY" },

            // ACTIVITIES
            { 13, "ACTIVITY_READ" },
            { 14, "ACTIVITY_CREATE" },
            { 15, "ACTIVITY_UPDATE" },
            { 16, "ACTIVITY_DELETE" },

            // SPECIALITIES
            { 17, "SPECIALITY_READ" },
            { 18, "SPECIALITY_CREATE" },
            { 19, "SPECIALITY_UPDATE" },
            { 20, "SPECIALITY_DELETE" },

            // CLASSES
            { 21, "CLASS_READ" },
            { 22, "CLASS_CREATE" },
            { 23, "CLASS_UPDATE" },
            { 24, "CLASS_DELETE" },

            // RESERVATIONS
            { 25, "RESERVATION_READ" },
            { 26, "RESERVATION_CREATE" },
            { 27, "RESERVATION_DELETE" },
            { 28, "RESERVATION_CHANGE_STATUS" },

            // PAYMENTS
            { 29, "PAYMENT_READ" },
            { 30, "PAYMENT_CREATE" },
            { 31, "PAYMENT_UPDATE" },
            { 32, "PAYMENT_DELETE" },

            // STUDENT PLANS
            { 33, "STUDENT_PLAN_READ" },
            { 34, "STUDENT_PLAN_CREATE" },
            { 35, "STUDENT_PLAN_UPDATE" },
            { 36, "STUDENT_PLAN_DELETE" },

            // NEWS
            { 37, "NEWS_READ" },
            { 38, "NEWS_CREATE" },
            { 39, "NEWS_UPDATE" },
            { 40, "NEWS_DELETE" },

            // WAITLIST
            { 41, "WAITLIST_READ" },
            { 42, "WAITLIST_CREATE" },
            { 43, "WAITLIST_DELETE" },

            // GROUPS
            { 44, "GROUP_READ" }
                });
        }
    }
}
