using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_proyecto.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePermissionsAndAddProfessorPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // =====================================================
            // GROUP PERMISSIONS
            // =====================================================
            // Actualmente la tabla está vacía, pero eliminamos
            // cualquier relación antes de eliminar Permissions.

            migrationBuilder.Sql("""
                DELETE FROM "GroupPermissions";
            """);


            // =====================================================
            // PERMISSIONS
            // =====================================================
            // Eliminamos todos los permisos anteriores.

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
                    { 46, "GROUP_READ" }
                });


            // =====================================================
            // PROFESSOR PERMISSIONS
            // =====================================================

            migrationBuilder.CreateTable(
                name: "ProfessorPermissions",
                columns: table => new
                {
                    ProfessorId = table.Column<int>(
                        type: "integer",
                        nullable: false),

                    PermissionId = table.Column<int>(
                        type: "integer",
                        nullable: false),

                    IsAllowed = table.Column<bool>(
                        type: "boolean",
                        nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "PK_ProfessorPermissions",
                        x => new
                        {
                            x.ProfessorId,
                            x.PermissionId
                        });

                    table.ForeignKey(
                        name: "FK_ProfessorPermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);

                    table.ForeignKey(
                        name: "FK_ProfessorPermissions_Professors_ProfessorId",
                        column: x => x.ProfessorId,
                        principalTable: "Professors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });


            migrationBuilder.CreateIndex(
                name: "IX_ProfessorPermissions_PermissionId",
                table: "ProfessorPermissions",
                column: "PermissionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Eliminar permisos individuales de profesores
            migrationBuilder.Sql("""
                DELETE FROM "ProfessorPermissions";
            """);

            migrationBuilder.DropTable(
                name: "ProfessorPermissions");


            // Eliminar relaciones con grupos
            migrationBuilder.Sql("""
                DELETE FROM "GroupPermissions";
            """);


            // Eliminar permisos nuevos
            migrationBuilder.Sql("""
                DELETE FROM "Permissions";
            """);


            // Restaurar permisos anteriores

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    // TENANT
                    { 1, "TENANT_READ" },
                    { 2, "TENANT_UPDATE" },

                    // USERS
                    { 3, "USER_READ" },
                    { 4, "USER_CREATE" },
                    { 5, "USER_UPDATE" },
                    { 6, "USER_DELETE" },

                    // STUDENTS
                    { 7, "STUDENT_READ" },
                    { 8, "STUDENT_CREATE" },
                    { 9, "STUDENT_UPDATE" },
                    { 10, "STUDENT_DELETE" },

                    // PROFESSORS
                    { 11, "PROFESSOR_READ" },
                    { 12, "PROFESSOR_CREATE" },
                    { 13, "PROFESSOR_UPDATE" },
                    { 14, "PROFESSOR_DELETE" },
                    { 15, "PROFESSOR_ASSIGN_SPECIALITY" },
                    { 16, "PROFESSOR_REMOVE_SPECIALITY" },

                    // ACTIVITIES
                    { 17, "ACTIVITY_READ" },
                    { 18, "ACTIVITY_CREATE" },
                    { 19, "ACTIVITY_UPDATE" },
                    { 20, "ACTIVITY_DELETE" },

                    // SPECIALITIES
                    { 21, "SPECIALITY_READ" },
                    { 22, "SPECIALITY_CREATE" },
                    { 23, "SPECIALITY_UPDATE" },
                    { 24, "SPECIALITY_DELETE" },

                    // CLASSES
                    { 25, "CLASS_READ" },
                    { 26, "CLASS_CREATE" },
                    { 27, "CLASS_UPDATE" },
                    { 28, "CLASS_DELETE" },

                    // RESERVATIONS
                    { 29, "RESERVATION_READ" },
                    { 30, "RESERVATION_CREATE" },
                    { 31, "RESERVATION_DELETE" },
                    { 32, "RESERVATION_CHANGE_STATUS" },

                    // PAYMENTS
                    { 33, "PAYMENT_READ" },
                    { 34, "PAYMENT_CREATE" },
                    { 35, "PAYMENT_UPDATE" },
                    { 36, "PAYMENT_DELETE" },

                    // STUDENT PLAN
                    { 37, "STUDENT_PLAN_READ" },
                    { 38, "STUDENT_PLAN_CREATE" },
                    { 39, "STUDENT_PLAN_UPDATE" },
                    { 40, "STUDENT_PLAN_DELETE" },

                    // TENANT PLAN
                    { 41, "TENANT_PLAN_READ" },
                    { 42, "TENANT_PLAN_CREATE" },
                    { 43, "TENANT_PLAN_UPDATE" },
                    { 44, "TENANT_PLAN_DELETE" },

                    // GROUPS
                    { 45, "GROUP_READ" },
                    { 46, "GROUP_CREATE" },
                    { 47, "GROUP_UPDATE" },
                    { 48, "GROUP_DELETE" },
                    { 49, "GROUP_ASSIGN_USER" },
                    { 50, "GROUP_REMOVE_USER" },
                    { 51, "GROUP_ASSIGN_PERMISSION" }
                });
        }
    }
}