const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const voiceschema = require('../../Schemas.js/voicechannels');
const botschema = require('../../Schemas.js/botsvoicechannels');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('members-vc')
    .setDMPermission(false)
    .setDescription('Configure your members voice channel.')
    .addSubcommand(command => command.setName('total-set').setDescription('Sets your total members voice channel.').addChannelOption(option => option.setName('voice-channel').setDescription('Specified voice channel wll be your total members voice channel.').setRequired(true).addChannelTypes(ChannelType.GuildVoice)))
    .addSubcommand(command => command.setName('total-remove').setDescription('Removes your total members VC.'))
    .addSubcommand(command => command.setName('bot-set').setDescription('Sets your total bots voice channel.').addChannelOption(option => option.setName('voice-channel').setDescription('Specified voice channel wll be your total bots voice channel.').setRequired(true).addChannelTypes(ChannelType.GuildVoice)))
    .addSubcommand(command => command.setName('bot-remove').setDescription('Removes your total bots VC.')),
    async execute(interaction, err) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
        const sub = interaction.options.getSubcommand();

        switch (sub) {
            case 'total-set':

            const voicedata = await voiceschema.findOne({ Guild: interaction.guild.id });
            const voicechannel = interaction.options.getChannel('voice-channel');
            const voicetotalchannel = await interaction.guild.channels.cache.get(voicechannel.id);

            if (!voicedata) {

                await voiceschema.create({
                    Guild: interaction.guild.id,
                    TotalChannel: voicechannel.id
                })

                voicetotalchannel.setName(`• Total Members: ${interaction.guild.memberCount}`).catch(err);

                const voiceembed = new EmbedBuilder()
                .setColor('DarkBlue')
                .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081275127850864640/largeblue.png')
                .setAuthor({ name: `🔊 Member Voice Tool`})
                .setTimestamp()
                .setTitle('> Total Members channel has \n> been set up')
                .addFields({ name: `• Channel was Set Up`, value: `> Your channel (${voicechannel}) has been set \n> up to be your total members \n> voice channel! It will now display your \n> total members accordingly.`})
                .setFooter({ text: `🔊 Total Channel Set`})

                await interaction.reply({ embeds: [voiceembed]})

            } else {
                await interaction.reply({ content: `You have **already** set up a **total members** VC in this server!`, ephemeral: true})
            }

            break;
            case 'total-remove':

            const totalremovedata = await voiceschema.findOne({ Guild: interaction.guild.id });

            if (!totalremovedata) return await interaction.reply({ content: `You **have not** set up a **total members** VC yet, cannot delete **nothing**..`, ephemeral: true});
            else {

                const removechannel = await interaction.guild.channels.cache.get(totalremovedata.TotalChannel);

                if (!removechannel) {

                    await voiceschema.deleteMany({ Guild: interaction.guild.id });
                    await interaction.reply({ content: `Your **total member** VC seems to be corrupt or non existant, we **disabled** it regardless!`, ephemeral: true});

                } else {

                    await removechannel.delete().catch(err => {
                        voiceschema.deleteMany({ Guild: interaction.guild.id });
                        return interaction.reply({ content: `**Couldn't** delete your VC, but we **still** disabled your **total members** VC!`, ephemeral: true})
                    });

                    await voiceschema.deleteMany({ Guild: interaction.guild.id });
                    await interaction.reply({ content: `Your **total members** VC has been **successfuly** disabled!`, ephemeral: true});
                }
            }

            break;
            case 'bot-set':

            const botdata = await botschema.findOne({ Guild: interaction.guild.id });
            const botchannel = interaction.options.getChannel('voice-channel');
            const botguildchannel = await interaction.guild.channels.cache.get(botchannel.id);
            const botcount = interaction.guild.members.cache.filter(member => member.user.bot).size;

            if (!botdata) {

                await botschema.create({
                    Guild: interaction.guild.id,
                    BotChannel: botchannel.id
                })

                botguildchannel.setName(`• Total Bots: ${botcount}`).catch(err);

                const botembed = new EmbedBuilder()
                .setColor('DarkBlue')
                .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081275127850864640/largeblue.png')
                .setAuthor({ name: `🔊 Member Voice Tool`})
                .setTimestamp()
                .setTitle('> Total Members channel has \n> been set up')
                .addFields({ name: `• Channel was Set Up`, value: `> Your channel (${botguildchannel}) has been set \n> up to be your total members \n> voice channel! It will now display your \n> total members accordingly.`})
                .setFooter({ text: `🔊 Total Channel Set`})

                await interaction.reply({ embeds: [botembed]})

            } else {
                await interaction.reply({ content: `You have **already** set up a **total bots** VC in this server!`, ephemeral: true})
            }

            break;
            case 'bot-remove':

            const totalbotdata = await botschema.findOne({ Guild: interaction.guild.id });

            if (!totalbotdata) return await interaction.reply({ content: `You **have not** set up a **total bots** VC yet, cannot delete **nothing**..`, ephemeral: true});
            else {

                const removebotchannel = await interaction.guild.channels.cache.get(totalbotdata.BotChannel);

                if (!removebotchannel) {

                    await botschema.deleteMany({ Guild: interaction.guild.id });
                    await interaction.reply({ content: `Your **total bots** VC seems to be corrupt or non existant, we **disabled** it regardless!`, ephemeral: true});

                } else {

                    await removebotchannel.delete().catch(err => {
                        botschema.deleteMany({ Guild: interaction.guild.id });
                        return interaction.reply({ content: `**Couldn't** delete your VC, but we **still** disabled your **total bots** VC!`, ephemeral: true})
                    });

                    await botschema.deleteMany({ Guild: interaction.guild.id });
                    await interaction.reply({ content: `Your **total bots** VC has been **successfuly** disabled!`, ephemeral: true});
                }
            }
        }

    }

}