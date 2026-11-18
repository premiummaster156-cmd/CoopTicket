# CoopTicket

**CoopTicket** is CoopFT's Discord support-ticket system with ticket panels, staff controls and transcript tools.

## Features

- Ticket panels and category-based ticket creation
- Support, bug-report, billing and custom ticket categories
- Claim, unclaim, transfer, priority and escalation workflows
- Add/remove participants, rename and move tickets
- Close/reopen controls and transcript export
- Ticket statistics, logs, settings and utility commands

## Requirements

- Node.js 22 or newer
- A Discord application and bot token
- The `bot` and `applications.commands` OAuth2 scopes

CoopTicket uses slash commands and Discord components. Message Content Intent is not required.

## Setup

```bash
npm install
cp .env.example .env
```

Configure the environment:

```env
TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_APPLICATION_ID
DEV_GUILD_ID=
OWNER_IDS=
LOG_CHANNEL_ID=
SUPPORT_ROLE_ID=
TRANSCRIPT_CHANNEL_ID=
DATABASE_URL=
```

## Register slash commands

For a test server, set `DEV_GUILD_ID` and run:

```bash
npm run check:commands
npm run register:guild
```

For global registration:

```bash
npm run deploy
```

Start the bot:

```bash
npm start
```

## Quick start

1. Configure the support role with `/setsupportrole`.
2. Choose the ticket category with `/setcategory`.
3. Publish the panel with `/setup` or `/panel`.
4. Members open tickets using the buttons on the panel.
5. Staff manage tickets with `/claim`, `/priority`, `/transfer`, `/close` and `/transcript`.

Use `/help` for the live command list.

## Project structure

- `commands/slash/` — ticket and utility command modules
- `handlers/ticket.js` — ticket creation, access and lifecycle logic
- `handlers/interaction.js` — slash and button interaction routing
- `utils/` — persistence, formatting and logging helpers
- `deploy-commands.js` — command schema validation and registration

## Notes

- Never commit your bot token or other secrets.
- Ensure the bot can create/manage channels, manage permissions, and read message history for transcript generation.
- Keep the bot role high enough to apply configured support permissions safely.
