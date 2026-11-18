const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const config = require("../../../config");
const { success, error, info, warning } = require("../../../utils/embed");

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

module.exports = [
  { category: "utility", data: new SlashCommandBuilder().setName("help").setDescription("Show all commands."), async execute(interaction) {
    const cmds = interaction.client.slashCommands;
    const text = cmds.map((c) => `\`/${c.data.name}\` — ${c.data.description}`).join("\n").slice(0, 4000);
    await interaction.reply({ embeds: [info("CoopTicket Help", text)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("ping").setDescription("Check latency."), async execute(interaction) {
    await interaction.reply({ embeds: [success("Pong!", `Latency: ${Math.round(interaction.client.ws.ping)}ms`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("botinfo").setDescription("Bot information."), async execute(interaction) {
    await interaction.reply({ embeds: [info("🎫 CoopTicket", `**Servers:** ${interaction.client.guilds.cache.size}\n**Slash:** ${interaction.client.slashCommands.size}`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("invite").setDescription("Get the invite link."), async execute(interaction) {
    await interaction.reply({ embeds: [success("Invite", `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=8&scope=bot%20applications.commands`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("serverinfo").setDescription("Server information."), async execute(interaction) {
    const g = interaction.guild;
    await interaction.reply({ embeds: [info(g.name, `**Members:** ${g.memberCount}\n**Owner:** <@${g.ownerId}>\n**Created:** ${g.createdAt.toDateString()}`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("avatar").setDescription("Get avatar.").addUserOption((o) => o.setName("user").setDescription("The user")), async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    await interaction.reply({ embeds: [new EmbedBuilder().setTitle(user.tag).setColor(config.colors.primary).setImage(user.displayAvatarURL({ size: 1024 }))] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("uptime").setDescription("Bot uptime."), async execute(interaction) {
    const s = Math.floor(interaction.client.uptime / 1000);
    await interaction.reply({ embeds: [success("Uptime", `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("userinfo").setDescription("User information.").addUserOption((o) => o.setName("user").setDescription("The user")), async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    await interaction.reply({ embeds: [info(user.tag, `**ID:** ${user.id}\n**Joined:** ${member?.joinedAt?.toDateString() || "N/A"}\n**Roles:** ${member?.roles.cache.size || 0}`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("channelinfo").setDescription("Channel information."), async execute(interaction) {
    const c = interaction.channel;
    await interaction.reply({ embeds: [info(c.name, `**ID:** ${c.id}\n**Type:** ${c.type}\n**Created:** ${c.createdAt?.toDateString() || "N/A"}`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("roleinfo").setDescription("Role information.").addRoleOption((o) => o.setName("role").setDescription("The role").setRequired(true)), async execute(interaction) {
    const r = interaction.options.getRole("role");
    await interaction.reply({ embeds: [info(r.name, `**ID:** ${r.id}\n**Color:** ${r.hexColor}\n**Members:** ${r.members.size}`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("say").setDescription("Make the bot say something.").addStringOption((o) => o.setName("text").setDescription("Text").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), async execute(interaction) {
    await interaction.reply({ content: interaction.options.getString("text") });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("embed").setDescription("Post an embed.").addStringOption((o) => o.setName("title").setDescription("Title").setRequired(true)).addStringOption((o) => o.setName("description").setDescription("Description").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), async execute(interaction) {
    const e = new EmbedBuilder().setTitle(interaction.options.getString("title")).setDescription(interaction.options.getString("description")).setColor(config.colors.primary);
    await interaction.reply({ embeds: [e] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("announce").setDescription("Announce a message.").addStringOption((o) => o.setName("message").setDescription("Message").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), async execute(interaction) {
    await interaction.channel.send({ embeds: [warning("📢 Announcement", interaction.options.getString("message"))] });
    await interaction.reply({ content: "Announced!", ephemeral: true });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("clear").setDescription("Clear messages.").addIntegerOption((o) => o.setName("amount").setDescription("Amount 1-100").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), async execute(interaction) {
    const amount = interaction.options.getInteger("amount");
    await interaction.channel.bulkDelete(Math.min(amount, 100), true);
    await interaction.reply({ content: `Cleared ${amount} messages.`, ephemeral: true }).catch(() => {});
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("slowmode").setDescription("Set slowmode.").addIntegerOption((o) => o.setName("seconds").setDescription("Seconds").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), async execute(interaction) {
    const s = interaction.options.getInteger("seconds");
    await interaction.channel.setRateLimitPerUser(s);
    await interaction.reply({ embeds: [success("Slowmode", `Set slowmode to **${s}s**.`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("nickname").setDescription("Change nickname.").addStringOption((o) => o.setName("nickname").setDescription("New nickname")).setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames), async execute(interaction) {
    const nick = interaction.options.getString("nickname");
    await interaction.member.setNickname(nick);
    await interaction.reply({ embeds: [success("Nickname", `Set to **${nick || interaction.user.username}**.`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("timeout").setDescription("Timeout a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).addIntegerOption((o) => o.setName("minutes").setDescription("Minutes").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), async execute(interaction) {
    const target = interaction.options.getUser("user");
    const mins = interaction.options.getInteger("minutes");
    const member = interaction.guild.members.cache.get(target.id);
    await member.timeout(mins * 60 * 1000, "Timeout by " + interaction.user.tag);
    await interaction.reply({ embeds: [success("Timeout", `Timed out **${target.tag}** for **${mins}** minutes.`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("ban").setDescription("Ban a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), async execute(interaction) {
    const target = interaction.options.getUser("user");
    await interaction.guild.members.ban(target.id);
    await interaction.reply({ embeds: [warning("Banned", `Banned **${target.tag}**.`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("kick").setDescription("Kick a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), async execute(interaction) {
    const target = interaction.options.getUser("user");
    const member = interaction.guild.members.cache.get(target.id);
    await member.kick();
    await interaction.reply({ embeds: [warning("Kicked", `Kicked **${target.tag}**.`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("unban").setDescription("Unban a user.").addStringOption((o) => o.setName("userid").setDescription("The user ID").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), async execute(interaction) {
    const id = interaction.options.getString("userid");
    await interaction.guild.members.unban(id);
    await interaction.reply({ embeds: [success("Unbanned", `Unbanned **${id}**.`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("lock").setDescription("Lock the channel.").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), async execute(interaction) {
    await interaction.channel.permissionOverwrites.set([
      { id: interaction.guild.id, deny: ["SendMessages"] },
    ]);
    await interaction.reply({ embeds: [warning("Locked", "Channel locked.")] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("unlock").setDescription("Unlock the channel.").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), async execute(interaction) {
    await interaction.channel.permissionOverwrites.set([
      { id: interaction.guild.id, allow: ["SendMessages"] },
    ]);
    await interaction.reply({ embeds: [success("Unlocked", "Channel unlocked.")] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("createrole").setDescription("Create a role.").addStringOption((o) => o.setName("name").setDescription("Role name").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), async execute(interaction) {
    const name = interaction.options.getString("name");
    const role = await interaction.guild.roles.create({ name });
    await interaction.reply({ embeds: [success("Role Created", `Created role **${role.name}**.`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("deleterole").setDescription("Delete a role.").addRoleOption((o) => o.setName("role").setDescription("The role").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), async execute(interaction) {
    const role = interaction.options.getRole("role");
    await role.delete();
    await interaction.reply({ embeds: [success("Role Deleted", `Deleted role **${role.name}**.`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("createtextchannel").setDescription("Create a text channel.").addStringOption((o) => o.setName("name").setDescription("Channel name").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), async execute(interaction) {
    const name = interaction.options.getString("name");
    const ch = await interaction.guild.channels.create({ name, type: 0 });
    await interaction.reply({ embeds: [success("Channel Created", `Created ${ch}.`)] });
  } },
  { category: "utility", data: new SlashCommandBuilder().setName("deletetextchannel").setDescription("Delete a channel.").addChannelOption((o) => o.setName("channel").setDescription("The channel").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), async execute(interaction) {
    const ch = interaction.options.getChannel("channel");
    await ch.delete();
    await interaction.reply({ embeds: [success("Channel Deleted", `Deleted ${ch.name}.`)] });
  } },
];
