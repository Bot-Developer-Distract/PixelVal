const { Interaction } = require("discord.js");
const fetch = require('node-fetch');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client, err) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return
        
        try{
            await command.execute(interaction, client).catch(err);
        } catch (error) {
            console.log(error);

            try {

                await interaction.reply({
                    content: 'An **error** occured! Please contact **JASO0ON#2117** if this issue continues.', 
                    ephemeral: true
                }); 

            } catch (err) {
                return;
            }  
        } 
    },
};

