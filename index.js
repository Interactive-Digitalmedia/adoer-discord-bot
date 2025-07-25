require("dotenv").config();
const { Client, GatewayIntentBits, Routes, REST, SlashCommandBuilder } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const commands = [
  new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Submit your Adoer email for verification")
    .addStringOption(option =>
      option.setName("email")
        .setDescription("The email you used to sign up on Adoer")
        .setRequired(true)
    )
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

// Register slash command
client.once("ready", async () => {
  try {
    console.log(`🤖 Logged in as ${client.user.tag}`);

    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
      { body: commands }
    );

    console.log("✅ Slash command registered.");
  } catch (err) {
    console.error("Command registration failed:", err);
  }
});

// Slash command handler
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "verify") {
    const email = interaction.options.getString("email");

    await interaction.deferReply({ ephemeral: true }); // 👈 this fixes the timeout

    const admin = await client.users.fetch(process.env.ADMIN_USER_ID);
    const userTag = interaction.user.tag;

    const adminMessage = `📩 New Verification Request:\n👤 User: ${userTag} (${interaction.user.id})\n✉️ Email: ${email}`;

    try {
      await admin.send(adminMessage);
    } catch (err) {
      console.error("❌ Could not DM admin:", err);
    }

    await interaction.editReply({
      content: "✅ Thanks! We’ve received your email. We’ll verify and activate your trial shortly.",
    });
  }
});

client.login(process.env.DISCORD_TOKEN);