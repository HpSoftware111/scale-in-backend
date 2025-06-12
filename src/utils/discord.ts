import { DISCORD_APPLICATION_ID, DISCORD_BOT_TOKEN, DISCORD_SERVER_ID } from '@/config';
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Partials, Events, Collection } = require('discord.js');
// import { Client, GatewayIntentBits, Partials, Events, Collection } from 'discord.js';

const memberRoleId = '1233105360231989359';

const onReady = async client => {
  const guild = await client.guilds.fetch(DISCORD_SERVER_ID);
  const user = await guild.members.fetch('944981682602258533');

  // Change to run different cases
  console.log('user ==> ', user);
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  allowedMentions: { parse: ['users', 'roles'] },
});

client.commands = new Collection();

export const sendMessageToChannel = (username: string, channelName: string) => {
  const channel = client.channels.cache.find(channel => channel.name === channelName);
  channel.send(`Hi <@${username}> Congratulations`);
};

export const sendDMMessage = async (id: string, message: string) => {
  try {
    const guild = await client.guilds.fetch(DISCORD_SERVER_ID);
    const user = await guild.members.fetch(id);

    await user.send(message);
  } catch (error) {
    console.log('sendDMMessage error ==> ', error);
  }
};

export const addMemberRoleIdToUser = async (id: string) => {
  try {
    const guild = await client.guilds.fetch(DISCORD_SERVER_ID);
    const user = await guild.members.fetch(id);

    if (user.roles.cache.some(r => r.id === memberRoleId) == false) await user.roles.add(memberRoleId);
    console.log('Added Member Role Id');
  } catch (error) {
    console.log('error ==> ', error);
  }
};

export const removeMemberRoleIdToUser = async (id: string) => {
  try {
    const guild = await client.guilds.fetch(DISCORD_SERVER_ID);

    const user = await guild.members.fetch(id);

    // const user = await guild.members.fetch(id);
    console.log('user ==> ', user);
    if (user.roles.cache.some(r => r.id === memberRoleId) == true) await user.roles.remove(memberRoleId);

    console.log('Removed Member Role');
  } catch (error) {}

  // await addMemberRoleIdToUser(id);
};

export const addMemberToServer = async (id: string, access_token: string) => {
  const guild = await client.guilds.fetch(DISCORD_SERVER_ID);

  console.log('member id ==> ', id);

  // const user = await guild.members.fetch(id);
  // console.log('user ==> ', user);
  try {
    const user = await guild.members.add(id, { accessToken: access_token });

    // const user = await guild.members.fetch(id);
    console.log('user ==> ', user);
    await user.roles.add(memberRoleId);

    console.log('Added Member Role Id');
  } catch (error) {}

  // await addMemberRoleIdToUser(id);
};

export const initialzeDiscordBot = () => {
  const foldersPath = path.join(__dirname, '../discord', 'commands');
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }

  const eventsPath = path.join(__dirname, '../discord', 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  // Log in the bot with the token from the environment variables and handle potential login errors
  client.login(DISCORD_BOT_TOKEN)
  .then(() => console.log('[DISCORD] Bot logged in successfully'))
  .catch(err => {
    console.log(`[DISCORD] Error logging in: ${err}`);
  });

  // setTimeout(() => {
  //   onReady(client);
  // }, 6000);
};
