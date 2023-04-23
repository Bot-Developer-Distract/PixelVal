const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const phoneschema = require('../../Schemas.js/phoneschema');
const ownerbans = require('../../Schemas.js/phoneownerbans');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('phone')
    .setDescription('Config your phoning system.')
    .setDMPermission(false)
    .addSubcommand(command => command.setName('setup').setDescription('Sets up the phoning system for you.').addChannelOption(option => option.setName('channel').setDescription('Specified channel will be your phoning channel.').setRequired(true).addChannelTypes(ChannelType.GuildText)))
    .addSubcommand(command => command.setName('disable').setDescription('Disables the phoning system for your server.'))
    .addSubcommand(command => command.setName('ban').setDescription('Bans a user from sending messages to other servers.').addUserOption(option => option.setName('user').setDescription('Specified user will be banned from using your phoning system.').setRequired(true)))
    .addSubcommand(command => command.setName('unban').setDescription('Unban a user from sending messages to other servers.').addUserOption(option => option.setName('user').setDescription('Specified user will be unbanned from using your phoning system.').setRequired(true)))
    .addSubcommand(command => command.setName('owner-ban').setDescription('Bans all guilds owned by the specified from using the phone system. Dev only.').addStringOption(option => option.setName('owner-id').setDescription(`Specified owner's servers will be banned from using your phoning system.`).setRequired(true)))
    .addSubcommand(command => command.setName('owner-unban').setDescription('Unbans all guilds owned by the specified from using the phone system. Dev only.').addStringOption(option => option.setName('owner-id').setDescription(`Specified owner's servers will be unbanned from using your phoning system.`).setRequired(true))),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});

        const sub = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('channel');
        const data = await phoneschema.findOne({ Guild: interaction.guild.id });
        const user = interaction.options.getUser('user');
        const ownerdata = await ownerbans.findOne({ Pass: `password` });
        const owneruser = interaction.options.getString('owner-id');

        switch (sub) {

            case 'setup':

            if (data) return await interaction.reply({ content: `You **already** have a phoning system set up in this server!`, ephemeral: true})
            else {

                phoneschema.create({
                    Guild: interaction.guild.id,
                    Channel: channel.id,
                    Setup: 'defined',
                    Bans: [ ]
                })

                const embed = new EmbedBuilder()
                .setColor('DarkBlue')
                .setTimestamp()
                .setTitle('> Phone Setup')
                .setAuthor({ name: `📞 Phone System`})
                .setFooter({ text: `📞 Phoning was Setup`})
                .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081275127850864640/largeblue.png')
                .addFields({ name: `• System Setup`, value: `> Your channel (${channel}) was set up to be \n> your phoning channel!`})

                await interaction.reply({ embeds: [embed]})
                channel.send('This channel has been **set up** to be a **phoning** channel!').catch(err => {
                    return;
                })
            }

            break;

            case 'disable':

            if (!data) return await interaction.reply({ content: `No **phoning system** found, cannot delete nothing..`, ephemeral: true})
            else {

                await phoneschema.deleteMany({ Guild: interaction.guild.id});

                await interaction.reply({ content: `Your **phoning system** has been disabled!`, ephemeral: true})

            }

            break;

            case 'ban':

            if(!data) return await interaction.reply({ content: `No **phoning system** found, cannot ban ${user} from nothing..`, ephemeral: true})
            else {

                if (interaction.user.id === user.id) return interaction.reply({ content: `You **cannot** use the ban hammer on you, silly goose..`, ephemeral: true})

                if (data.Bans.includes(`${user.id}`)) return await interaction.reply({ content: `${user} is **already** banned from using the **phone system**!`, ephemeral: true});
                await phoneschema.updateOne({ Guild: interaction.guild.id }, { $push: { Bans: `${user.id}`}});
                await interaction.reply({ content: `${user} has been added to the **phone ban** list!`, ephemeral: true})
            }

            break;

            case 'unban':

            if(!data) return await interaction.reply({ content: `No **phoning system** found, cannot unban ${user} from nothing..`, ephemeral: true})
            else {

                if (!data.Bans.includes(`${user.id}`)) return await interaction.reply({ content: `${user} is **not** banned from using your **phoning system**!`, ephemeral: true});
                await phoneschema.updateOne({ Guild: interaction.guild.id }, { $pull: { Bans: `${user.id}`}});
                await interaction.reply({ content: `${user} has been **unbanned** from using the **phone system**!`, ephemeral: true})
            }

            break;

            case 'owner-ban':

            if (interaction.user.id !== '619944734776885276') return await interaction.reply({ content: `Only **JASO0ON#2117** can use this! If you want to make a **owner ban** request do **/feedback** or **/suggestion** to send us a request!`, ephemeral: true});
            
            if (!ownerdata) {
                ownerbans.create({
                    Pass: 'password',
                    User: `${owneruser}`
                })
            } else {

                if (ownerdata.User.includes(owneruser)) return await interaction.reply({ content: `That **user's** servers are **already** banned!`, ephemeral: true})
                await ownerbans.updateOne({ Pass: 'password' }, { $push: { User: `${owneruser}`}});
                await interaction.reply({ content: `<@${owneruser}>'s servers have been **banned** from using the **phone system**!`, ephemeral: true})

            }

            break;

            case 'owner-unban':

            if (!ownerdata || !ownerdata.User.includes(owneruser)) return await interaction.reply({ content: `That **user's** servers are **not** banned, cannot ban **nothing**..`, ephemeral: true});
            else {

                await ownerbans.updateOne({ Pass: 'password' }, { $pull: { User: `${owneruser}`}});
                await interaction.reply({ content: `<@${owneruser}>'s servers have been **unbanned** from using the **phone system**!`, ephemeral: true});
                
            }
        }
    }
}