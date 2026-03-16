using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgentPlatform.API.Migrations
{
    /// <inheritdoc />
    public partial class AddConversationAgentCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "FK_conversations_agents_AgentId",
                table: "conversations",
                column: "AgentId",
                principalTable: "agents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_conversations_agents_AgentId",
                table: "conversations");
        }
    }
}
