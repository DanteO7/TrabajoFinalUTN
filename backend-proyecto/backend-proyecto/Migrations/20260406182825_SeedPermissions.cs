using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend_proyecto.Migrations
{
    /// <inheritdoc />
    public partial class SeedPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Groups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Groups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Groups_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserGroups",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    GroupId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserGroups", x => new { x.UserId, x.GroupId });
                    table.ForeignKey(
                        name: "FK_UserGroups_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserGroups_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GroupPermissions",
                columns: table => new
                {
                    GroupId = table.Column<int>(type: "integer", nullable: false),
                    PermissionId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupPermissions", x => new { x.GroupId, x.PermissionId });
                    table.ForeignKey(
                        name: "FK_GroupPermissions_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GroupPermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "TENANT_READ" },
                    { 2, "TENANT_UPDATE" },
                    { 3, "USER_READ" },
                    { 4, "USER_CREATE" },
                    { 5, "USER_UPDATE" },
                    { 6, "USER_DELETE" },
                    { 7, "STUDENT_READ" },
                    { 8, "STUDENT_CREATE" },
                    { 9, "STUDENT_UPDATE" },
                    { 10, "STUDENT_DELETE" },
                    { 11, "PROFESSOR_READ" },
                    { 12, "PROFESSOR_CREATE" },
                    { 13, "PROFESSOR_UPDATE" },
                    { 14, "PROFESSOR_DELETE" },
                    { 15, "PROFESSOR_ASSIGN_SPECIALITY" },
                    { 16, "PROFESSOR_REMOVE_SPECIALITY" },
                    { 17, "ACTIVITY_READ" },
                    { 18, "ACTIVITY_CREATE" },
                    { 19, "ACTIVITY_UPDATE" },
                    { 20, "ACTIVITY_DELETE" },
                    { 21, "SPECIALITY_READ" },
                    { 22, "SPECIALITY_CREATE" },
                    { 23, "SPECIALITY_UPDATE" },
                    { 24, "SPECIALITY_DELETE" },
                    { 25, "CLASS_READ" },
                    { 26, "CLASS_CREATE" },
                    { 27, "CLASS_UPDATE" },
                    { 28, "CLASS_DELETE" },
                    { 29, "RESERVATION_READ" },
                    { 30, "RESERVATION_CREATE" },
                    { 31, "RESERVATION_DELETE" },
                    { 32, "RESERVATION_CHANGE_STATUS" },
                    { 33, "PAYMENT_READ" },
                    { 34, "PAYMENT_CREATE" },
                    { 35, "PAYMENT_UPDATE" },
                    { 36, "PAYMENT_DELETE" },
                    { 37, "STUDENT_PLAN_READ" },
                    { 38, "STUDENT_PLAN_CREATE" },
                    { 39, "STUDENT_PLAN_UPDATE" },
                    { 40, "STUDENT_PLAN_DELETE" },
                    { 41, "TENANT_PLAN_READ" },
                    { 42, "TENANT_PLAN_CREATE" },
                    { 43, "TENANT_PLAN_UPDATE" },
                    { 44, "TENANT_PLAN_DELETE" },
                    { 45, "GROUP_READ" },
                    { 46, "GROUP_CREATE" },
                    { 47, "GROUP_UPDATE" },
                    { 48, "GROUP_DELETE" },
                    { 49, "GROUP_ASSIGN_USER" },
                    { 50, "GROUP_REMOVE_USER" },
                    { 51, "GROUP_ASSIGN_PERMISSION" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_GroupPermissions_PermissionId",
                table: "GroupPermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_Name_TenantId",
                table: "Groups",
                columns: new[] { "Name", "TenantId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Groups_TenantId",
                table: "Groups",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_UserGroups_GroupId",
                table: "UserGroups",
                column: "GroupId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GroupPermissions");

            migrationBuilder.DropTable(
                name: "UserGroups");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Groups");
        }
    }
}
