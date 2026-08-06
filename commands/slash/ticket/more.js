const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const store = require("../../../utils/store");
const config = require("../../../config");
const { success, error, info, warning } = require("../../../utils/embed");

module.exports = [
  { category: "ticket", data: new SlashCommandBuilder().setName("ticketinfo").setDescription("Info about current ticket."), async execute(interaction) {
    const t = store.getTicket(interaction.guild.id, interaction.channel.id);
    if (!t) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
    await interaction.reply({ embeds: [info("Ticket Info", `**ID:** #${t.id}\n**User:** <@${t.userId}>\n**Category:** ${t.category}\n**Status:** ${t.status}\n**Created:** ${t.createdAt}`)] });
  } },
  { category: "ticket", data: new SlashCommandBuilder().setName("reopen").setDescription("Reopen a closed ticket."), async execute(interaction) {
    const t = store.getTicket(interaction.guild.id, interaction.channel.id);
    if (!t) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
    t.status = "open";
    await interaction.reply({ embeds: [success("Reopened", "This ticket has been reopened.")] });
  } },
  { category: "ticket", data: new SlashCommandBuilder().setName("priority").setDescription("Set ticket priority.").addStringOption((o) => o.setName("level").setDescription("Priority").setRequired(true).addChoices({ name: "Low", value: "low" }, { name: "Medium", value: "medium" }, { name: "High", value: "high" })), async execute(interaction) {
    const t = store.getTicket(interaction.guild.id, interaction.channel.id);
    if (!t) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
    const lvl = interaction.options.getString("level");
    t.priority = lvl;
    await interaction.reply({ embeds: [success("Priority", `Priority set to **${lvl}**.`)] });
  } },
  { category: "ticket", data: new SlashCommandBuilder().setName("setmax").setDescription("Set max tickets per user.").addIntegerOption((o) => o.setName("count").setDescription("Max tickets").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), async execute(interaction) {
    store.setSetting(interaction.guild.id, "maxTickets", interaction.options.getInteger("count"));
    await interaction.reply({ embeds: [success("Max Tickets", `Max tickets set to **${interaction.options.getInteger("count")}**.`)] });
  } },
  { category: "ticket", data: new SlashCommandBuilder().setName("ticketcount").setDescription("Count your open tickets."), async execute(interaction) {
    const list = store.getTicketByUser(interaction.guild.id, interaction.user.id);
    await interaction.reply({ embeds: [info("Your Tickets", list ? `You have an open ticket: <#${list.channelId}>.` : "You have no open tickets.")] });
  } },
  { category: "ticket", data: new SlashCommandBuilder().setName("escalate").setDescription("Escalate this ticket to a staff member."), async execute(interaction) {
    const t = store.getTicket(interaction.guild.id, interaction.channel.id);
    if (!t) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
    t.escalated = true;
    await interaction.reply({ embeds: [warning("Escalated", "This ticket has been escalated to staff.")] });
  } },
  { category: "ticket", data: new SlashCommandBuilder().setName("note").setDescription("Add an internal note to the ticket.").addStringOption((o) => o.setName("note").setDescription("The note").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), async execute(interaction) {
    const t = store.getTicket(interaction.guild.id, interaction.channel.id);
    if (!t) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
    t.note = interaction.options.getString("note");
    await interaction.reply({ embeds: [success("Note Added", "Internal note saved.")] });
  } },
  { category: "ticket", data: new SlashCommandBuilder().setName("transfer").setDescription("Transfer ticket to another user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), async execute(interaction) {
    const t = store.getTicket(interaction.guild.id, interaction.channel.id);
    if (!t) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
    const target = interaction.options.getUser("user");
    t.userId = target.id;
    await interaction.channel.permissionOverwrites.create(target.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
    await interaction.reply({ embeds: [success("Transferred", `Ticket transferred to **${target.tag}**.`)] });
  } },
  { category: "ticket", data: new SlashCommandBuilder().setName("lock").setDescription("Lock the ticket.").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), async execute(interaction) {
    const t = store.getTicket(interaction.guild.id, interaction.channel.id);
    if (!t) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
    t.locked = true;
    await interaction.reply({ embeds: [warning("Locked", "This ticket has been locked.")] });
  } },
  { category: "ticket", data: new SlashCommandBuilder().setName("unlock").setDescription("Unlock the ticket.").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), async execute(interaction) {
    const t = store.getTicket(interaction.guild.id, interaction.channel.id);
    if (!t) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
    t.locked = false;
    await interaction.reply({ embeds: [success("Unlocked", "This ticket has been unlocked.")] });
  } },
  { category: "ticket", data: new SlashCommandBuilder().setName("moveto").setDescription("Move ticket to another category.").addChannelOption((o) => o.setName("category").setDescription("Target category").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), async execute(interaction) {
    const cat = interaction.options.getChannel("category");
    await interaction.channel.setParent(cat.id);
    await interaction.reply({ embeds: [success("Moved", `Ticket moved to ${cat}.`)] });
  } },
  { category: "ticket", data: new SlashCommandBuilder().setName("whois").setDescription("Who opened this ticket."), async execute(interaction) {
    const t = store.getTicket(interaction.guild.id, interaction.channel.id);
    if (!t) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
    await interaction.reply({ embeds: [info("Ticket Owner", `Opened by <@${t.userId}> (**${t.userId}**).`)] });
  } },
  { category: "ticket", data: new SlashCommandBuilder().setName("settopic").setDescription("Set the ticket topic.").addStringOption((o) => o.setName("topic").setDescription("The topic").setRequired(true)), async execute(interaction) {
    const t = store.getTicket(interaction.guild.id, interaction.channel.id);
    if (!t) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
    t.topic = interaction.options.getString("topic");
    await interaction.reply({ embeds: [success("Topic", `Topic set to **${t.topic}**.`)] });
  } },
  { category: "ticket", data: new SlashCommandBuilder().setName("opentickets").setDescription("List all open tickets.").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), async execute(interaction) {
    const list = store.getTicketList(interaction.guild.id, "open");
    if (list.length === 0) return interaction.reply({ embeds: [info("Open Tickets", "No open tickets.")] });
    await interaction.reply({ embeds: [info("Open Tickets", list.map((t) => `<#${t.channelId}> — <@${t.userId}>`).join("\n").slice(0, 4000))] });
  } },
  { category: "ticket", data: new SlashCommandBuilder().setName("closedtickets").setDescription("List all closed tickets.").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), async execute(interaction) {
    const list = store.getTicketList(interaction.guild.id, "closed");
    if (list.length === 0) return interaction.reply({ embeds: [info("Closed Tickets", "No closed tickets.")] });
    await interaction.reply({ embeds: [info("Closed Tickets", list.map((t) => `#${t.id} — <@${t.userId}>`).join("\n").slice(0, 4000))] });
  } },
];
