const { SlashCommandBuilder } = require('discord.js');
const links = require('../../rickroll.json'); // here it gets a random rickroll link

module.exports = {
    data: new SlashCommandBuilder()
    .setName('rickroll')
    .setDescription('Generates a rickroll link, it is trolling time!'),
    async execute(interaction) {

        let randomizer = Math.floor(Math.random() * links.length); // here it randomizes it

        await interaction.reply({ content: `Here is your **rickroll link** 👀 \n> <${links[randomizer]}>`, ephemeral: true}) // here it sends it
    }
}