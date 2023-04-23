const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const staffschema = require('../../Schemas.js/staffrole');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('staff-role')
    .setDMPermission(false)
    .setDescription('Configure your help staff role.')
    .addSubcommand(command => command.setName('set').setDescription('Specified role will be pinged when doing /help staff.').addRoleOption(option => option.setName('staff-role').setDescription('Specified role will be your staff role.').setRequired(true)))
    .addSubcommand(command => command.setName('remove').setDescription('Disables the staff help system.')),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});

        const sub = interaction.options.getSubcommand();

        switch (sub) {
        
            case 'set':

            const staffdata = await staffschema.findOne({ Guild: interaction.guild.id });
            const staffrole = await interaction.options.getRole('staff-role');

            if (!staffdata) {

                staffschema.create({
                    Guild: interaction.guild.id,
                    Role: staffrole.id
                })

                const staffenable = new EmbedBuilder()
                .setColor('DarkRed')
                .setFooter({ text: `🛠 Help Staff set`})
                .setAuthor({ name: `🛠 Help Staff System`})
                .setTimestamp()
                .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
                .setTitle('> Staff Role set')
                .addFields({ name: `• Staff Role`, value: `> Your role (${staffrole}) has been **set** as your \n> staff helper role. They will \n> be pinged when a user needs help!`})

                await interaction.reply({ embeds: [staffenable]})

            } else {
                await interaction.reply({ content: `The **Helper Staff** system is already **enabled**. \n> Do **/staff-role remove** to undo.`, ephemeral: true})
            }

            break;
            case 'remove':

            const staffdata1 = await staffschema.findOne({ Guild: interaction.guild.id });

            if (!staffdata1) {
                return await interaction.reply({ content: `The **Helper Staff** system is already **disabled**, can't disable **nothing**..`, ephemeral: true});

            } else {

                await staffschema.deleteOne({ Guild: interaction.guild.id });
                await interaction.reply({ content: `Your **Helper Staff** system has been **disabled**!`, ephemeral: true});

            }
        }
    }
}