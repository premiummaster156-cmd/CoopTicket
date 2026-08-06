<div align="center">

# 🎫 CoopTicket

### The all-in-one Discord support ticket bot with **76 slash commands** + **46 prefix commands**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![Discord.js](https://img.shields.io/badge/discord.js-14-blueviolet.svg)](https://discord.js.org)
[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)](#)

</div>

CoopTicket is a powerful **support ticket system** for Discord. Let your members open tickets for support, bug reports, and billing — then manage them with claims, priorities, transcripts, and more. Includes a full utility & moderation suite and works as both **slash commands** and **prefix commands**.

---

## 📦 Features

- 🎫 **Ticket System** — create, close, reopen tickets
- 🖱️ **Button Panels** — click-to-open ticket panels
- 🏷️ **Categories** — support, bug reports, billing, custom
- 📋 **Transcriptions** — export ticket conversations
- 👥 **Staff Tools** — claim, unclaim, transfer, add/remove users
- 🚨 **Priorities** — low/medium/high ticket priority
- 🛠️ **Moderation** — ban, kick, timeout, clear, slowmode
- 🎛️ **Settings** — support role, category, log channel, max tickets
- 🎉 **Utility & Fun** — polls, announcements, memes, and more

---

## 🚀 Installation

### Prerequisites
- [Node.js](https://nodejs.org) **v18 or higher**
- A Discord application with a bot token ([Discord Developer Portal](https://discord.com/developers/applications))

### Step 1 — Create the bot on Discord

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**.
2. Name it `CoopTicket`.
3. Go to the **Bot** tab → click **Reset Token** → copy the token.
4. Enable the **Message Content Intent**.
5. Under **OAuth2 → URL Generator**: scopes `bot`, `applications.commands`; permissions **Administrator**.
6. Use the URL to invite the bot.

### Step 2 — Set up the project

```bash
git clone https://github.com/CoopFT/CoopTicket.git
cd CoopTicket
npm install
cp .env.example .env
```

### Step 3 — Configure `.env`

```env
TOKEN=YOUR_BOT_TOKEN_HERE
CLIENT_ID=YOUR_CLIENT_ID_HERE
DEV_GUILD_ID=
PREFIX=!
OWNER_IDS=
LOG_CHANNEL_ID=
SUPPORT_ROLE_ID=
TRANSCRIPT_CHANNEL_ID=
```

### Step 4 — Register commands & run

```bash
npm run register:guild   # or npm run deploy for global
npm start
```

You should see:
```
[OK] Loaded 76 slash commands.
[OK] Loaded 46 prefix commands.
[OK] Logged in as CoopTicket#1234
```

---

## 🎮 Quick Start

1. **Set a support role** (optional): `/setsupportrole @Support`
2. **Set a ticket category** (optional): `/setcategory #Tickets`
3. **Post a ticket panel:** `/setup #support`
4. Members click **🎫 Create Ticket** to open a ticket.
5. Staff manage tickets with `/claim`, `/close`, `/add`, `/transcript`, etc.

---

## 🎮 Command Reference

### Slash Commands (`/`)

#### 🎫 Ticket System
| Command | Description |
|---------|-------------|
| `/ticket [category]` | Create a ticket |
| `/close` | Close the current ticket |
| `/reopen` | Reopen a closed ticket |
| `/claim` | Claim the ticket |
| `/unclaim` | Unclaim the ticket |
| `/add @user` | Add a user to the ticket |
| `/remove @user` | Remove a user from the ticket |
| `/rename <name>` | Rename the ticket |
| `/transfer @user` | Transfer the ticket |
| `/priority <level>` | Set ticket priority |
| `/escalate` | Escalate to staff |
| `/note <text>` | Add an internal note |
| `/lock` / `/unlock` | Lock/unlock the ticket |
| `/transcript` | Export the ticket transcript |
| `/moveto <category>` | Move to another category |
| `/delete` | Force-delete the ticket |
| `/ticketinfo` | Ticket details |
| `/whois` | Who opened the ticket |
| `/settopic <topic>` | Set the ticket topic |
| `/ticketcount` | Your open tickets |
| `/openlist` | List open tickets |
| `/closedlist` | List closed tickets |
| `/ticketstats` | Guild ticket stats |

#### ⚙️ Settings (Admin)
| Command | Description |
|---------|-------------|
| `/setup <channel>` | Post ticket panel |
| `/panel <channel>` | Post multi-category panel |
| `/setcategory <category>` | Set ticket category |
| `/setsupportrole <role>` | Set support role |
| `/setmax <count>` | Max tickets per user |
| `/ticketlogs <channel>` | Set log channel |
| `/ticketsettings` | View settings |

#### 🛠️ Utility & Moderation
`/help` `/ping` `/botinfo` `/invite` `/serverinfo` `/userinfo` `/channelinfo` `/roleinfo` `/avatar` `/uptime` `/say` `/embed` `/poll` `/announce` `/clear` `/slowmode` `/nickname` `/timeout` `/ban` `/kick` `/unban` `/lock` `/unlock` `/createrole` `/deleterole` `/createtextchannel` `/deletetextchannel`

#### 🎉 Fun
`/coinflip` `/dice` `/joke` `/8ball` `/catfact` `/dogfact` `/rate` `/meme` `/roast` `/hug` `/slap` `/fortune` `/repeat` `/reverse` `/clap` `/mock` `/poll` `/emojisay`

**Total: 76 slash commands** ✨

---

### Prefix Commands (`!`)

`!ticket` `!close` `!add` `!remove` `!claim` `!unclaim` `!rename` `!ticketinfo` `!ticketstats` `!setup` `!setsupportrole` `!setcategory` `!transcript` `!help` `!ping` `!botinfo` `!invite` `!serverinfo` `!userinfo` `!avatar` `!uptime` `!clear` `!say` `!poll` `!announce` `!coinflip` `!dice` `!joke` `!8ball` `!rate` `!mock` `!reverse` `!clap` `!fortune` `!catfact` `!dogfact` `!meme` `!roast` `!hug` `!slap` `!slowmode` `!lockchannel` `!unlockchannel` `!ban` `!kick` `!timeout`

**Total: 46 prefix commands** 🤖

---

## 📘 Tutorial — How to Use CoopTicket

### 1. Setting Up

1. Invite the bot and grant **Administrator** permissions.
2. Set a support role: `/setsupportrole @Support`.
3. Post a ticket panel: `/setup #support`.
4. Members can now click **🎫 Create Ticket**.

### 2. Opening Tickets

- Click **🎫 Create Ticket** on the panel.
- Or use `/ticket` for a customizable category.
- Your own private ticket channel is created immediately.

### 3. Managing Tickets (Staff)

- **Claim** a ticket so everyone knows you're handling it.
- **Add** other staff or users to help.
- Set a **priority** if it's urgent.
- **Close** the ticket when resolved.

### 4. Transcripts & Logs

- Use `/transcript` to export the conversation.
- Set a log channel with `/ticketlogs` to keep records.

---

## 🗂️ Project Structure

```
CoopTicket/
├── index.js                 # Entry point
├── deploy-commands.js       # Registers slash commands
├── config.js                # Configuration
├── .env.example
├── commands/
│   ├── slash/               # 76 slash commands
│   │   ├── ticket/          # core + more
│   │   ├── utility/         # moderation & utility
│   │   └── fun/             # fun commands
│   └── prefix/              # 46 prefix commands
├── handlers/                # ready, interaction, message, ticket
├── utils/                   # store.js, embed.js, logger.js
└── package.json
```

---

## 📄 License

MIT License. Made with ❤️ by the CoopFT team. Find more bots on the [CoopFT Marketplace](https://coopft.com/marketplace).

</div>
</content>
