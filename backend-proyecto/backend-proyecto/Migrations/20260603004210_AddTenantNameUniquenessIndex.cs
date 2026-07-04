using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_proyecto.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantNameUniquenessIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tenants_OwnerUserId",
                table: "Tenants");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_OwnerUserId_Name",
                table: "Tenants",
                columns: new[] { "OwnerUserId", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tenants_OwnerUserId_Name",
                table: "Tenants");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_OwnerUserId",
                table: "Tenants",
                column: "OwnerUserId");
        }
    }
}
