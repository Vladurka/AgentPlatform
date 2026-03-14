using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgentPlatform.API.Migrations
{
    /// <inheritdoc />
    public partial class AddLlmFieldsToAgent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApiKeyEncrypted",
                table: "agents",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "LlmModel",
                table: "agents",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LlmProvider",
                table: "agents",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApiKeyEncrypted",
                table: "agents");

            migrationBuilder.DropColumn(
                name: "LlmModel",
                table: "agents");

            migrationBuilder.DropColumn(
                name: "LlmProvider",
                table: "agents");
        }
    }
}
