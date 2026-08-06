const fs = require("fs");
const path = require("path");
const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "store.json");
let memory = { settings: {}, tickets: {}, ticketCounters: {} };

function load() {
  try { if (fs.existsSync(FILE)) memory = { ...memory, ...JSON.parse(fs.readFileSync(FILE, "utf8")) }; } catch (err) {}
}
function save() {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(memory, null, 2)); } catch (err) {}
}
load();

module.exports = {
  getSettings(guildId) { return memory.settings[guildId] || {}; },
  setSetting(guildId, key, value) {
    if (!memory.settings[guildId]) memory.settings[guildId] = {};
    memory.settings[guildId][key] = value;
    save();
  },
  getTicket(guildId, channelId) {
    const list = memory.tickets[guildId] || [];
    return list.find((t) => t.channelId === channelId);
  },
  getTicketByUser(guildId, userId) {
    const list = memory.tickets[guildId] || [];
    return list.find((t) => t.userId === userId && t.status !== "closed");
  },
  createTicket(guildId, userId, channelId, category) {
    if (!memory.tickets[guildId]) memory.tickets[guildId] = [];
    if (!memory.ticketCounters[guildId]) memory.ticketCounters[guildId] = 0;
    memory.ticketCounters[guildId] += 1;
    const ticket = { id: memory.ticketCounters[guildId], userId, channelId, category, status: "open", createdAt: new Date().toISOString() };
    memory.tickets[guildId].push(ticket);
    save();
    return ticket;
  },
  closeTicket(guildId, channelId) {
    const list = memory.tickets[guildId] || [];
    const t = list.find((x) => x.channelId === channelId);
    if (t) { t.status = "closed"; t.closedAt = new Date().toISOString(); save(); }
    return t;
  },
getTicketList(guildId, status) {
    const list = memory.tickets[guildId] || [];
    return status ? list.filter((t) => t.status === status) : list;
  },
  getStats(guildId) {
    const list = memory.tickets[guildId] || [];
    return {
      total: list.length,
      open: list.filter((t) => t.status === "open").length,
      closed: list.filter((t) => t.status === "closed").length,
    };
  },
};
