using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_proyecto.Migrations
{
    /// <inheritdoc />
    public partial class AddProfessorSpecialities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProfessorSpeciality_Professors_ProfessorId",
                table: "ProfessorSpeciality");

            migrationBuilder.DropForeignKey(
                name: "FK_ProfessorSpeciality_Specialities_SpecialityId",
                table: "ProfessorSpeciality");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProfessorSpeciality",
                table: "ProfessorSpeciality");

            migrationBuilder.RenameTable(
                name: "ProfessorSpeciality",
                newName: "ProfessorSpecialities");

            migrationBuilder.RenameIndex(
                name: "IX_ProfessorSpeciality_SpecialityId",
                table: "ProfessorSpecialities",
                newName: "IX_ProfessorSpecialities_SpecialityId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProfessorSpecialities",
                table: "ProfessorSpecialities",
                columns: new[] { "ProfessorId", "SpecialityId" });

            migrationBuilder.AddForeignKey(
                name: "FK_ProfessorSpecialities_Professors_ProfessorId",
                table: "ProfessorSpecialities",
                column: "ProfessorId",
                principalTable: "Professors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProfessorSpecialities_Specialities_SpecialityId",
                table: "ProfessorSpecialities",
                column: "SpecialityId",
                principalTable: "Specialities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProfessorSpecialities_Professors_ProfessorId",
                table: "ProfessorSpecialities");

            migrationBuilder.DropForeignKey(
                name: "FK_ProfessorSpecialities_Specialities_SpecialityId",
                table: "ProfessorSpecialities");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProfessorSpecialities",
                table: "ProfessorSpecialities");

            migrationBuilder.RenameTable(
                name: "ProfessorSpecialities",
                newName: "ProfessorSpeciality");

            migrationBuilder.RenameIndex(
                name: "IX_ProfessorSpecialities_SpecialityId",
                table: "ProfessorSpeciality",
                newName: "IX_ProfessorSpeciality_SpecialityId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProfessorSpeciality",
                table: "ProfessorSpeciality",
                columns: new[] { "ProfessorId", "SpecialityId" });

            migrationBuilder.AddForeignKey(
                name: "FK_ProfessorSpeciality_Professors_ProfessorId",
                table: "ProfessorSpeciality",
                column: "ProfessorId",
                principalTable: "Professors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProfessorSpeciality_Specialities_SpecialityId",
                table: "ProfessorSpeciality",
                column: "SpecialityId",
                principalTable: "Specialities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
