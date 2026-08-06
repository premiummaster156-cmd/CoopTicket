const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const store = require("../../../utils/store");
const config = require("../../../config");
const { success, error, info, warning } = require("../../../utils/embed");
const { createTicket, closeTicket } = require("../../../handlers/ticket");

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

module.exports = [
  { name: "ticket", aliases: ["new", "open"], description: "Create a ticket (prefix). Usage: -*-prefix*-ticket [category]", async execute(message, args) {
    const category = args[0] || "Support";
    try { await createTicket({ guild: message.guild, user: message.author, deferReply: async () => {}, editReply: (o) => message.channel.send({ embeds: o.embeds }).then(() => {}) }, message.client, category); }
    catch (err) { message.reply({ embeds: [error("Error", err.message)] }); }
  } },
  { name: "close", description: "Close the ticket (prefix).", async execute(message) {
    await closeTicket({ guild: message.guild, member: message.member, user: message.author, channel: message.channel, reply: (o) => message.channel.send({ embeds: o.embeds }) }, message.client);
  } },
  { name: "add", description: "Add a user to ticket (prefix). Usage: -*-prefix*-add @user", async execute(message, args) {
    const target = message.mentions.users.first();
    if (!target) return message.reply({ embeds: [error("Usage", "Mention a user.")] });
    const t = store.getTicket(message.guild.id, message.channel.id);
    if (!t) return message.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")] });
    await message.channel.permissionOverwrites.create(target.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
    await message.channel.send({ embeds: [success("Added", `Added **${target.tag}**.`)] });
  } },
  { name: "remove", description: "Remove a user from ticket (prefix). Usage: -*-prefix*-remove @user", async execute(message, args) {
    const target = message.mentions.users.first();
    if (!target) return message.reply({ embeds: [error("Usage", "Mention a user.")] });
    const t = store.getTicket(message.guild.id, message.channel.id);
    if (!t) return message.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")] });
    await message.channel.permissionOverwrites.delete(target.id);
    await message.channel.send({ embeds: [success("Removed", `Removed **${target.tag}**.`)] });
  } },
  { name: "claim", description: "Claim ticket (prefix).", async execute(message) {
    const t = store.getTicket(message.guild.id, message.channel.id);
    if (!t) return message.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")] });
    if (t.claimedBy) return message.reply({ embeds: [warning("Claimed", `Already claimed by <@${t.claimedBy}>.`)] });
    t.claimedBy = message.author.id;
    await message.channel.send({ embeds: [success("Claimed", `Ticket claimed by ${message.author}.`)] });
  } },
  { name: "unclaim", description: "Unclaim ticket (prefix).", async execute(message) {
    const t = store.getTicket(message.guild.id, message.channel.id);
    if (!t) return message.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")] });
    if (t.claimedBy !== message.author.id) return message.reply({ embeds: [error("Not yours", "You didn't claim this.")] });
    delete t.claimedBy;
    await message.channel.send({ embeds: [success("Unclaimed", "Ticket unclaimed.")] });
  } },
  { name: "rename", description: "Rename ticket (prefix). Usage: -*-prefix*-rename <name>", async execute(message, args) {
    const t = store.getTicket(message.guild.id, message.channel.id);
    if (!t) return message.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")] });
    const name = args.join("-").toLowerCase().replace(/[^a-z0-9-]/g, "");
    await message.channel.setName(name);
    await message.channel.send({ embeds: [success("Renamed", `Renamed to **${name}**.`)] });
  } },
  { name: "ticketinfo", description: "Ticket info (prefix).", async execute(message) {
    const t = store.getTicket(message.guild.id, message.channel.id);
    if (!t) return message.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")] });
    await message.channel.send({ embeds: [info("Ticket Info", `**ID:** #${t.id}\n**User:** <@${t.userId}>\n**Category:** ${t.category}\n**Status:** ${t.status}`)] });
  } },
  { name: "ticketstats", description: "Ticket stats (prefix).", async execute(message) {
    const s = store.getStats(message.guild.id);
    await message.channel.send({ embeds: [info("Ticket Stats", `Total: **${s.total}**\nOpen: **${s.open}**\nClosed: **${s.closed}**`)] });
  } },
  { name: "setup", description: "Set up ticket panel (prefix).", async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ embeds: [error("No permission", "Need Manage Guild.")] });
    const btn = { type: 2, style: 1, label: "🎫 Create Ticket", custom_id: "create_ticket" };
    const embed = new EmbedBuilder().setTitle("🎫 Support").setColor(config.colors.primary).setDescription("Click the button to create a ticket.");
    await message.channel.send({ embeds: [embed], components: [{ type: 1, components: [btn] }] });
  } },
  { name: "setsupportrole", description: "Set support role (prefix). Usage: -*-prefix*-setsupportrole @role", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ embeds: [error("No permission", "Need Manage Guild.")] });
    const role = message.mentions.roles.first();
    if (!role) return message.reply({ embeds: [error("Usage", "Mention a role.")] });
    store.setSetting(message.guild.id, "supportRole", role.id);
    await message.channel.send({ embeds: [success("Support Role", `Set to **${role.name}**.`)] });
  } },
  { name: "setcategory", description: "Set ticket category (prefix). Usage: -*-prefix*-setcategory [#category]", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ embeds: [error("No permission", "Need Manage Guild.")] });
    const cat = message.mentions.channels.first() || message.guild.channels.cache.find((c) => c.name === args[0]);
    if (!cat) return message.reply({ embeds: [error("Usage", "Provide a category channel.")] });
    store.setSetting(message.guild.id, "categoryId", cat.id);
    await message.channel.send({ embeds: [success("Category", `Set to ${cat}.`)] });
  } },
  { name: "transcript", description: "Ticket transcript (prefix).", async execute(message) {
    const t = store.getTicket(message.guild.id, message.channel.id);
    if (!t) return message.reply({ embeds: [error("Not a ticket", "This isn't a ticket channel.")] });
    const messages = await message.channel.messages.fetch({ limit: 30 });
    const text = messages.filter((m) => !m.author.bot).map((m) => `${m.author.tag}: ${m.content}`).reverse().join("\n").slice(0, 3500) || "No messages.";
    await message.channel.send({ embeds: [info("📜 Transcript", text)] });
  } },
  { name: "help", description: "Show help (prefix).", async execute(message) {
    const cmds = message.client.prefixCommands;
    const text = cmds.map((c) => `\`${config.prefix}${c.name}\` — ${c.description.replace(/\*-prefix-\*/g, config.prefix)}`).slice(0, 40).join("\n");
    await message.channel.send({ embeds: [info("CoopTicket Help", text)] });
  } },
  { name: "ping", description: "Pong (prefix).", async execute(message) {
    const now = Date.now();
    const m = await message.channel.send({ embeds: [info("Pinging...")] });
    await m.edit({ embeds: [success("Pong!", `Latency: ${Date.now() - now}ms`)] });
  } },
  { name: "botinfo", description: "Bot info (prefix).", async execute(message) {
    await message.channel.send({ embeds: [info("🎫 CoopTicket", `Slash: ${message.client.slashCommands.size}\nPrefix: ${message.client.prefixCommands.size}\nServers: ${message.client.guilds.cache.size}`)] });
  } },
  { name: "invite", description: "Invite link (prefix).", async execute(message) {
    await message.channel.send({ embeds: [success("Invite", `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=8&scope=bot%20applications.commands`)] });
  } },
  { name: "serverinfo", description: "Server info (prefix).", async execute(message) {
    const g = message.guild;
    await message.channel.send({ embeds: [info(g.name, `Members: **${g.memberCount}**\nOwner: <@${g.ownerId}>`)] });
  } },
  { name: "userinfo", description: "User info (prefix). Usage: -*-prefix*-userinfo [@user]", async execute(message) {
    const user = message.mentions.users.first() || message.author;
    await message.channel.send({ embeds: [info(user.tag, `**ID:** ${user.id}\n**Created:** ${user.createdAt.toDateString()}`)] });
  } },
  { name: "avatar", description: "Avatar (prefix). Usage: -*-prefix*-avatar [@user]", async execute(message) {
    const user = message.mentions.users.first() || message.author;
    await message.channel.send({ embeds: [new EmbedBuilder().setTitle(user.tag).setColor(config.colors.primary).setImage(user.displayAvatarURL({ size: 1024 }))] });
  } },
  { name: "uptime", description: "Uptime (prefix).", async execute(message) {
    const s = Math.floor(message.client.uptime / 1000);
    await message.channel.send({ embeds: [success("Uptime", `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`)] });
  } },
  { name: "clear", description: "Clear messages (prefix). Usage: -*-prefix*-clear <amount>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply({ embeds: [error("No permission", "Need Manage Messages.")] });
    const amount = parseInt(args[0], 10);
    await message.channel.bulkDelete(Math.min(amount || 5, 100), true).catch(() => {});
  } },
  { name: "say", description: "Make bot say (prefix). Usage: -*-prefix*-say <text>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply({ embeds: [error("No permission", "Need Manage Messages.")] });
    await message.channel.send(args.join(" "));
  } },
  { name: "poll", description: "Create poll (prefix). Usage: -*-prefix*-poll <question>", async execute(message, args) {
    const q = args.join(" ");
    const m = await message.channel.send({ embeds: [info("📊 Poll", q)] });
    await m.react("👍"); await m.react("👎");
  } },
  { name: "announce", description: "Announce (prefix). Usage: -*-prefix*-announce <text>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply({ embeds: [error("No permission", "Need Manage Messages.")] });
    await message.channel.send({ embeds: [warning("📢", args.join(" "))] });
  } },
  { name: "coinflip", description: "Flip a coin (prefix).", async execute(message) {
    await message.channel.send({ embeds: [info("🪙", `You got **${Math.random() < 0.5 ? "Heads" : "Tails"}**!`)] });
  } },
  { name: "dice", description: "Roll a die (prefix).", async execute(message) {
    await message.channel.send({ embeds: [info("🎲", `You rolled a **${Math.floor(Math.random() * 6) + 1}**!`)] });
  } },
  { name: "joke", description: "Get a joke (prefix).", async execute(message) {
    const jokes = ["Why don't scientists trust atoms? Because they make up everything!", "Why did the ticket go to therapy? It had too many issues.", "Support: 'Have you tried turning it off and on?'"];
    await message.channel.send({ embeds: [success("😂", rand(jokes))] });
  } },
  { name: "8ball", description: "Ask 8-ball (prefix).", async execute(message, args) {
    const answers = ["Yes!", "No.", "Maybe.", "Ask again later.", "Signs point to yes."];
    await message.channel.send({ embeds: [info("🎱", `**A:** ${rand(answers)}`)] });
  } },
  { name: "rate", description: "Rate something (prefix). Usage: -*-prefix*-rate <thing>", async execute(message, args) {
    await message.channel.send({ embeds: [info("⭐", `**${args.join(" ") || "that"}** is **${Math.floor(Math.random() * 11)}/10**.`)] });
  } },
  { name: "mock", description: "Mock text (prefix). Usage: -*-prefix*-mock <text>", async execute(message, args) {
    const text = args.join(" ").split("").map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join("");
    await message.channel.send({ embeds: [info("😏", text)] });
  } },
  { name: "reverse", description: "Reverse text (prefix). Usage: -*-prefix*-reverse <text>", async execute(message, args) {
    await message.channel.send({ embeds: [info("↩️", args.join(" ").split("").reverse().join(""))] });
  } },
  { name: "clap", description: "Clap text (prefix). Usage: -*-prefix*-clap <text>", async execute(message, args) {
    await message.channel.send({ content: args.join(" ").split(" ").join(" 👏 ") });
  } },
  { name: "fortune", description: "Get fortune (prefix).", async execute(message) {
    const fortunes = ["Your ticket will be resolved soon.", "A great opportunity awaits you.", "Help is on the way."];
    await message.channel.send({ embeds: [info("🔮", rand(fortunes))] });
  } },
  { name: "catfact", description: "Cat fact (prefix).", async execute(message) {
    const facts = ["Cats sleep 70% of their lives.", "Cats can rotate their ears 180 degrees."];
    await message.channel.send({ embeds: [info("🐱", rand(facts))] });
  } },
  { name: "dogfact", description: "Dog fact (prefix).", async execute(message) {
    const facts = ["A dog's nose print is unique.", "Dogs can smell 1000x better than humans."];
    await message.channel.send({ embeds: [info("🐶", rand(facts))] });
  } },
  { name: "meme", description: "Get a meme (prefix).", async execute(message) {
    const memes = ["When the ticket closes itself", "Support: 'Have you tried turning it off and on?'", "My ticket is still open after 3 days"];
    await message.channel.send({ embeds: [success("😂", rand(memes))] });
  } },
  { name: "roast", description: "Roast a user (prefix). Usage: -*-prefix*-roast @user", async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    const roasts = ["You're like a broken ticket. Nonexistent.", "Your support skills leave a lot to be desired.", "You're the reason tickets have a spam filter."];
    await message.channel.send({ embeds: [warning("🔥", `${target}, ${rand(roasts)}`)] });
  } },
  { name: "hug", description: "Hug a user (prefix). Usage: -*-prefix*-hug @user", async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    await message.channel.send({ embeds: [success("🤗", `${message.author} hugged ${target}!`)] });
  } },
  { name: "slap", description: "Slap a user (prefix). Usage: -*-prefix*-slap @user", async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    await message.channel.send({ embeds: [warning("👋", `${message.author} slapped ${target}!`)] });
  } },
  { name: "slowmode", description: "Set slowmode (prefix). Usage: -*-prefix*-slowmode <seconds>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply({ embeds: [error("No permission", "Need Manage Channels.")] });
    const s = parseInt(args[0], 10);
    await message.channel.setRateLimitPerUser(s || 0);
    await message.channel.send({ embeds: [success("Slowmode", `Set to **${s || 0}s**.`)] });
  } },
  { name: "lockchannel", description: "Lock channel (prefix).", async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply({ embeds: [error("No permission", "Need Manage Channels.")] });
    await message.channel.permissionOverwrites.set([{ id: message.guild.id, deny: ["SendMessages"] }]);
    await message.channel.send({ embeds: [warning("Locked", "Channel locked.")] });
  } },
  { name: "unlockchannel", description: "Unlock channel (prefix).", async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply({ embeds: [error("No permission", "Need Manage Channels.")] });
    await message.channel.permissionOverwrites.set([{ id: message.guild.id, allow: ["SendMessages"] }]);
    await message.channel.send({ embeds: [success("Unlocked", "Channel unlocked.")] });
  } },
  { name: "ban", description: "Ban a user (prefix). Usage: -*-prefix*-ban @user", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply({ embeds: [error("No permission", "Need Ban Members.")] });
    const target = message.mentions.users.first();
    if (!target) return message.reply({ embeds: [error("Usage", "Mention a user.")] });
    await message.guild.members.ban(target.id);
    await message.channel.send({ embeds: [warning("Banned", `Banned **${target.tag}**.`)] });
  } },
  { name: "kick", description: "Kick a user (prefix). Usage: -*-prefix*-kick @user", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply({ embeds: [error("No permission", "Need Kick Members.")] });
    const target = message.mentions.users.first();
    if (!target) return message.reply({ embeds: [error("Usage", "Mention a user.")] });
    const member = message.guild.members.cache.get(target.id);
    await member.kick();
    await message.channel.send({ embeds: [warning("Kicked", `Kicked **${target.tag}**.`)] });
  } },
  { name: "timeout", description: "Timeout a user (prefix). Usage: -*-prefix*-timeout @user <minutes>", async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply({ embeds: [error("No permission", "Need Moderate Members.")] });
    const target = message.mentions.users.first();
    const mins = parseInt(args[1], 10);
    if (!target || !mins) return message.reply({ embeds: [error("Usage", "Mention user and minutes.")] });
    const member = message.guild.members.cache.get(target.id);
    await member.timeout(mins * 60000);
    await message.channel.send({ embeds: [success("Timeout", `Timed out **${target.tag}** for **${mins}** min.`)] });
  } },
];
