using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_proyecto.Migrations
{
    /// <inheritdoc />
    public partial class FixProfessorSpecialityRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Students",
                table: "Students");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Professors",
                table: "Professors");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Students",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Professors",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Professors",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Students",
                table: "Students",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Professors",
                table: "Professors",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "ProfessorSpeciality",
                columns: table => new
                {
                    ProfessorId = table.Column<int>(type: "int", nullable: false),
                    SpecialityId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfessorSpeciality", x => new { x.ProfessorId, x.SpecialityId });
                    table.ForeignKey(
                        name: "FK_ProfessorSpeciality_Professors_ProfessorId",
                        column: x => x.ProfessorId,
                        principalTable: "Professors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfessorSpeciality_Specialities_SpecialityId",
                        column: x => x.SpecialityId,
                        principalTable: "Specialities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Students_UserId",
                table: "Students",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Professors_UserId",
                table: "Professors",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessorSpeciality_SpecialityId",
                table: "ProfessorSpeciality",
                column: "SpecialityId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProfessorSpeciality");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Students",
                table: "Students");

            migrationBuilder.DropIndex(
                name: "IX_Students_UserId",
                table: "Students");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Professors",
                table: "Professors");

            migrationBuilder.DropIndex(
                name: "IX_Professors_UserId",
                table: "Professors");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Professors");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Professors");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Students",
                table: "Students",
                columns: new[] { "UserId", "TenantId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_Professors",
                table: "Professors",
                columns: new[] { "UserId", "TenantId" });
        }
    }
}
