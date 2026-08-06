const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const store = require("../../../utils/store");
const config = require("../../../config");
const { success, error, info, warning } = require("../../../utils/embed");
const { createTicket, closeTicket } = require("../../../handlers/ticket");

module.exports = [
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("ticket").setDescription("Create a support ticket.").addStringOption((o) => o.setName("category").setDescription("Ticket category").addChoices({ name: "Support", value: "Support" }, { name: "Bug Report", value: "Bug Report" }, { name: "Billing", value: "Billing" }, { name: "Other", value: "Other" })),
    async execute(interaction) {
      const category = interaction.options.getString("category") || "Support";
      await createTicket(interaction, interaction.client, category);
    },
  },
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("close").setDescription("Close the current ticket."),
    async execute(interaction) {
      await closeTicket(interaction, interaction.client);
    },
  },
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("setup").setDescription("Set up the ticket system.").addChannelOption((o) => o.setName("channel").setDescription("Channel to post the ticket panel").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
      const channel = interaction.options.getChannel("channel");
      const btn = new ButtonBuilder().setCustomId("create_ticket").setLabel("🎫 Create Ticket").setStyle(ButtonStyle.Primary);
      const row = new ActionRowBuilder().addComponents(btn);
      const embed = new EmbedBuilder().setTitle("🎫 Support Tickets").setColor(config.colors.primary)
        .setDescription("Need help? Click the button below to create a ticket. Our support team will assist you!");
      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ embeds: [success("Setup Complete", `Ticket panel posted to ${channel}.`)], ephemeral: true });
    },
  },
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("setcategory").setDescription("Set the ticket category.").addChannelOption((o) => o.setName("category").setDescription("Category channel").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
      const cat = interaction.options.getChannel("category");
      store.setSetting(interaction.guild.id, "categoryId", cat.id);
      await interaction.reply({ embeds: [success("Category Set", `Tickets will be created under ${cat}.`)] });
    },
  },
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("setsupportrole").setDescription("Set the support role.").addRoleOption((o) => o.setName("role").setDescription("The support role").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
      const role = interaction.options.getRole("role");
      store.setSetting(interaction.guild.id, "supportRole", role.id);
      await interaction.reply({ embeds: [success("Support Role", `Support role set to **${role.name}**.`)] });
    },
  },
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("ticketstats").setDescription("View ticket statistics."),
    async execute(interaction) {
      const stats = store.getStats(interaction.guild.id);
      const embed = new EmbedBuilder().setTitle("🎫 Ticket Stats").setColor(config.colors.primary)
        .addFields(
          { name: "Total", value: String(stats.total), inline: true },
          { name: "Open", value: String(stats.open), inline: true },
          { name: "Closed", value: String(stats.closed), inline: true },
        );
      await interaction.reply({ embeds: [embed] });
    },
  },
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("add").setDescription("Add a user to the ticket.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)),
    async execute(interaction) {
      const target = interaction.options.getUser("user");
      const ticket = store.getTicket(interaction.guild.id, interaction.channel.id);
      if (!ticket) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
      const member = interaction.guild.members.cache.get(target.id);
      if (!member) return interaction.reply({ embeds: [error("Not found", "User not in server.")], ephemeral: true });
      await interaction.channel.permissionOverwrites.create(target.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
      await interaction.reply({ embeds: [success("Added", `Added **${target.tag}** to the ticket.`)] });
    },
  },
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("remove").setDescription("Remove a user from the ticket.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)),
    async execute(interaction) {
      const target = interaction.options.getUser("user");
      const ticket = store.getTicket(interaction.guild.id, interaction.channel.id);
      if (!ticket) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
      await interaction.channel.permissionOverwrites.delete(target.id);
      await interaction.reply({ embeds: [success("Removed", `Removed **${target.tag}** from the ticket.`)] });
    },
  },
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("rename").setDescription("Rename the ticket.").addStringOption((o) => o.setName("name").setDescription("New name").setRequired(true)),
    async execute(interaction) {
      const name = interaction.options.getString("name");
      const ticket = store.getTicket(interaction.guild.id, interaction.channel.id);
      if (!ticket) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
      await interaction.channel.setName(name.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
      await interaction.reply({ embeds: [success("Renamed", `Ticket renamed to **${name}**.`)] });
    },
  },
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("claim").setDescription("Claim this ticket."),
    async execute(interaction) {
      const ticket = store.getTicket(interaction.guild.id, interaction.channel.id);
      if (!ticket) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
      if (ticket.claimedBy) return interaction.reply({ embeds: [warning("Already claimed", `This ticket is claimed by <@${ticket.claimedBy}>.`)] });
      const settings = store.getSettings(interaction.guild.id);
      const isSupport = interaction.member.roles.cache.has(settings.supportRole || config.supportRoleId) || interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);
      if (!isSupport) return interaction.reply({ embeds: [error("No permission", "Only support can claim tickets.")], ephemeral: true });
      ticket.claimedBy = interaction.user.id;
      await interaction.reply({ embeds: [success("Claimed", `Ticket claimed by ${interaction.user}.`)] });
    },
  },
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("unclaim").setDescription("Unclaim this ticket."),
    async execute(interaction) {
      const ticket = store.getTicket(interaction.guild.id, interaction.channel.id);
      if (!ticket) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
      if (ticket.claimedBy !== interaction.user.id) return interaction.reply({ embeds: [error("Not yours", "You didn't claim this ticket.")], ephemeral: true });
      delete ticket.claimedBy;
      await interaction.reply({ embeds: [success("Unclaimed", "Ticket unclaimed.")] });
    },
  },
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("transcript").setDescription("View the ticket transcript.").addChannelOption((o) => o.setName("channel").setDescription("Optional: target channel")),
    async execute(interaction) {
      const ticket = store.getTicket(interaction.guild.id, interaction.channel.id);
      if (!ticket) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
      const messages = await interaction.channel.messages.fetch({ limit: 50 });
      const text = messages.filter((m) => !m.author.bot).map((m) => `${m.author.tag}: ${m.content}`).reverse().join("\n").slice(0, 3500) || "No messages.";
      const target = interaction.options.getChannel("channel") || interaction.channel;
      await target.send({ embeds: [info("📜 Transcript", text)] });
      await interaction.reply({ embeds: [success("Transcript", `Transcript sent to ${target}.`)], ephemeral: true });
    },
  },
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("panel").setDescription("Post a multi-category ticket panel.").addChannelOption((o) => o.setName("channel").setDescription("Channel to post").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
      const channel = interaction.options.getChannel("channel");
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("ticket_Support").setLabel("🛟 Support").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("ticket_Bug Report").setLabel("🐛 Bug").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("ticket_Billing").setLabel("💳 Billing").setStyle(ButtonStyle.Success),
      );
      const embed = new EmbedBuilder().setTitle("🎫 Ticket Panel").setColor(config.colors.primary).setDescription("Select a category to create a ticket.");
      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ embeds: [success("Panel Posted", `Ticket panel sent to ${channel}.`)], ephemeral: true });
    },
  },
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("delete").setDescription("Force delete this ticket.").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
      const ticket = store.getTicket(interaction.guild.id, interaction.channel.id);
      if (!ticket) return interaction.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")], ephemeral: true });
      await interaction.reply({ embeds: [warning("Deleting", "Deleting this ticket now...")] });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    },
  },
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("ticketlogs").setDescription("Set the ticket log channel.").addChannelOption((o) => o.setName("channel").setDescription("The log channel").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
      const channel = interaction.options.getChannel("channel");
      store.setSetting(interaction.guild.id, "logChannel", channel.id);
      await interaction.reply({ embeds: [success("Log Channel", `Ticket logs will go to ${channel}.`)] });
    },
  },
  {
    category: "ticket",
    data: new SlashCommandBuilder().setName("ticketsettings").setDescription("View ticket settings."),
    async execute(interaction) {
      const s = store.getSettings(interaction.guild.id);
      const embed = info("Ticket Settings", "Current ticket configuration")
        .addFields(
          { name: "Support Role", value: s.supportRole ? `<@&${s.supportRole}>` : config.supportRoleId ? `<@&${config.supportRoleId}>` : "Not set", inline: true },
          { name: "Category", value: s.categoryId ? `#${interaction.guild.channels.cache.get(s.categoryId)?.name || "deleted"}` : "Not set", inline: true },
          { name: "Log Channel", value: s.logChannel ? `<#${s.logChannel}>` : "Not set", inline: true },
        );
      await interaction.reply({ embeds: [embed] });
    },
  },
];
