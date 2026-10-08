using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend_proyecto.Migrations
{
    /// <inheritdoc />
    public partial class AddClassTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClassTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    DayOfWeek = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    ActivityId = table.Column<int>(type: "integer", nullable: false),
                    ProfessorId = table.Column<int>(type: "integer", nullable: false),
                    MaxCapacity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassTemplates_Activities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "Activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassTemplates_Professors_ProfessorId",
                        column: x => x.ProfessorId,
                        principalTable: "Professors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassTemplates_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClassTemplateStudents",
                columns: table => new
                {
                    ClassTemplateId = table.Column<int>(type: "integer", nullable: false),
                    StudentId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassTemplateStudents", x => new { x.ClassTemplateId, x.StudentId });
                    table.ForeignKey(
                        name: "FK_ClassTemplateStudents_ClassTemplates_ClassTemplateId",
                        column: x => x.ClassTemplateId,
                        principalTable: "ClassTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassTemplateStudents_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClassTemplates_ActivityId",
                table: "ClassTemplates",
                column: "ActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassTemplates_ProfessorId",
                table: "ClassTemplates",
                column: "ProfessorId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassTemplates_TenantId",
                table: "ClassTemplates",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassTemplateStudents_StudentId",
                table: "ClassTemplateStudents",
                column: "StudentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClassTemplateStudents");

            migrationBuilder.DropTable(
                name: "ClassTemplates");
        }
    }
}
