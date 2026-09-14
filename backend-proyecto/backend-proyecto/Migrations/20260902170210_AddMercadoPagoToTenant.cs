using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_proyecto.Migrations
{
    /// <inheritdoc />
    public partial class AddMercadoPagoToTenant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MercadoPagoAccessToken",
                table: "Tenants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MercadoPagoRefreshToken",
                table: "Tenants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "MercadoPagoTokenExpiresAt",
                table: "Tenants",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MercadoPagoUserId",
                table: "Tenants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalPaymentId",
                table: "Payments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Payments",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MercadoPagoAccessToken",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "MercadoPagoRefreshToken",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "MercadoPagoTokenExpiresAt",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "MercadoPagoUserId",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ExternalPaymentId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Payments");
        }
    }
}
