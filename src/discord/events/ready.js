const { Events, Client } = require('discord.js');
const { guildId } = require('../config.json');

const onReady = async client => {
  const guild = await client.guilds.fetch(guildId);
  const user = await guild.members.fetch('944981682602258533');

  // Change to run different cases
  console.log('user ==> ', user);
};

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    // onReady(client);
  },
};
