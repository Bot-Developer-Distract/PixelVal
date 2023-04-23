const { SlashCommandBuilder, PermissionsBitField, ChannelType, EmbedBuilder } = require('discord.js');
const starschema = require('../../Schemas.js/starboard');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('starboard')
    .setDescription('Configure your starboard system.')
    .setDMPermission(false)
    .addSubcommand(command => command.setName('setup').setDescription('Sets up your starboard for you.').addChannelOption(option => option.setName('channel').setDescription('Specified channel will be your starboard channel.').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true)).addIntegerOption(option => option.setName('reaction-count').setDescription('Specify the amount of reactions needed for a message to be posted.').setMinValue(1).setMaxValue(10)))
    .addSubcommand(command => command.setName('block-message').setDescription('Block a message from ever being sent to the starboard.').addStringOption(option => option.setName('message-id').setDescription('Specified message will never be sent to the starboard channel.').setMinLength(1).setMaxLength(50).setRequired(true)))
    .addSubcommand(command => command.setName('block-user').setDescription('Block a user from ever sending messages to the starboard.').addUserOption(option => option.setName('user').setDescription(`Specified user's messages will never be pushed to the starboard channel.`).setRequired(true)))
    .addSubcommand(command => command.setName('unblock-user').setDescription('Unblock a user from ever sending messages to the starboard.').addUserOption(option => option.setName('user').setDescription(`Specified user's messages will never be pushed to the starboard channel.`).setRequired(true)))
    .addSubcommand(command => command.setName('disable').setDescription('Disables your starboard system.')),
    async execute(interaction) {

        const stardata = await starschema.findOne({ Guild: interaction.guild.id });
        const sub = interaction.options.getSubcommand();

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});

        switch (sub) {
            case 'setup':

            if (stardata) return await interaction.reply({ content: `You **already** have a **starboard** system **set up**! \n> Do **/starboard disable** to undo.`, ephemeral: true});
            else {

                const starchannel = interaction.options.getChannel('channel');
                const count = interaction.options.getInteger('reaction-count') || 3;

                const setupembed = new EmbedBuilder()
                .setColor('DarkRed')
                .setAuthor({ name: `⭐ Starboard System`})
                .setTitle('> Starboard Set up')
                .setFooter({ text: `⭐ Starboard Was Set up`})
                .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
                .setTimestamp()
                .addFields({ name: `• Starboard is set up`, value: `> Your channel (${starchannel}) was set up \n> as your starboard channel. Messages \n> with over **${count}** star reactions \n> will be sent here.`})

                await starschema.create({
                    Guild: interaction.guild.id,
                    Count: count,
                    Channel: starchannel.id,
                    SentMessages: [ ],
                    BanUser: [ ]
                })

                await interaction.reply({ embeds: [setupembed] });
            }

            break;
            case 'disable':

            if (!stardata) return await interaction.reply({ content: `You **do not** have a **starboard** system **set up**! \n> Do **/starboard setup** to set one up.`, ephemeral: true});
            else {

                const disableembed = new EmbedBuilder()
                .setColor('DarkRed')
                .setAuthor({ name: `⭐ Starboard System`})
                .setTitle('> Starboard was Disabled')
                .setFooter({ text: `⭐ Starboard Disabled`})
                .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
                .setTimestamp()
                .addFields({ name: `• Starboard was Disabled`, value: `> Your channel (<#${stardata.Channel}>) is no longer \n> your starboard channel. Messages \n> with over **${stardata.Count}** star reactions \n> will no longer be sent there.`})

                await starschema.deleteMany({ Guild: interaction.guild.id })

                await interaction.reply({ embeds: [disableembed] });
            }

            break;
            case 'block-message':

            const message = interaction.options.getString('message-id');

            if (stardata.SentMessages.includes(message)) return await interaction.reply({ content: `The **message** ID "**${message}**" has **already** been blocked.`, ephemeral: true});
            else {
                await starschema.updateOne({ Guild: interaction.guild.id }, { $push: { SentMessages: message }});
                await interaction.reply({ content: `The **message** ID "**${message}**" has been blocked **successfully**!`, ephemeral: true});
            }

            break;
            case 'block-user':

            const user = interaction.options.getUser('user');

            if (!stardata) return await interaction.reply({ content: `You **do not** have a **starboard** system **set up**! \n> Do **/starboard setup** to set one up.`, ephemeral: true});

            if (stardata.BanUser.includes(user.id)) return await interaction.reply({ content: `The **user** ${user} has **already** been blocked.`, ephemeral: true});
            else {
                await starschema.updateOne({ Guild: interaction.guild.id }, { $push: { BanUser: user.id }});
                await interaction.reply({ content: `The **user** ${user} has been blocked **successfully**!`, ephemeral: true})
            }

            break;
            case 'unblock-user':

            const user1 = interaction.options.getUser('user');

            if (!stardata) return await interaction.reply({ content: `You **do not** have a **starboard** system **set up**! \n> Do **/starboard setup** to set one up.`, ephemeral: true});

            if (!stardata.BanUser.includes(user1.id)) return await interaction.reply({ content: `The **user** ${user1} has **not** been blocked, cannot unblock **nothing**..`, ephemeral: true});
            else {
                await starschema.updateOne({ Guild: interaction.guild.id }, { $pull: { BanUser: user1.id }});
                await interaction.reply({ content: `The **user** ${user1} has been blocked **successfully**!`, ephemeral: true})
            }

        }
    }
}