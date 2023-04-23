const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Bulk deletes specified amount of messages.')
        .setDMPermission(false)
        .addStringOption(option => option.setName('amount').setDescription('Specified amount of messages will be bulk deleted.').setRequired(true))
        .addStringOption(option => option.setName('ignore-bots').setDescription(`Ignores bot messages if toggled on.`).addChoices(
            {name: "• True", value: "True"},
            {name: "• False", value: "False"}
        ).setRequired(true))
        .addUserOption(option => option.setName('user').setDescription(`Specified user's messages will be deleted.`)),

    async execute(interaction) {
        const amount = interaction.options.getString('amount');
        const user = interaction.options.getUser('user');
        const ignorebots = interaction.options.getString('ignore-bots');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});

        if (isNaN(amount) || parseInt(amount) < 1 || parseInt(amount) > 100) {
            return interaction.reply({ content: 'Please provide a valid number between **1** and **100**.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        let messages;
        if (user) {

            messages = await interaction.channel.messages.fetch({ limit: amount }).then(messages => messages.filter(m => m.author.id === user.id));

            if (ignorebots === 'True') {
                messages = await messages.filter(m => !m.author.bot);
            }

        } else {

            messages = await interaction.channel.messages.fetch({ limit: amount });

            if (ignorebots === 'True') {
                messages = await messages.filter(m => !m.author.bot);
            }

        }

        await interaction.channel.bulkDelete(messages, true);

        return interaction.followUp({ content: `Successfully deleted **${messages.size}** messages. Ignored bot messages: **${ignorebots}**.` });
    },
}; 