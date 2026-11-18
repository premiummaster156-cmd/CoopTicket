const { MessageFlags } = require("discord.js");
const logger = require("../utils/logger");
const { error } = require("../utils/embed");
const { handleButton } = require("./ticket");

async function handleInteraction(client, interaction) {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({
          embeds: [error("Unknown command", "This slash command is not registered.")],
          flags: MessageFlags.Ephemeral,
        });
      }
      try {
        await command.execute(interaction, client);
      } catch (commandError) {
        logger.error("Error in /" + interaction.commandName + ":", commandError);
        const payload = {
          embeds: [error("Command Error", String(commandError.message || "Unknown error").slice(0, 900))],
          flags: MessageFlags.Ephemeral,
        };
        if (interaction.replied || interaction.deferred) await interaction.editReply(payload).catch(() => {});
        else await interaction.reply(payload).catch(() => {});
      }
      return;
    }

    if (interaction.isButton()) return handleButton(interaction, client);
  } catch (interactionError) {
    logger.error("Interaction routing error:", interactionError);
    const payload = { content: "The interaction could not be completed. Please try again.", flags: MessageFlags.Ephemeral };
    if (interaction.deferred || interaction.replied) await interaction.followUp(payload).catch(() => {});
    else if (interaction.isRepliable?.()) await interaction.reply(payload).catch(() => {});
  }
}

module.exports = { handleInteraction };
