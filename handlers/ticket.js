const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const store = require("../utils/store");
const config = require("../config");
const { success, error, info } = require("../utils/embed");

async function createTicket(interaction, client, category) {
  await interaction.deferReply({ ephemeral: true });
  const guild = interaction.guild;
  const existing = store.getTicketByUser(guild.id, interaction.user.id);
  if (existing) {
    return interaction.editReply({ embeds: [error("Already open", `You already have an open ticket: <#${existing.channelId}>`)] });
  }
  const settings = store.getSettings(guild.id);
  const categoryName = category || "Support";
  const catChannel = guild.channels.cache.find((c) => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === categoryName.toLowerCase())
    || (settings.categoryId ? guild.channels.cache.get(settings.categoryId) : null);

  const channel = await guild.channels.create({
    name: `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "") || "user"}`,
    type: ChannelType.GuildText,
    parent: catChannel,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: settings.supportRole || config.supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    ],
  });

  store.createTicket(guild.id, interaction.user.id, channel.id, categoryName);

  const embed = new EmbedBuilder().setTitle(`🎫 ${categoryName} Ticket`).setColor(config.colors.primary)
    .setDescription(`Welcome <@${interaction.user.id}>!\nPlease describe your issue. Support will be with you shortly.`)
    .addFields({ name: "Ticket ID", value: `#${store.getTicket(guild.id, channel.id)?.id || "—"}`, inline: true }, { name: "Category", value: categoryName, inline: true });
  const closeBtn = new ButtonBuilder().setCustomId("close_ticket").setLabel("🔒 Close").setStyle(ButtonStyle.Danger);
  const row = new ActionRowBuilder().addComponents(closeBtn);
  await channel.send({ embeds: [embed], components: [row] });
  await channel.send(`${settings.supportRole ? `<@&${settings.supportRole}> ` : ""}<@${interaction.user.id}>`).then((m) => m.delete().catch(() => {}));
  await interaction.editReply({ embeds: [success("Ticket Created", `Your ticket is ready: ${channel}`)] });
}

async function closeTicket(interaction, client) {
  const guild = interaction.guild;
  const ticket = store.getTicket(guild.id, interaction.channel.id);
  if (!ticket) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
  const settings = store.getSettings(guild.id);
  const isSupport = interaction.member.roles.cache.has(settings.supportRole || config.supportRoleId) || interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);
  if (!isSupport && interaction.user.id !== ticket.userId) return interaction.reply({ embeds: [error("No permission", "You can't close this ticket.")], ephemeral: true });
  store.closeTicket(guild.id, interaction.channel.id);
  await interaction.reply({ embeds: [success("🔒 Ticket Closed", "This ticket is now closed. Deleting in 5 seconds...")] });
  setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
}

async function handleButton(interaction, client) {
  if (interaction.customId === "close_ticket") return closeTicket(interaction, client);
  if (interaction.customId === "create_ticket") return createTicket(interaction, client, "Support");
  if (interaction.customId.startsWith("ticket_")) {
    const category = interaction.customId.replace("ticket_", "");
    return createTicket(interaction, client, category);
  }
  return interaction.reply({ content: "Unknown button.", ephemeral: true });
}

module.exports = { handleButton, createTicket, closeTicket };
