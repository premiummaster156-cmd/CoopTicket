const { Client, GatewayIntentBits, Collection, Events, PermissionFlagsBits } = require("discord.js");
const config = require("./config");
const logger = require("./utils/logger");
const { loadSlashCommands, loadPrefixCommands } = require("./loaders");
const { handleInteraction } = require("./handlers/interaction");
const { handleMessage } = require("./handlers/message");
const { handleReady } = require("./handlers/ready");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.slashCommands = new Collection();
client.prefixCommands = new Collection();
client.prefixAliases = new Collection();

loadSlashCommands(client);
loadPrefixCommands(client);

client.once(Events.ClientReady, (c) => handleReady(client, c));
client.on(Events.InteractionCreate, (i) => handleInteraction(client, i));
client.on(Events.MessageCreate, (m) => handleMessage(client, m));

process.on("unhandledRejection", (err) => logger.error("Unhandled rejection:", err));
process.on("uncaughtException", (err) => logger.error("Uncaught exception:", err));

client.login(config.token).catch((err) => {
  logger.error("Failed to login. Check your TOKEN in .env", err);
  process.exit(1);
});
