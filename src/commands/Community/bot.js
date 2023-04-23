const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { performance } = require('perf_hooks');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('bot')
    .setDescription(`Shows PixelVal's information.`)
    .addSubcommand(command => command.setName('stats').setDescription('Shows some basic statistics about PixelVal.'))
    .addSubcommand(command => command.setName('ping').setDescription(`Displays the bot's ping... Pong.. PANG!!`)),
    async execute(interaction, client) {

        const sub = interaction.options.getSubcommand();

        switch (sub) {

        case 'stats':

        let servercount = await client.guilds.cache.reduce((a,b) => a+b.memberCount, 0);

        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

        let uptime = `**${days}**d **${hours}**h **${minutes}**m **${seconds}**s`;

        const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel('Support Server')
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/CSYjWb7tzs"),

            new ButtonBuilder()
            .setLabel('Bot Invite')
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.com/api/oauth2/authorize?client_id=1076798263098880116&permissions=137439292488&scope=bot%20applications.commands")
        )

        const embed = new EmbedBuilder()
        .setColor("Purple")
        .setTitle(`> Bot's Statistics`)
        .setAuthor({ name: '🤖 Bot Statistics Tool'})
        .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081227919256457246/largepurple.png')
        .setFooter({ text: `🤖 PixelVal's statistics`})
        .setTimestamp()
        .addFields({ name: '• Servers Count', value: `> ${client.guilds.cache.size}`, inline: true})
        .addFields({ name: '• Members Count', value: `> ${servercount}`, inline: true})
        .addFields({ name: '• Latency', value: `> ${Math.round(client.ws.ping)}ms`, inline: false})
        .addFields({ name: '• Uptime', value: `> ${uptime}`, inline: false})

        await interaction.reply({ embeds: [embed], components: [button] })

        break;
        case 'ping':

        const embedping = new EmbedBuilder()
        .setColor("DarkBlue")
        .setTitle('Connection between PixelVal \nand your client')
        .setDescription( `> Pong: ${Math.round(client.ws.ping)}ms`)
        .setFooter({ text: `🏓 Ping recorded`})
        .setTimestamp()
        .setAuthor({ name: `🏓 Ping Command`})
        .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081275127850864640/largeblue.png')

        await interaction.reply({ embeds: [embedping] })

    }
    }
}
