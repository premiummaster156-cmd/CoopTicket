const logger = require("../utils/logger");
const { error } = require("../utils/embed");

async function handleInteraction(client, interaction) {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = client.slashCommands.get(interaction.commandName);
      if (!cmd) return interaction.reply({ embeds: [error("Unknown", "Command not registered.")], ephemeral: true });
      try { await cmd.execute(interaction, client); }
      catch (err) {
        logger.error(`Error in /${interaction.commandName}:`, err);
        const reply = { embeds: [error("Error", "Something went wrong.\n```\n" + (err.message || "") + "\n```")], ephemeral: true };
        if (interaction.replied || interaction.deferred) await interaction.editReply(reply).catch(() => {});
        else await interaction.reply(reply).catch(() => {});
      }
      return;
    }
    if (interaction.isButton()) {
      const { handleButton } = require("./ticket");
      return handleButton(interaction, client);
    }
  } catch (err) { logger.error("Interaction error:", err); }
}
module.exports = { handleInteraction };
