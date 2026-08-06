const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require("../../../config");
const { success, error, info, warning } = require("../../../utils/embed");

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

module.exports = [
  { category: "fun", data: new SlashCommandBuilder().setName("coinflip").setDescription("Flip a coin."), async execute(interaction) {
    await interaction.reply({ embeds: [info("🪙", `You got **${Math.random() < 0.5 ? "Heads" : "Tails"}**!`)] });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("dice").setDescription("Roll a die."), async execute(interaction) {
    await interaction.reply({ embeds: [info("🎲", `You rolled a **${Math.floor(Math.random() * 6) + 1}**!`)] });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("joke").setDescription("Get a joke."), async execute(interaction) {
    const jokes = ["Why don't scientists trust atoms? Because they make up everything!", "Why did the ticket go to therapy? It had too many issues.", "I told my computer I needed a break. It hasn't spoken to me since."];
    await interaction.reply({ embeds: [success("😂", rand(jokes))] });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("8ball").setDescription("Ask the 8-ball.").addStringOption((o) => o.setName("question").setDescription("Your question").setRequired(true)), async execute(interaction) {
    const answers = ["Yes!", "No.", "Maybe.", "Ask again later.", "Definitely not.", "Signs point to yes."];
    await interaction.reply({ embeds: [info("🎱", `**Q:** ${interaction.options.getString("question")}\n**A:** ${rand(answers)}`)] });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("catfact").setDescription("Get a cat fact."), async execute(interaction) {
    const facts = ["Cats sleep 70% of their lives.", "A group of cats is called a clowder.", "Cats can rotate their ears 180 degrees."];
    await interaction.reply({ embeds: [info("🐱", rand(facts))] });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("dogfact").setDescription("Get a dog fact."), async execute(interaction) {
    const facts = ["A dog's nose print is unique.", "Dogs can smell 1000x better than humans.", "Dogs dream like humans do."];
    await interaction.reply({ embeds: [info("🐶", rand(facts))] });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("rate").setDescription("Rate something.").addStringOption((o) => o.setName("thing").setDescription("Thing to rate").setRequired(true)), async execute(interaction) {
    await interaction.reply({ embeds: [info("⭐", `**${interaction.options.getString("thing")}** is **${Math.floor(Math.random() * 11)}/10**.`)] });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("meme").setDescription("Get a meme."), async execute(interaction) {
    const memes = ["When the ticket closes itself", "Support: 'Have you tried turning it off and on?'", "My ticket is still open after 3 days"];
    await interaction.reply({ embeds: [success("😂", rand(memes))] });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("roast").setDescription("Roast a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)), async execute(interaction) {
    const roasts = ["You're like a broken ticket. Nonexistent.", "Your support skills leave a lot to be desired.", "You're the reason tickets have a spam filter."];
    await interaction.reply({ embeds: [warning("🔥", `${interaction.options.getUser("user")}, ${rand(roasts)}`)] });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("hug").setDescription("Hug a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)), async execute(interaction) {
    await interaction.reply({ embeds: [success("🤗", `${interaction.user} hugged ${interaction.options.getUser("user")}!`)] });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("slap").setDescription("Slap a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)), async execute(interaction) {
    await interaction.reply({ embeds: [warning("👋", `${interaction.user} slapped ${interaction.options.getUser("user")}!`)] });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("fortune").setDescription("Get your fortune."), async execute(interaction) {
    const fortunes = ["Your ticket will be resolved soon.", "A great opportunity awaits you.", "Help is on the way.", "Patience is a virtue."];
    await interaction.reply({ embeds: [info("🔮", rand(fortunes))] });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("repeat").setDescription("Repeat a message.").addStringOption((o) => o.setName("text").setDescription("Text").setRequired(true)), async execute(interaction) {
    await interaction.reply({ content: interaction.options.getString("text") });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("reverse").setDescription("Reverse a message.").addStringOption((o) => o.setName("text").setDescription("Text").setRequired(true)), async execute(interaction) {
    await interaction.reply({ embeds: [info("↩️", interaction.options.getString("text").split("").reverse().join(""))] });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("clap").setDescription("Clap between words.").addStringOption((o) => o.setName("text").setDescription("Text").setRequired(true)), async execute(interaction) {
    await interaction.reply({ content: interaction.options.getString("text").split(" ").join(" 👏 ") });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("mock").setDescription("Mock a message.").addStringOption((o) => o.setName("text").setDescription("Text").setRequired(true)), async execute(interaction) {
    const text = interaction.options.getString("text").split("").map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join("");
    await interaction.reply({ embeds: [info("😏", text)] });
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("poll").setDescription("Create a poll with reactions.").addStringOption((o) => o.setName("question").setDescription("Question").setRequired(true)), async execute(interaction) {
    const msg = await interaction.reply({ embeds: [info("📊 Poll", interaction.options.getString("question"))], fetchReply: true });
    for (const emoji of ["👍", "👎", "🤷"]) await msg.react(emoji);
  } },
  { category: "fun", data: new SlashCommandBuilder().setName("emojisay").setDescription("Say something in emojis.").addStringOption((o) => o.setName("text").setDescription("Text").setRequired(true)), async execute(interaction) {
    const map = { a: "🅰️", b: "🅱️", c: "©️", d: "🇩", e: "🇪", f: "🇫", g: "🇬", h: "🇭", i: "🇮", j: "🇯", k: "🇰", l: "🇱", m: "🇲", n: "🇳", o: "🅾️", p: "🇵", q: "🇶", r: "🇷", s: "🇸", t: "🇹", u: "🇺", v: "🇻", w: "🇼", x: "🇽", y: "🇾", z: "🇿" };
    const text = interaction.options.getString("text").toLowerCase().split("").map((c) => map[c] || c).join(" ");
    await interaction.reply({ content: text });
  } },
];
