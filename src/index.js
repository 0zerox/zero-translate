import { Client, Collection, GatewayIntentBits, InteractionType } from "discord.js";
import { createConnection, Schema } from "mongoose";
import { readdirSync } from "fs";
import { join } from "path";

const client = (global.client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
}));

import onMessageCreate from "./onMessageCreate.js";

client.commands = new Collection();

client.db = createConnection(process.env.DB);

readdirSync(join(import.meta.dirname, './commands')).filter(x => x.endsWith('.js')).forEach(file => {
    let command = import(`./commands/${file}`);
    client.commands.set(command.name, command);
});

client.once("ready", ()=>{
    console.log(`Login as ${client.user.tag}`);
});

client.on("messageCreate", onMessageCreate);

client.on("interactionCreate", (interaction) => {
    if (interaction.type !== InteractionType.ApplicationCommand) return;
    if (client.commands.has(interaction.commandName)) {
        var command = client.commands.get(interaction.commandName);
        command.run(interaction);
    }
});

client.login(process.env.DISCORD_TOKEN);