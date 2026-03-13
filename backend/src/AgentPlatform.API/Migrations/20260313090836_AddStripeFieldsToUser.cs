using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgentPlatform.API.Migrations
{
    /// <inheritdoc />
    public partial class AddStripeFieldsToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StripeCustomerId",
                table: "users",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeSubscriptionId",
                table: "users",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StripeCustomerId",
                table: "users");

            migrationBuilder.DropColumn(
                name: "StripeSubscriptionId",
                table: "users");
        }
    }
}
