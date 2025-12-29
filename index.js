require('dotenv').config();

const { ActivityType, Client, GatewayIntentBits } = require('discord.js');
const { handleMessage } = require('./listeners/messageCreate');
const { loadEvents } = require('./structures/event');
const { join } = require('path');

const loadCommands = require('./structures/command');
const mongoose = require('mongoose');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

const activities = [
    { name: 'my dog', type: ActivityType.Watching },
    { name: 'over the server', type: ActivityType.Watching },
    { name: 'out for commands', type: ActivityType.Watching },
    { name: 'out for mod apps', type: ActivityType.Watching },
    { name: 'the sun', type: ActivityType.Watching },
    { name: 'Spotify', type: ActivityType.Listening },
    { name: 'Apple Music', type: ActivityType.Listening },
    { name: 'Playboi Carti', type: ActivityType.Listening },
    { name: 'Rod Wave', type: ActivityType.Listening },
    { name: 'Drake', type: ActivityType.Listening },
    { name: 'Roblox', type: ActivityType.Playing },
    { name: 'Minecraft', type: ActivityType.Playing },
    { name: 'Fortnite', type: ActivityType.Playing },
    { name: 'Football Manager 26', type: ActivityType.Playing },
    { name: 'football', type: ActivityType.Playing }
];

let currentIndex = 0;

setInterval(() => {
    const activity = activities[currentIndex];

    client.user.setActivity(activity.name, { type: activity.type });
    currentIndex = (currentIndex + 1) % activities.length;
}, 30000);

loadCommands(client);
loadEvents(join(__dirname, './listeners'), client);

mongoose.connect(process.env.DATABASE_URL, {
}).then(() => {
    console.log('Connected to database');
}).catch(err => {
    console.log(err);
});


client.on('messageCreate', async (message) => {
    await handleMessage(message, client);
});

client.on('ready', () => {
    console.log(`Loaded ${client.commands.size} command${client.commands.size > 1 ? 's' : ''}`);
    console.log('Connected to Discord');
});

client.login(process.env.CLIENT_TOKEN);