const { SlashCommandBuilder, StringSelectMenuBuilder, PermissionsBitField, ButtonStyle, ButtonBuilder, EmbedBuilder, ActionRowBuilder } = require('discord.js');
var timeout = [];
const staffschema = require('../../Schemas.js/staffrole');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Cannot find what you were wishing to? Check this out!')
    .addSubcommand(command => command.setName('server').setDescription('Join our official support server for PixelVal!'))
    .addSubcommand(command => command.setName('manual').setDescription('Get some information on our bot commands and plans.'))
    .addSubcommand(command => command.setName('staff').setDescription('Pings online staff for you.')),
    async execute(interaction, client) {

        const sub = interaction.options.getSubcommand();

        switch (sub) {
            case 'server':

            const button = new ActionRowBuilder()
            .addComponents(
            new ButtonBuilder()
            .setLabel('Support Server')
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/CSYjWb7tzs")
            )
        

            const embedhelpserver = new EmbedBuilder()
            .setColor("Green")
            .setTitle('> Join our support server for \n> further help!')
            .setFooter({ text: `🧩 Support server`})
            .setTimestamp()
            .setAuthor({ name: `🧩 Support server Command`})
            .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081199958704791552/largegreen.png')
            .addFields({ name: `• Manual link to the Discord server:`, value: `> https://discord.gg/CSYjWb7tzs`})
        
            await interaction.reply({ embeds: [embedhelpserver], components: [button] })

            break;
            case 'manual':

            const helprow1 = new ActionRowBuilder()
            .addComponents(

            new StringSelectMenuBuilder()
            .setMinValues(1)
            .setMaxValues(1)
            .setCustomId('selecthelp')
            .setPlaceholder('• Select a menu')
            .addOptions(
                {
                    label: '• Help Center',
                    description: 'Navigate to the Help Center.',
                    value: 'helpcenter',
                },

                {
                    label: '• How to add the bot',
                    description: 'Displays how to add PixelVal to your amazing server.',
                    value: 'howtoaddbot'
                },

                {
                    label: '• Feedback',
                    description: 'Displays how to contribute to the devlopment of PixelVal by giving feedback.',
                    value: 'feedback'
                },

                {
                    label: '• Exclusive Functionality',
                    description: 'Displays information about our Exclusive Functionality program.',
                    value: 'exclusivefunctionality'
                },

                {
                    label: '• Commands Help',
                    description: 'Navigate to the Commands help page.',
                    value: 'commands',
                },
            ),
        );

        const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle('> Get Help')
        .setAuthor({ name: `🧩 Help Command`})
        .setFooter({ text: `🧩 Help command: Help Center`})
        .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081199958704791552/largegreen.png')
        .addFields({ name: `• Commands Help`, value: `> Get all **Commands** (**${client.commands.size}**) purposes.`})
        .addFields({ name: "• How to add Bot", value: "> Quick guide on how to add our **Bot** \n> to your server."})
        .addFields({ name: "• Feedback", value: "> How to send us feedback and suggestions."})
        .addFields({ name: "• Exclusive Functionality", value: "> Guide on how to receive permission to \n> use exclusive functionality."})
        .setTimestamp()

        await interaction.reply({ embeds: [embed], components: [helprow1] });

        break;
        case 'staff':
    
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && timeout.includes(interaction.member.id) && interaction.user.id !== '619944734776885276') return await interaction.reply({ content: 'You are on cooldown! You **cannot** execute /help staff.', ephemeral: true})
            
            const staffdata = await staffschema.findOne({ Guild: interaction.guild.id });

            if(!staffdata) {
                return await interaction.reply({ content: `This **feature** has not been **set up** in this server yet!`, ephemeral: true})
            } else {
                
                const staffembed = new EmbedBuilder()
                .setColor('Purple')
                .setTimestamp()
                .setTitle('• Staff team Pinged')
                .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081227919256457246/largepurple.png')
                .setAuthor({ name: `🛠 Help Staff system`})
                .setFooter({ text: `🛠 Staff Team pinged`})
                .setDescription('> You will be assisted shortly! \n> Sit tight.')

                const staffrole = staffdata.Role;
                const memberslist = await interaction.guild.roles.cache.get(staffrole).members.filter(member => member.presence.status !== 'offline').map(m => m.user).join('\n> ');

                if (!memberslist) {
                    return await interaction.reply({ content: `There are **no** staff available **at the moment**! Try again later..`, ephemeral: true})
                } else {

                    await interaction.reply({ content: `> ${memberslist}`, embeds: [staffembed]});

                    timeout.push(interaction.user.id);
                    setTimeout(() => {
                        timeout.shift();
                    }, 60000)

                }
            } 
        }
    }
}