const { Client, GatewayIntentBits, ModalBuilder, Partials, ActivityType, AttachmentBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ChannelType, Events, MessageType, UserFlagsBitField, InteractionResponse, ReactionUserManager } = require(`discord.js`);
const fs = require('fs');
const GiveawaysManager = require("./utils/giveaway");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping], partials: [Partials.Channel, Partials.Reaction, Partials.Message] }); 

client.on("ready", async (client) => {
 
    setInterval(() => {

        let activities = [
            { type: 'Playing', name: 'in the darkness.'},
            { type: 'Playing', name: '/help manual.'},
            { type: 'Playing', name: 'with my features.'},
            { type: 'Watching', name: 'JASO0ON!'},
            { type: 'Watching', name: `${client.guilds.cache.size} servers!`},
            { type: 'Watching', name: `${client.guilds.cache.reduce((a,b) => a+b.memberCount, 0)} members!`},
            { type: 'Playing', name: `with my ${client.commands.size} commands.`}
        ];

        const status = activities[Math.floor(Math.random() * activities.length)];

        if (status.type === 'Watching') {
            client.user.setPresence({ activities: [{ name: `${status.name}`, type: ActivityType.Watching }]});
        } else {
            client.user.setPresence({ activities: [{ name: `${status.name}`, type: ActivityType.Playing }]});
        }
        
    }, 5000);
})

const axios = require('axios');
const fetch = require("node-fetch");
const warningSchema = require('./Schemas.js/warn');
const { CaptchaGenerator } = require('captcha-canvas');
const voiceschema = require('./Schemas.js/voicechannels');
const welcomeschema = require('./Schemas.js/welcome');
const botschema = require('./Schemas.js/botsvoicechannels');
const roleschema = require('./Schemas.js/autorole');
const pingschema = require('./Schemas.js/joinping');
const starschema = require('./Schemas.js/starboard');
const starmessageschema = require('./Schemas.js/starmessages');
const capschema = require('./Schemas.js/verify');
const verifyusers = require('./Schemas.js/verifyusers');
const joinschema = require('./Schemas.js/jointocreate');
const joinchannelschema = require('./Schemas.js/jointocreatechannels');
const reactschema = require('./Schemas.js/reactionroles');

client.commands = new Collection();

require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

// HANDLE ALL ERRORS!! //

const process = require('node:process');

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Giveaway Manager //

client.giveawayManager = new GiveawaysManager(client, {
    default: {
      botsCanWin: false,
      embedColor: "#a200ff",
      embedColorEnd: "#550485",
      reaction: "🎉",
    },
});

// Commands //

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token)
})();

// Counting System //

client.on(Events.MessageCreate, async message => {

    const countschema = require('./Schemas.js/counting');
    if (message.guild === null) return;
    const countdata = await countschema.findOne({ Guild: message.guild.id });
    let reaction = "";

    if (!countdata) return;

    let countchannel = client.channels.cache.get(countdata.Channel);

    if (message.author.bot) return;
    if (message.channel.id !== countchannel.id) return;

    if (countdata.Count > 98) {
        reaction = '✔️'
    } else if (countdata.Count > 48) {
        reaction = '☑️'
    } else {
        reaction = '✅'
    }
    
    if (message.author.id === countdata.LastUser) {

        message.reply({ content: `You **cannot** count alone! You **messed up** the counter at **${countdata.Count}**! Back to **0**.`});
        countdata.Count = 0;
        countdata.LastUser = ' ';

        try {
            message.react('❌')
        } catch (err) {
        
        }

    } else {

        if (message.content - 1 < countdata.Count && countdata.Count === 0 && message.author.id !== countdata.LastUser) {

            message.reply({ content: `The **counter** is at **0** by default!`})
            message.react('⚠')
    
        } else if (message.content - 1 < countdata.Count || message.content === countdata.Count || message.content > countdata.Count + 1 && message.author.id !== countdata.LastUser) {
            message.reply({ content: `You **messed up** the counter at **${countdata.Count}**! Back to **0**.`})
            countdata.Count = 0;

            try {
                message.react('❌')
            } catch (err) {
                
            }
    
        } else if (message.content - 1 === countdata.Count && message.author.id !== countdata.LastUser) {
                
            countdata.Count += 1;

            try {
                message.react(`${reaction}`)
            } catch (err) {
                
            }
    
            countdata.LastUser = message.author.id;
        }

    }
    
    countdata.save();
})

// Leave Message //

client.on(Events.GuildMemberRemove, async (member, err) => {

    const leavedata = await welcomeschema.findOne({ Guild: member.guild.id });

    if (!leavedata) return;
    else {

        const channelID = leavedata.Channel;
        const channelwelcome = member.guild.channels.cache.get(channelID);

        const embedleave = new EmbedBuilder()
        .setColor("DarkBlue")
        .setTitle(`${member.user.username} has left`)
        .setDescription( `> ${member} has left the Server`)
        .setFooter({ text: `👋 Cast your goobyes`})
        .setTimestamp()
        .setAuthor({ name: `👋 Member Left`})
        .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081275127850864640/largeblue.png')

        const welmsg = await channelwelcome.send({ embeds: [embedleave]}).catch(err);
        welmsg.react('👋');
    }
})

// Welcome Message //

client.on(Events.GuildMemberAdd, async (member, err) => {

    const welcomedata = await welcomeschema.findOne({ Guild: member.guild.id });

    if (!welcomedata) return;
    else {

        const channelID = welcomedata.Channel;
        const channelwelcome = member.guild.channels.cache.get(channelID)
        const roledata = await roleschema.findOne({ Guild: member.guild.id });

        if (roledata) {
            const giverole = await member.guild.roles.cache.get(roledata.Role)

            member.roles.add(giverole).catch(err => {
                console.log('Error received trying to give an auto role!');
            })
        }
        
        const embedwelcome = new EmbedBuilder()
         .setColor("DarkBlue")
         .setTitle(`${member.user.username} has arrived \n to the Server!`)
         .setDescription( `> Welcome ${member} to the Server!`)
         .setFooter({ text: `👋 Get cozy and enjoy :)`})
         .setTimestamp()
         .setAuthor({ name: `👋 Welcome to the Server!`})
         .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081275127850864640/largeblue.png')
    
        const embedwelcomedm = new EmbedBuilder()
         .setColor("DarkBlue")
         .setTitle('Welcome Message')
         .setDescription( `> Welcome to ${member.guild.name}!`)
         .setFooter({ text: `👋 Get cozy and enjoy :)`})
         .setTimestamp()
         .setAuthor({ name: `👋 Welcome to the Server!`})
         .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081275127850864640/largeblue.png')
    
        const levmsg = await channelwelcome.send({ embeds: [embedwelcome]});
        levmsg.react('👋');
        member.send({ embeds: [embedwelcomedm]}).catch(err => console.log(`Welcome DM error: ${err}`))
    
    } 
})

// Status //

client.on("ready", () => {
    console.log('Bot is online.');

    client.user.setStatus("idle");

})

// Sticky Message Code //

const stickyschema = require('./Schemas.js/sticky');
const sticky = require('./commands/Moderation/sticky');

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    stickyschema.findOne({ ChannelID: message.channel.id}, async (err, data) => {
        if (err) throw err;

        if (!data) {
            return;
        }

        let stickychannel = data.ChannelID;
        let cachedChannel = client.channels.cache.get(stickychannel);
        
        const embed = new EmbedBuilder()
        .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081275127850864640/largeblue.png')
        .setTitle('> Sticky Note')
        .setAuthor({ name: '📝 Sticky Message Tool'})
        .setFooter({ text: '📝 Sticky Message Created'})
        .addFields({ name: '• Sticky Content', value: `> ${data.Message}`})
        .setColor("DarkBlue")
        .setTimestamp()

        if (message.channel.id == (stickychannel)) {

            data.CurrentCount += 1;
            data.save();

            if (data.CurrentCount > data.MaxCount) {
                try {
                    await client.channels.cache.get(stickychannel).messages.fetch(data.LastMessageID).then(async(m) => {
                        await m.delete();
                    })

                    let newMessage = await cachedChannel.send({ embeds: [embed]})

                    data.LastMessageID = newMessage.id;
                    data.CurrentCount = 0;
                    data.save();
                } catch {
                    return;
                }
            }
        }
    })
})

// Anti-Link System Code //

const linkSchema = require('./Schemas.js/link');

client.on(Events.MessageCreate, async (message) => {

    if (message.guild === null) return;
     
    if (message.content.startsWith('http') || message.content.startsWith('discord.gg') || message.content.includes('https://') || message.content.includes('http://') || message.content.includes('discord.gg/') || message.content.includes('www.') || message.content.includes('.net') || message.content.includes('.com')) {

        const Data = await linkSchema.findOne({ Guild: message.guild.id });

        if (!Data) return;

        const memberPerms = Data.Perms;

        const user = message.author;
        const member = message.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
        .setColor("DarkRed")
        .setAuthor({ name: '🔗 Anti-link system'})
        .setTitle('Message removed')
        .setFooter({ text: '🔗 Anti-link detected a link'})
        .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
        .setDescription(`> ${message.author}, links are **disabled** in **${message.guild.name}**.`)
        .setTimestamp()

        if (member.permissions.has(memberPerms)) return;
        else {
            await message.channel.send({ embeds: [embed] }).then (msg => {
                setTimeout(() => msg.delete(), 5000)
            })

            ;(await message).delete();

            warningSchema.findOne({ GuildID: message.guild.id, UserID: message.author.id, UserTag: message.author.tag }, async (err, data) => {

                if (err) throw err;
    
                if (!data) {
                    data = new warningSchema({
                        GuildID: message.guild.id,
                        UserID: message.author.id,
                        UserTag: message.author.tag,
                        Content: [
                            {
                                ExecuterId: '1076798263098880116',
                                ExecuterTag: 'PixelVal#8842',
                                Reason: 'Use of forbidden links'
                            }
                        ],
                    });
     
                } else {
                    const warnContent = {
                        ExecuterId: '1076798263098880116',
                        ExecuterTag: 'PixelVal#8842',
                        Reason: 'Use of forbidden links'
                    }
                    data.Content.push(warnContent);
                }
                data.save()
            })
        }
    }
})

// Leveling System Code //

const levelSchema = require('./Schemas.js/level');
const levelschema = require('./Schemas.js/levelsetup');

client.on(Events.MessageCreate, async (message, err) => {

    const { guild, author } = message;
    if (message.guild === null) return;
    const leveldata = await levelschema.findOne({ Guild: message.guild.id });

    if (!leveldata || leveldata.Disabled === 'disabled') return;
    let multiplier = 1;
    
    multiplier = Math.floor(leveldata.Multi);
    

    if (!guild || author.bot) return;

    levelSchema.findOne({ Guild: guild.id, User: author.id}, async (err, data) => {

        if (err) throw err;

        if (!data) {
            levelSchema.create({
                Guild: guild.id,
                User: author.id,
                XP: 0,
                Level: 0
            })
        }
    })

    const channel = message.channel;

    const give = 1;

    const data = await levelSchema.findOne({ Guild: guild.id, User: author.id});

    if (!data) return;

    const requiredXP = data.Level * data.Level * 20 + 20;

    if (data.XP + give >= requiredXP) {

        data.XP += give;
        data.Level += 1;
        await data.save();
        
        if (!channel) return;

        const levelembed = new EmbedBuilder()
        .setColor("Purple")
        .setTitle(`> ${author.username} has Leveled Up!`)
        .setFooter({ text: `⬆ ${author.username} Leveled Up`})
        .setTimestamp()
        .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081227919256457246/largepurple.png')
        .addFields({ name: `• New Level Unlocked`, value: `> ${author.username} is now level **${data.Level}**!`})
        .setAuthor({ name: `⬆ Level Playground`})

        await message.channel.send({ embeds: [levelembed] }).catch(err => console.log('Error sending level up message!'));
    } else {

        if(message.member.roles.cache.find(r => r.id === leveldata.Role)) {
            data.XP += give * multiplier;
        } data.XP += give;
        data.save();
    }
})

// Ghost Ping Code //

const ghostSchema = require('./Schemas.js/ghostping');
const numSchema = require('./Schemas.js/ghostNum');

client.on(Events.MessageDelete, async message => {

    if (message.guild === null) return;

    const Data = await ghostSchema.findOne({ Guild: message.guild.id });
    if (!Data) return;

    if (!message.author) return;
    if (message.author.bot) return;
    if (!message.author.id === client.user.id) return;
    if (message.author === message.mentions.users.first()) return;

    if (message.mentions.users.first() || message.type === MessageType.reply) {

        if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        let number;
        let time = 30;

        const data = await numSchema.findOne({ Guild: message.guild.id, User: message.author.id });
        if (!data) {
            await numSchema.create({
                Guild: message.guild.id,
                User: message.author.id,
                Number: 1
            })

            number = 1;
        } else {
            data.Number += 1;
            await data.save();

            number = data.Number;
        }

        if (number == 2) time = 60;
        if (number == 3) time = 300;
        if (number == 4) time = 600;
        if (number == 5) time = 6000;
        if (number == 6) time = 12000;
        if (number == 7) time = 300000;
        if (number >= 8) time = 600000;

        const ghostembed = new EmbedBuilder()
        .setColor('DarkRed')
        .setTimestamp()
        .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
        .setFooter({ text: `👻 Ghost ping Detected`})
        .setAuthor({ name: `👻 Anti-Ghost-Ping System`})
        .setTitle('Ghost pings are not Allowed')
        .setDescription(`> **${message.author}**, stop ghosting people.`)

        const ghostdmembed = new EmbedBuilder()
        .setColor('DarkRed')
        .setTimestamp()
        .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
        .setFooter({ text: `👻 Warned for ghost pinging`})
        .setAuthor({ name: `👻 Anti-Ghost-Ping System`})
        .setTitle('Ghost pings are not Allowed')
        .setDescription(`> You were warned and timedout in **${message.guild.name}** for ghost pinging`)

        const msg = await message.channel.send({ embeds: [ghostembed] });
        setTimeout(() => msg.delete(), 5000);

        const member = message.member;

        
        await member.timeout(time * 1000, 'Ghost pinging.');
        await member.send({ embeds: [ghostdmembed] }).catch(err => {
            return;
        })

            warningSchema.findOne({ GuildID: message.guild.id, UserID: message.author.id, UserTag: message.author.tag }, async (err, data) => {

            if (err) throw err;
    
            if (!data) {
                data = new warningSchema({
                    GuildID: message.guild.id,
                    UserID: message.author.id,
                    UserTag: message.author.tag,
                    Content: [
                        {
                            ExecuterId: '1076798263098880116',
                            ExecuterTag: 'PixelVal#8842',
                            Reason: 'Ghost Pinging/Replying'
                        }
                    ],
                });
     
            } else {
                const warnContent = {
                    ExecuterId: '1076798263098880116',
                    ExecuterTag: 'PixelVal#8842',
                    Reason: 'Ghost Pinging/Replying'
                }
                data.Content.push(warnContent);
            }
            data.save()
        })
        
    }
})

// AFK System Code //

const afkSchema = require('./Schemas.js/afkschema');
const { factorialDependencies, leftShift } = require('mathjs');

client.on(Events.MessageCreate, async (message) => {

    if (message.author.bot) return;

    if (message.guild === null) return;
    const afkcheck = await afkSchema.findOne({ Guild: message.guild.id, User: message.author.id});
    if (afkcheck) {
        const nick = afkcheck.Nickname;

        await afkSchema.deleteMany({
            Guild: message.guild.id,
            User: message.author.id
        })
        
        await message.member.setNickname(`${nick}`).catch(Err => {
            return;
        })

        const m1 = await message.reply({ content: `Hey, you are **back**!`, ephemeral: true})
        setTimeout(() => {
            m1.delete();
        }, 4000)
    } else {
        
        const members = message.mentions.users.first();
        if (!members) return;
        const afkData = await afkSchema.findOne({ Guild: message.guild.id, User: members.id })

        if (!afkData) return;

        const member = message.guild.members.cache.get(members.id);
        const msg = afkData.Message;

        if (message.content.includes(members)) {
            const m = await message.reply({ content: `${member.user.tag} is currently AFK, let's keep it down.. \n> **Reason**: ${msg}`, ephemeral: true});
            setTimeout(() => {
                m.delete();
                message.delete();
            }, 4000)
        }
    }
})

// Ping Bot + Fun //

client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    const inputmessage = message.content.toLowerCase();

    if (message.content == '<@1076798263098880116>' || inputmessage === 'hey pixelval' && message.author.id !== '1076798263098880116') {

        const msg = await message.reply({ content: `Hello there **${message.author}** :) Use </help manual:1081529934884917279> to get a list of my features!`, ephemeral: true});
        setTimeout(() => {
            try {
                msg.delete();
                message.delete();
            } catch (err) {
                return;
            }
        }, 5000)

    }

    if (inputmessage.includes('pixelval sucks') && message.author.id === '619944734776885276' && message.author.id !== '1076798263098880116') {

        const msg = await message.reply({ content: `Bro what the hell, I am literaly your son 😭`});
        setTimeout(() => {
            try {
                msg.delete();
                message.delete();
            } catch (err) {
                return;
            }
        }, 5000)

    } else if (inputmessage.includes('pixelval sucks') && message.author.id !== '1076798263098880116') {

        const msg = await message.reply({ content: `:(`})
        setTimeout(() => {
            try {
                msg.delete();
                message.delete();
            } catch (err) {
                return;
            }
        }, 5000)
    }
})

// Advanced Help Menu //

client.on(Events.InteractionCreate, async (interaction, err) => {

    const helprow2 = new ActionRowBuilder()
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

    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId === 'selecthelp') {
        let choices = "";

        const centerembed = new EmbedBuilder()
        .setColor("Green")
        .setTitle('> Get Help')
        .setAuthor({ name: `🧩 Help Command`})
        .setFooter({ text: `🧩 Help command: Help Center`})
        .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081199958704791552/largegreen.png')
        .addFields({ name: "• Commands Help", value: `> Get all **Commands** (**${client.commands.size}**) purposes.`})
        .addFields({ name: "• How to add Bot", value: "> Quick guide on how to add our **Bot** \n> to your server."})
        .addFields({ name: "• Feedback", value: "> How to send us feedback and suggestions."})
        .addFields({ name: "• Exclusive Functionality", value: "> Guide on how to receive permission to \n> use exclusive functionality."})
        .setTimestamp()

        interaction.values.forEach(async (value) => {
            choices += `${value}`;

            if (value === 'helpcenter') {

                setTimeout(() => {
                    interaction.update({ embeds: [centerembed] }).catch(err);
                }, 100)

            }

            if (value === 'howtoaddbot') {

                setTimeout(() => {
                    const howtoaddembed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle('> How to add our Bot')
                    .setAuthor({ name: `🧩 Help Command` })
                    .setFooter({ text: `🧩 Help command: How To Add Bot` })
                    .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081199958704791552/largegreen.png')
                    .addFields({ name: "• How to add our bot to your server", value: "> To add our bot, visit our bot's profile and \n> press on 'Add To Server'." })
                    .addFields({ name: "• How to recieve Events from ingame", value: "> To add that fuctionality, visit our official Discord server \n> head to 'how-to-add-bot. There, you will be informed about our application, complete it and \n> you will have the feature in no time!" })
                    .addFields({ name: "• Wait.. what Official Discord server..", value: "> This is our Discord server: https://discord.gg/CSYjWb7tzs" })
                    .setTimestamp();

                    interaction.update({ embeds: [howtoaddembed] }).catch(err);
                }, 100)
            }

            if (value === 'feedback') {

                setTimeout(() => {
                    const feedbackembed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle('> How to give us Feedback')
                    .setAuthor({ name: `🧩 Help Command` })
                    .setFooter({ text: `🧩 Help command: Feedback` })
                    .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081199958704791552/largegreen.png')
                    .addFields({ name: "• How can I give Feedback?", value: "> The creator of PixelVal appreciates your opinion on our his bot. To send feedback or suggestions, use the commands bellow." })
                    .addFields({ name: "• /feedback", value: "> Opens up a feedback form" })
                    .addFields({ name: "• /suggestion", value: "> Opens up a suggestion form" })
                    .setTimestamp();

                    interaction.update({ embeds: [feedbackembed] }).catch(err);
                }, 100)
            }

            if (value === 'exclusivefunctionality') {

                setTimeout(() => {
                    const exclusive = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle('> How to receive Exclusive Functionality permissions')
                    .setAuthor({ name: `🧩 Help Command` })
                    .setFooter({ text: `🧩 Help command: Exclusive Functionality` })
                    .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081199958704791552/largegreen.png')
                    .addFields({ name: "• What is Exclusive Functionality?", value: "> The exclusive functionalities consist of events called from our game, PixelVal. Furthermore, being able to capture messages such as player deaths or cosmetic unlocks are part of the Exclusive Functionality program. This program does not require any payment in order to participate in but is set to limit API usage as much as possible. We wouldn't want our API sending 1000 random messages a second.." })
                    .addFields({ name: "• Cool, so how do I get this Functionality?", value: "> In order to receive this functionality you will have to fill in a form by executing the **/exclusive-functionality** command. This form consists of your server url, the channel you want the messages to come through, and a short description as to why you want such functionality to be present on your server. We are going easy on applications, only reason as to why we even have them is to, as mentioned above, limit API usage but also collect the channel you want the updates to come in. There is no work around, so you will manually have to send us your channel ID through the form. After completing it, please contact **@JASO0ON#2117**." })
                    .addFields({ name: "• I completed it, now what?", value: "> **JASO0ON** will have to review your form before you receive any functionality. After **JASO0ON** does so, you will see messages coming through your channel as soon as the next version of PixelVal drops. You will need to have our bot added to your server in order for this to work. Furthermore, you may also need to give our bot **Administrative** permissions if you do not see any messages coming through. If you still have issues, use the **/feedback** command to contact us or contact **@JASO0ON#2117** directily for support." })
                    .setTimestamp();

                    interaction.update({ embeds: [exclusive] }).catch(err);
                }, 100)
                
            }

            if (value === 'commands') {

                const commandpage1 = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle('> Commands Help')
                    .setAuthor({ name: `🧩 Help Command` })
                    .setFooter({ text: `🧩 Help command: Commands Page 1` })
                    .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081199958704791552/largegreen.png')
                    .addFields({ name: "• /server info", value: "> Pulls some basic public info about the server the command was executed in." })
                    .addFields({ name: "• /reaction-role add", value: "> Adds a reaction role emoji to specified message." })
                    .addFields({ name: "• /reaction-role remove", value: "> Removes specified reaction role emoji from specified message." })
                    .addFields({ name: "• /auto-role set", value: "> Sets a role that your members will automatically have uppon joining." })
                    .addFields({ name: "• /auto-role remove", value: "> Removes your auto-role." })
                    .addFields({ name: "• /bot ping", value: "> Shows you the ping between the connection \n> of your client and the bot's." })
                    .addFields({ name: "• /help manual", value: "> Displays this menu. Furthermore, it offers help for commands." })
                    .addFields({ name: "• /welcome-channel set", value: "> Sets the channel where Welcome Events will be sent." })
                    .addFields({ name: "• /welcome-channel remove", value: "> Removes your Welcome Channel's ability \n> to listen to Welcome Events." })
                    .addFields({ name: "• /deleted-message", value: "> Prompts an administrator with the latest deleted message." })
                    .addFields({ name: "• /help server", value: "> Redirects you to our official support server." })
                    .addFields({ name: "• /nick", value: "> Changes your or someone else's nickname." })
                    .addFields({ name: "• /create embed", value: "> Creates an embed for you." })
                    .addFields({ name: "• /minigame hangman", value: "> Starts a game of Hangman for you." })
                    .addFields({ name: "• /who-is", value: "> Gets information on the specified User." })
                    .addFields({ name: "• /wiki", value: "> Returns a Wikipedia article based on the query (search) provided." })
                    .addFields({ name: "• /dictionary", value: "> Looks up the word specified in the dictionary." })
                    .addFields({ name: "• /create thread", value: "> Creates a thread for you." })
                    .addFields({ name: "• /minigame wordle", value: "> Start a game of classic Wordle." })
                    .addFields({ name: "• /emoji-enlarger", value: "> Enlarges the specified emoji. Does not support default emojies." })
                    .addFields({ name: "• /ban", value: "> Bans the user specified for specified reason." })
                    .addFields({ name: "• /unban", value: "> Unbans the user specified for specified reason." })
                    .addFields({ name: "• /memes", value: "> Generates a legendary random meme for you." })
                    .addFields({ name: "• /minigame 8ball", value: "> Prompts you with a game of 8ball." })
                    .addFields({ name: "• /purge", value: "> Bulk deletes given amount of messages. Limit is 100 due to api limitations." })
                    .setImage('https://cdn.discordapp.com/attachments/1080219392337522718/1081867062177181736/Screenshot_300.png')
                    .setTimestamp();

                const commandpage2 = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle('> Commands Help')
                    .setAuthor({ name: `🧩 Help Command` })
                    .setFooter({ text: `🧩 Help command: Commands Page 2` })
                    .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081199958704791552/largegreen.png')
                    .addFields({ name: "• /feedback", value: "> Opens an application in which you can share feedback on PixelVal with the creator, JASO0ON." })
                    .addFields({ name: "• /suggestion", value: "> Opens an application in which you can share a suggestion on PixelVal with the creator, JASO0ON." })
                    .addFields({ name: "• /exclusive-functions", value: "> Creates an application which is needed to be filled in order to receive events from our official video game, PixelVal. Please contact JASO0ON#2117 after sumbiting it." })
                    .addFields({ name: "• /say", value: "> Sends a message as PixelVal." })
                    .addFields({ name: "• /minigame 2048", value: "> Starts a game of 2048." })
                    .addFields({ name: "• /bot stats", value: "> Gives you some basic statistical information about our bot." })
                    .addFields({ name: "• /sticky set", value: "> Creates a sticky note that will be reposted every time given amount of messages are sent." })
                    .addFields({ name: "• /sticky remove", value: "> Removes previously set sticky note." })
                    .addFields({ name: "• /anti-link setup", value: "> Sets up the anti-link moderation system for you. Given permission will be able to bypass the system." })
                    .addFields({ name: "• /anti-link disable", value: "> Disables the anti-link moderation system." })
                    .addFields({ name: "• /anti-link edit", value: "> Modifies the currently active anti-link moderation system." })
                    .addFields({ name: "• /anti-link check", value: "> Checks the status of the currently set up anti-link moderation system." })
                    .addFields({ name: "• /invites", value: "> Get specified user's invite count." })
                    .addFields({ name: "• /rank", value: "> Displays specified user's rank." })
                    .addFields({ name: "• /leaderboard", value: "> Displays the Rank leaderboard." })
                    .addFields({ name: "• /reset xp", value: "> Reset specified user's Rank." })
                    .addFields({ name: "• /reset all-xp", value: "> Resets ALL Ranks in your server. Use with caution." })
                    .addFields({ name: "• /warn add", value: "> Warns specified User for specified reason." })
                    .addFields({ name: "• /warnings", value: "> Displays your current warnings." })
                    .addFields({ name: "• /warn clear", value: "> Resets specified User's warnings back to default." })
                    .addFields({ name: "• /slowmode", value: "> Enables slowdown for specified channel." })
                    .addFields({ name: "• /kick", value: "> Kicks specified user for specified reason." })
                    .addFields({ name: "• /automod", value: "> Adds a layer of protection to your server using automod." })
                    .addFields({ name: "• /tts", value: "> Sends a TTS (text to speech) message." })
                    .addFields({ name: "• /quote", value: "> Gives you a random quote." })
                    .setImage('https://cdn.discordapp.com/attachments/1080219392337522718/1081867062177181736/Screenshot_300.png')
                    .setTimestamp();

                const commandpage3 = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle('> Commands Help')
                    .setAuthor({ name: `🧩 Help Command` })
                    .setFooter({ text: `🧩 Help command: Commands Page 3` })
                    .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081199958704791552/largegreen.png')
                    .addFields({ name: "• /give-xp", value: "> Gives specified user specified XP. Use with caution, still in BETA." })
                    .addFields({ name: "• /steal", value: "> Adds specified emoji to your server. Using nitro will ease this process, otherwise you can paste the full ID of the emoji in the emoji slot to add the emoji you want." })
                    .addFields({ name: "• /economy", value: "> Sets up your economy account for the economy system. This command also allows you to delete your account if needed." })
                    .addFields({ name: "• /beg", value: "> Beg for money. Results may vary." })
                    .addFields({ name: "• /bal", value: "> Displays your balance." })
                    .addFields({ name: "• /give-currency", value: "> Gives specified user specified amount of economy currency." })
                    .addFields({ name: "• /withdraw", value: `> Withdraws specified amount of balance from your bank to your wallet. Use "all" to withdraw all of your balance from your bank.` })
                    .addFields({ name: "• /deposit", value: `> Deposits specified amount of balance to the bank. Use "all" to deposit all of your wallet balance.` })
                    .addFields({ name: "• /reset currency", value: "> Resets specified user's economy currency." })
                    .addFields({ name: "• /reset all-currency", value: "> Resets your server's Economy system. This means that all balances will be set to $**0** and your Members will need to create new **accounts**." })
                    .addFields({ name: "• /mute", value: "> Times out specified user for specified reason for specified amount of time. Types are: s for seconds, m for minutes, h for hours, d for days. Cannot be shorter than 5 seconds, cannot be longer than 24 days." })
                    .addFields({ name: "• /unmute", value: "> Un-timesout specified user for specified reason." })
                    .addFields({ name: "• /spotify", value: "> Displays information about the song specified user is listening to." })
                    .addFields({ name: "• /nitro", value: "> Generates a super real nitro link." })
                    .addFields({ name: "• /coin-flip", value: "> Flips a coin." })
                    .addFields({ name: "• /minigame tic-tac-toe", value: "> Starts a game of tic-tac-toe." })
                    .addFields({ name: "• /role create", value: "> Creates a role for you." })
                    .addFields({ name: "• /role members", value: "> Lists specified role's members." })
                    .addFields({ name: "• /role delete", value: "> Deletes specified role." })
                    .addFields({ name: "• /role add", value: "> Adds specified role to specified user." })
                    .addFields({ name: "• /role remove", value: "> Removes specified role from specified user." })
                    .addFields({ name: "• /anti-ghost-ping reset", value: "> Resets all past ghost ping warnings from a user, effectively resetting their time to 15s. The warning log will not be cleaned." })
                    .addFields({ name: "• /anti-ghost-ping setup", value: "> Enables and sets up the anti ghost ping moderation system for you." })
                    .addFields({ name: "• /anti-ghost-ping disable", value: "> Disables the anti ghost ping system." })
                    .setImage('https://cdn.discordapp.com/attachments/1080219392337522718/1081867062177181736/Screenshot_300.png')
                    .setTimestamp();

                const commandpage4 = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle('> Commands Help')
                    .setAuthor({ name: `🧩 Help Command` })
                    .addFields({ name: "• /ascii", value: "> Converts specified text into ascii art." })
                    .addFields({ name: "• /how gay", value: "> Displays an accurate percentage of how gay you are." })
                    .addFields({ name: "• /how sus", value: "> Displays an accurate percentage of how sus you are." })  
                    .addFields({ name: "• /how stupid", value: "> Displays an accurate percentage of how stupid you are." }) 
                    .addFields({ name: "• /rickroll", value: "> Generates a rickroll link for you, it is trolling time!" })
                    .addFields({ name: "• /vote", value: "> Vote for PixelVal on **Top.gg**!" })
                    .addFields({ name: "• /mass-unban", value: "> Unbans all members of your guild. Use with **caution**!" })
                    .addFields({ name: "• /calc", value: "> Opens up a calculator." })
                    .addFields({ name: "• /minigame snake", value: "> Starts a game of good old snake." })
                    .addFields({ name: "• /lyrics", value: "> Displays the lyrics of specified song." })
                    .addFields({ name: "• /soundboard", value: "> Plays a neat sound effect." })
                    .addFields({ name: "• /time", value: "> Displays your current time and date." })
                    .addFields({ name: "• /add sticker", value: "> Adds specified sticker to the guild." })
                    .addFields({ name: "• /add emoji", value: "> Adds specified emoji to the guild." })
                    .addFields({ name: "• /afk set", value: "> Sets an AFK status for you." })
                    .addFields({ name: "• /afk remove", value: "> Removes your AFK status." })
                    .addFields({ name: "• /poll", value: "> Creates a poll in specified channel." })
                    .addFields({ name: "• /counting setup", value: "> Sets up the counting system for you." })
                    .addFields({ name: "• /counting disable", value: "> Disables the counting system." })
                    .addFields({ name: "• /spoof", value: "> Spoofs a message. Using this maliciously will result in a ban hammer htting you in the head." })
                    .addFields({ name: "• /fake-tweet", value: "> Spoofs a tweet. Using this maliciously will result in a ban hammer htting you in the head." })
                    .addFields({ name: "• /advice", value: "> Get some random life advice." })
                    .addFields({ name: "• /phone setup", value: "> Sets up the phone system. Be **aware**, this system does not support images yet and collects your message content momentarily. When sending a message, it will be sent to all guilds, thus why we need to read your message content when in the same channel as the system's setup channel." })
                    .addFields({ name: "• /phone remove", value: "> Disables the phone system for your server." })
                    .addFields({ name: "• /phone ban", value: "> Bans a user from sending phone messages." })
                    .setFooter({ text: `🧩 Help command: Commands Page 4` })
                    .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081199958704791552/largegreen.png')
                    .setImage('https://cdn.discordapp.com/attachments/1080219392337522718/1081867062177181736/Screenshot_300.png')
                    .setTimestamp();

                    const commandpage5 = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle('> Commands Help')
                    .setAuthor({ name: `🧩 Help Command` })
                    .addFields({ name: "• /phone unban", value: "> Unbans a user from sending phone messages." })
                    .addFields({ name: "• /phone owner-ban", value: "> Bans an owner's servers from sending phone messages." })
                    .addFields({ name: "• /phone owner-unban", value: "> Unbans an owner's servers from sending phone messages." })
                    .addFields({ name: "• /help staff", value: "> Pings available staff in the server to help you." })
                    .addFields({ name: "• /staff-role set", value: "> Sets the role that is used for the Helper Staff system. Online members with this role will be pinged when someone does **/help staff**." })
                    .addFields({ name: "• /staff-role remove", value: "> Disables the **Helper Staff** system." })
                    .addFields({ name: "• /lockdown blacklist-add", value: "> Adds specified channel to the blacklist. It won't be affected by any future lockdowns." })
                    .addFields({ name: "• /lockdown blacklist-remove", value: "> Removes a channel from the blacklist. It will be affected by future lockdowns." })
                    .addFields({ name: "• /lockdown commit", value: "> Locksdown the server. Ignores blacklisted channels." })
                    .addFields({ name: "• /lockdown unlock", value: "> Unlocks the server. Ignores blacklisted channels." })
                    .addFields({ name: "• /giveaway start", value: "> Starts a giveaway with specified fields." })
                    .addFields({ name: "• /giveaway end", value: "> Ends specified giveaway." })
                    .addFields({ name: "• /giveaway edit", value: "> Edits specified giveaway." })
                    .addFields({ name: "• /giveaway reroll", value: "> Rerolls specified giveaway's winners." })
                    .addFields({ name: "• /members-vc total-set", value: "> Sets up your total members voice channel." })
                    .addFields({ name: "• /members-vc total-remove", value: "> Disables/Removes your total members voice channel." })
                    .addFields({ name: "• /members-vc bot-set", value: "> Sets up your total bots voice channel." })
                    .addFields({ name: "• /members-vc bot-remove", value: "> Disables/Removes your total bots voice channel." })
                    .addFields({ name: "• /channel create", value: "> Disables/Removes your total bots voice channel." })
                    .addFields({ name: "• /channel edit", value: "> Disables/Removes your total bots voice channel." })
                    .addFields({ name: "• /channel remove", value: "> Disables/Removes your total bots voice channel." })
                    .addFields({ name: "• /minigame minesweeper", value: "> Starts a game of minesweeper." })
                    .addFields({ name: "• /confess send", value: "> Sends an anonymous confession." })
                    .addFields({ name: "• /confess setup", value: "> Sets up the confession system for you." })
                    .addFields({ name: "• /confess disable", value: "> Disables the confession system for you." })
                    .setFooter({ text: `🧩 Help command: Commands Page 5` })
                    .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081199958704791552/largegreen.png')
                    .setImage('https://cdn.discordapp.com/attachments/1080219392337522718/1081867062177181736/Screenshot_300.png')
                    .setTimestamp();

                    const commandpage6 = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle('> Commands Help')
                    .setAuthor({ name: `🧩 Help Command` })
                    .addFields({ name: "• /join-ping add", value: "> Adds a channel to the join ping list. The bot will ping the user in specified channel uppon arrival." })
                    .addFields({ name: "• /join-ping remove", value: "> Removes specified channel from the join ping channel list." })
                    .addFields({ name: "• /join-ping disable", value: "> Disables and removes all channels from the join ping channel list." })
                    .addFields({ name: "• /minigame would-you-rather", value: "> Starts a game of would you rather." })
                    .addFields({ name: "• /leveling enable", value: "> Enables leveling for your server." })
                    .addFields({ name: "• /leveling disable", value: "> Disables leveling for your server." })
                    .addFields({ name: "• /leveling role-multiplier", value: "> Sets up an XP multiplier role for you." })
                    .addFields({ name: "• /leveling disable-multiplier", value: "> Disables your XP multiplier role." })
                    .addFields({ name: "• /webhook edit", value: "> Edits specified webhook for you." })
                    .addFields({ name: "• /webhook delete", value: "> Deletes specified webhook for you." })
                    .addFields({ name: "• /avatar get", value: "> Display a user's avatar." })
                    .addFields({ name: "• /avatar pixelate", value: "> Pixelate a user's avatar." })
                    .addFields({ name: "• /verify setup", value: "> Sets up the verification system for you." })
                    .addFields({ name: "• /verify disable", value: "> Disables your verification system for you." })
                    .addFields({ name: "• /verify bypass", value: "> Bypasses a user from the verification process." })
                    .addFields({ name: "• /verify remove", value: "> Unverifies a user from the verification system." })
                    .addFields({ name: "• /interaction profile", value: "> Shows specified user's interaction profile." })
                    .addFields({ name: "• /interaction hug", value: "> Hugs specified user, how cute!" })
                    .addFields({ name: "• /interaction slap", value: "> Slaps specified user, how rude :(" })
                    .addFields({ name: "• /interaction kill", value: "> Kills specified user, how evil >:(" })     
                    .addFields({ name: "• /interaction kiss", value: "> Kisses specified user, how romantic <3" })  
                    .addFields({ name: "• /join-to-create setup", value: "> Sets up your join to create voice call." })
                    .addFields({ name: "• /join-to-create disable", value: "> Disables your join to create system." })
                    .addFields({ name: "• /webhook create", value: "> Creates a webhook for you." }) 
                    .setFooter({ text: `🧩 Help command: Commands Page 6` })
                    .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081199958704791552/largegreen.png')
                    .setImage('https://cdn.discordapp.com/attachments/1080219392337522718/1081867062177181736/Screenshot_300.png')
                    .setTimestamp();

                    const commandpage7 = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle('> Commands Help')
                    .setAuthor({ name: `🧩 Help Command` })
                    .addFields({ name: "• /starboard setup", value: "> Sets up your starboard system. Be **aware**, upon the reacted message received over your specified amount of reactions it's content will be collected momentarily in order to send it to your setup channel. These messages are **NOT** stored." })
                    .addFields({ name: "• /starboard disable", value: "> Disables your starboard system." })
                    .addFields({ name: "• /starboard block-message", value: "> Blocks a message from ever being sent to the starboard." })
                    .addFields({ name: "• /starboard block-user", value: "> Blocks a user's messages from ever being sent to the starboard." })
                    .addFields({ name: "• /starboard unblock-user", value: "> Unblocks a user's messages from ever being sent to the starboard." })
                    .setFooter({ text: `🧩 Help command: Commands Page 7` })
                    .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081199958704791552/largegreen.png')
                    .setImage('https://cdn.discordapp.com/attachments/1080219392337522718/1081867062177181736/Screenshot_300.png')
                    .setTimestamp();


                const commandbuttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('helpcenterbutton')
                            .setLabel('Help Center')
                            .setStyle(ButtonStyle.Success),

                            new ButtonBuilder()
                            .setCustomId('first')
                            .setLabel('◀◀')
                            .setDisabled(true)
                            .setStyle(ButtonStyle.Primary),

                        new ButtonBuilder()
                            .setCustomId('pageleft')
                            .setLabel('◀')
                            .setDisabled(true)
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('pageright')
                            .setLabel('▶')
                            .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                            .setCustomId('last')
                            .setLabel('▶▶')
                            .setStyle(ButtonStyle.Primary)
                    );

                const commandbuttons1 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('helpcenterbutton1')
                            .setLabel('Help Center')
                            .setStyle(ButtonStyle.Success),

                            new ButtonBuilder()
                            .setCustomId('first')
                            .setLabel('◀◀')
                            .setStyle(ButtonStyle.Primary),

                        new ButtonBuilder()
                            .setCustomId('pageleft1')
                            .setLabel('◀')
                            .setDisabled(false)
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('pageright1')
                            .setDisabled(false)
                            .setLabel('▶')
                            .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                            .setCustomId('last')
                            .setLabel('▶▶')
                            .setStyle(ButtonStyle.Primary)
                        );

                    const commandbuttons2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('helpcenterbutton2')
                            .setLabel('Help Center')
                            .setStyle(ButtonStyle.Success),

                            new ButtonBuilder()
                            .setCustomId('first')
                            .setLabel('◀◀')
                            .setStyle(ButtonStyle.Primary),

                        new ButtonBuilder()
                            .setCustomId('pageleft2')
                            .setLabel('◀')
                            .setDisabled(false)
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('pageright2')
                            .setDisabled(false)
                            .setLabel('▶')
                            .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                            .setCustomId('last')
                            .setLabel('▶▶')
                            .setStyle(ButtonStyle.Primary)
                    );

                const commandbuttons3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('helpcenterbutton3')
                            .setLabel('Help Center')
                            .setStyle(ButtonStyle.Success),

                            new ButtonBuilder()
                            .setCustomId('first')
                            .setLabel('◀◀')
                            .setStyle(ButtonStyle.Primary),

                        new ButtonBuilder()
                            .setCustomId('pageleft3')
                            .setLabel('◀')
                            .setDisabled(false)
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('pageright3')
                            .setDisabled(false)
                            .setLabel('▶')
                            .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                            .setCustomId('last')
                            .setLabel('▶▶')
                            .setStyle(ButtonStyle.Primary)
                    );

                const commandbuttons4 = new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId('helpcenterbutton4')
                            .setLabel('Help Center')   
                            .setStyle(ButtonStyle.Success),

                            new ButtonBuilder()
                            .setCustomId('first')
                            .setLabel('◀◀')
                            .setStyle(ButtonStyle.Primary),

                        new ButtonBuilder()
                            .setCustomId('pageleft4')
                            .setLabel('◀')
                            .setDisabled(false)
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('pageright4')
                            .setDisabled(false)
                            .setLabel('▶')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('last')
                            .setLabel('▶▶')
                            .setDisabled(true)
                            .setStyle(ButtonStyle.Primary)
                            
                    );
                
                    const commandbuttons5 = new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId('helpcenterbutton5')
                            .setLabel('Help Center')   
                            .setStyle(ButtonStyle.Success),

                            new ButtonBuilder()
                            .setCustomId('first')
                            .setLabel('◀◀')
                            .setStyle(ButtonStyle.Primary),

                        new ButtonBuilder()
                            .setCustomId('pageleft5')
                            .setLabel('◀')
                            .setDisabled(false)
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('pageright5')
                            .setDisabled(false)
                            .setLabel('▶')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('last')
                            .setLabel('▶▶')
                            .setDisabled(false)
                            .setStyle(ButtonStyle.Primary)
                            
                    );

                    const commandbuttons6 = new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId('helpcenterbutton6')
                            .setLabel('Help Center')   
                            .setStyle(ButtonStyle.Success),

                            new ButtonBuilder()
                            .setCustomId('first')
                            .setLabel('◀◀')
                            .setStyle(ButtonStyle.Primary),

                        new ButtonBuilder()
                            .setCustomId('pageleft6')
                            .setLabel('◀')
                            .setDisabled(false)
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('pageright6')
                            .setDisabled(true)
                            .setLabel('▶')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('last')
                            .setLabel('▶▶')
                            .setDisabled(true)
                            .setStyle(ButtonStyle.Primary)
                            
                    );


                await interaction.update({ embeds: [commandpage1], components: [commandbuttons] }).catch(err);
                const collector = interaction.message.createMessageComponentCollector({ componentType: ComponentType.Button });

                collector.on('collect', async (i, err) => {

                    if (i.customId === 'last') {
                        i.update({ embeds: [commandpage7], components: [commandbuttons6] }).catch(err);
                    }

                    if (i.customId === 'first') {
                        i.update({ embeds: [commandpage1], components: [commandbuttons] }).catch(err);
                    }

                    if (i.customId === 'helpcenterbutton') {
                        i.update({ embeds: [centerembed], components: [helprow2] }).catch(err);
                    }

                    if (i.customId === 'pageleft') { 
                        i.update({ embeds: [commandpage1], components: [commandbuttons] }).catch(err);
                    }

                    if (i.customId === 'pageright') { 
                        i.update({ embeds: [commandpage2], components: [commandbuttons1] }).catch(err);
                    }

                    if (i.customId === 'helpcenterbutton1') {
                        i.update({ embeds: [centerembed], components: [helprow2] }).catch(err);
                    }

                    if (i.customId === 'pageright1') {
                        i.update({ embeds: [commandpage3], components: [commandbuttons2] }).catch(err);
                    }

                    if (i.customId === 'pageleft1') {
                        i.update({ embeds: [commandpage1], components: [commandbuttons] }).catch(err);
                    }

                    if (i.customId === 'helpcenterbutton2') {
                        i.update({ embeds: [centerembed], components: [helprow2] }).catch(err);
                    }

                    if (i.customId === 'pageright2') {
                        i.update({ embeds: [commandpage4], components: [commandbuttons3] }).catch(err);
                    }

                    if (i.customId === 'pageleft2') {
                        i.update({ embeds: [commandpage2], components: [commandbuttons1] }).catch(err);
                    }

                    if (i.customId === 'helpcenterbutton3') {
                        i.update({ embeds: [centerembed], components: [helprow2] }).catch(err)
                    }

                    if (i.customId === 'pageright3') {
                        i.update({ embeds: [commandpage5], components: [commandbuttons4] }).catch(err);
                    }

                    if (i.customId === 'pageleft3') {
                        i.update({ embeds: [commandpage3], components: [commandbuttons2] }).catch(err);
                    }

                    if (i.customId === 'helpcenterbutton4') {
                        i.update({ embeds: [centerembed], components: [helprow2] }).catch(err);
                    }

                    if (i.customId === 'pageright4') {
                        i.update({ embeds: [commandpage6], components: [commandbuttons5] }).catch(err);
                    }

                    if (i.customId === 'pageleft4') {
                        i.update({ embeds: [commandpage4], components: [commandbuttons3] }).catch(err);
                    }

                    if (i.customId === 'helpcenterbutton5') {
                        i.update({ embeds: [centerembed], components: [helprow2] }).catch(err);
                    }

                    if (i.customId === 'pageright5') {
                        i.update({ embeds: [commandpage7], components: [commandbuttons6] }).catch(err);
                    }

                    if (i.customId === 'pageleft5') {
                        i.update({ embeds: [commandpage5], components: [commandbuttons4] }).catch(err);
                    }

                    if (i.customId === 'helpcenterbutton6') {
                        i.update({ embeds: [centerembed], components: [helprow2] }).catch(err);
                    }

                    if (i.customId === 'pageright6') {
                        i.update({ embeds: [commandpage7], components: [commandbuttons6] }).catch(err);
                    }

                    if (i.customId === 'pageleft6') {
                        i.update({ embeds: [commandpage6], components: [commandbuttons5] }).catch(err);
                    }
                });
            }
        })
    }
})

// Phone System //

client.on(Events.MessageCreate, async message => {

    if (message.guild === null) return;

    const phoneschema = require('./Schemas.js/phoneschema');
    const phonedata = await phoneschema.findOne({ Guild: message.guild.id });
    const ownerschema = require('./Schemas.js/phoneownerbans');
    const ownerdata = await ownerschema.findOne({ Pass: 'password' });

    if (!phonedata) return;
    else {

        const phonechannel = client.channels.cache.get(phonedata.Channel);
        
        if (!phonechannel || phonechannel === null) return;
        if (message.author.bot) return;
        if (phonechannel.id !== message.channel.id) return;

        multidata = await phoneschema.find({ Setup: 'defined' });
        const filter = require('./filter.json');

        for (var i = 0; i < filter.words.length; i++) {

            const filtered = await message.content.toLowerCase();
            if (filtered.includes(filter.words[i])) {

                try {
                    message.react('⚠')
                } catch (err) {
                    throw err;
                }

                return;
            }
        }

        if (phonedata.Bans.includes(message.author.id) || ownerdata.User.includes(message.guild.ownerId)) {

            try {
                message.react('🚫')
            } catch (err) {
                throw err;
            }

            return;

        } else {
            
            try {
                message.react('📧')
            } catch (err) {
                throw err;
            }
        }

        await Promise.all(multidata.map(async data => {

            try {
                const phonechannels = await client.channels.fetch(data.Channel);
                let phonemessage = message.content || '**No message provided!**';
                const filtermessage = phonemessage.toLowerCase();

                if (filtermessage.includes === 'nigga' || filtermessage.includes === 'nigger' || filtermessage.includes === 'niga' || filtermessage.includes === 'niger' || filtermessage.includes === 'nιgga' || filtermessage.includes === 'fagot' || filtermessage.includes === 'faggot' || filtermessage.includes === 'fag') {
                    phonemessage = 'Censored message!'
                }

                if (message.channel.id === phonechannels.id) return;

                const phoneembed = new EmbedBuilder()
                .setColor('DarkBlue')
                .setFooter({ text: `📞 From: ${message.guild.name.slice(0, 100)} | ID: ${message.author.id}`})
                .setAuthor({ name: `📞 Phone System`})
                .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081275127850864640/largeblue.png')
                .setTimestamp()
                .setTitle(`> ${message.author.tag.slice(0, 256)}`)
                .setDescription(`${phonemessage.slice(0, 4000)}`)

                phonechannels.send({ embeds: [phoneembed] }).catch(err => console.log('Error received trying to phone a message!'))
                return phonechannels;

            } catch (err) {
                return;
            }

        }));
    } 
})

// Member Voice Channels Code //

client.on(Events.GuildMemberAdd, async (member, err) => {

    if (member.guild === null) return;
    const voicedata = await voiceschema.findOne({ Guild: member.guild.id });

    if (!voicedata) return;
    else {

        const totalvoicechannel = member.guild.channels.cache.get(voicedata.TotalChannel);
        if (!totalvoicechannel || totalvoicechannel === null) return;
        const totalmembers = member.guild.memberCount;

        totalvoicechannel.setName(`• Total Members: ${totalmembers}`).catch(err);

    }
})

client.on(Events.GuildMemberRemove, async (member, err) => {

    if (member.guild === null) return;
    const voicedata1 = await voiceschema.findOne({ Guild: member.guild.id });

    if (!voicedata1) return;
    else {

        const totalvoicechannel1 = member.guild.channels.cache.get(voicedata1.TotalChannel);
        if (!totalvoicechannel1 || totalvoicechannel1 === null) return;
        const totalmembers1 = member.guild.memberCount;

        totalvoicechannel1.setName(`• Total Members: ${totalmembers1}`).catch(err);
    
    }
})

// Total Bots Voice Channel Code //

client.on(Events.GuildMemberAdd, async (member, err) => {

    if (member.guild === null) return;
    const botdata = await botschema.findOne({ Guild: member.guild.id });

    if (!botdata) return;
    else {

        const botvoicechannel = member.guild.channels.cache.get(botdata.BotChannel);
        if (!botvoicechannel || botvoicechannel === null) return;
        const botslist = member.guild.members.cache.filter(member => member.user.bot).size;

        botvoicechannel.setName(`• Total Bots: ${botslist}`).catch(err);

    }
})

client.on(Events.GuildMemberRemove, async (member, err) => {

    if (member.guild === null) return;
    const botdata1 = await botschema.findOne({ Guild: member.guild.id });

    if (!botdata1) return;
    else {

        const botvoicechannel1 = member.guild.channels.cache.get(botdata1.BotChannel);
        if (!botvoicechannel1 || botvoicechannel1 === null) return;
        const botslist1 = member.guild.members.cache.filter(member => member.user.bot).size;

        botvoicechannel1.setName(`• Total Bots: ${botslist1}`).catch(err);
    
    }
})

// Join Ping Code //

client.on(Events.GuildMemberAdd, async (member, err) => {

    const pingdata = await pingschema.findOne({ Guild: member.guild.id });

    if (!pingdata) return;
    else {

        await Promise.all(pingdata.Channel.map(async pingeddata => {

            const pingchannels = await client.channels.fetch(pingeddata);
            const message = await pingchannels.send(`${member}`).catch(err);
            
            setTimeout(() => {
                
                try {
                    message.delete();
                } catch (err) {
                    return;
                }

            }, 1000)
        }));
    }
})

// Starboard System //

client.on(Events.MessageReactionAdd, async (reaction, err) => {

    if (reaction.emoji.name === '⭐') {

        try {
            await reaction.fetch();
        } catch (error) {
            return;
        }

        const stardata = await starschema.findOne({ Guild: reaction.message.guild.id });
        const reactions = reaction.message.reactions.cache.get('⭐').count;

        const messagedata = await starmessageschema.findOne({ Message: reaction.message.id })
        if (messagedata) {

            const reactmessage = await client.channels.cache.get(messagedata.Channel).messages.fetch(messagedata.Reaction);
            const newreactions = reactions;
            const receivedEmbed = await reactmessage.embeds[0];

            try {
                const newembed = EmbedBuilder.from(receivedEmbed).setFields({ name: `• Stars`, value: `> ${newreactions} ⭐`});
                reactmessage.edit({ embeds: [newembed]}).catch(err);
            } catch (err) {
                return;
            }
        }

        const id = reaction.message.id;

        if (!stardata) return;

        if (reactions > stardata.Count) {

            if (reaction.message.channel.id === stardata.Channel) return;
            if (stardata.SentMessages.includes(id)) return;
            if (stardata.BanUser.includes(reaction.message.author.id)) return;

            const starembed = new EmbedBuilder()
            .setColor('Yellow')
            .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1084019710892449792/largeyellow.png')
            .setAuthor({ name: `⭐ Starboard System`})
            .setTimestamp()
            .setFooter({ text: `⭐ Starred Message`})
            .setTitle(`• Message by: ${reaction.message.author.tag}`)
            .setDescription(`${reaction.message.content || 'No message given.'}`)
            .addFields({ name: `• Stars`, value: `> ${reactions} ⭐`})

            if (reaction.message.attachments.size > 0) {

                try {
                    starembed.setImage(`${reaction.message.attachments.first()?.url}`);
                } catch (err) {
                    console.log(`Couldn't set image for starboard.`);
                }

            }
           
            const starchannel = await reaction.message.guild.channels.cache.get(stardata.Channel);

            const starmsg = await starchannel.send({ embeds: [starembed] }).catch(err);

            await starmessageschema.create({
                Reaction: starmsg.id,
                Message: reaction.message.id,
                Channel: stardata.Channel
            })
            
            try {
                starmsg.react('⭐');
            } catch (err) {
                console.log('Error occured when reacting to a star message!')
            }

            await starschema.updateOne({ Guild: reaction.message.guild.id }, { $push: { SentMessages: id }});

        }
    }  
})

client.on(Events.MessageReactionRemove, async (reaction, err) => {

    if (reaction.guild === 'null') return;

    if (reaction.emoji.name === '⭐') {

        try {
            await reaction.fetch();
        } catch (error) {
            return;
        }

        const stardata = await starschema.findOne({ Guild: reaction.message.guild.id });
        
        const reactions = reaction.message.reactions.cache.get('⭐').count;

        const messagedata = await starmessageschema.findOne({ Message: reaction.message.id })
        if (messagedata) {

            const reactmessage = await client.channels.cache.get(messagedata.Channel).messages.fetch(messagedata.Reaction);
            const newreactions = reactions;
            const receivedEmbed = await reactmessage.embeds[0];

            if (reactions < stardata.Count) {

                try {
                    const newembed1 = EmbedBuilder.from(receivedEmbed).setFields({ name: `• Stars`, value: `> Not enough ⭐`});
                    reactmessage.edit({ embeds: [newembed1]}).catch(err);
                } catch (err) {
                    return;
                }

            } else {
                try {
                    const newembed2 = EmbedBuilder.from(receivedEmbed).setFields({ name: `• Stars`, value: `> ${newreactions} ⭐`});
                    reactmessage.edit({ embeds: [newembed2]}).catch(err);
                } catch (err) {
                    return;
                }
            }
        }  
    }
})

// VERIFICATION CAPTCHA SYSTEM CODE //

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.guild === null) return;

    const verifydata = await capschema.findOne({ Guild: interaction.guild.id });
    const verifyusersdata = await verifyusers.findOne({ Guild: interaction.guild.id, User: interaction.user.id });

    if (interaction.customId === 'verify') {

        if (!verifydata) return await interaction.reply({ content: `The **verification system** has been disabled in this server!`, ephemeral: true});

        if (verifydata.Verified.includes(interaction.user.id)) return await interaction.reply({ content: 'You have **already** been verified!', ephemeral: true})
        else {

            let letter = ['0','1','2','3','4','5','6','7','8','9','a','A','b','B','c','C','d','D','e','E','f','F','g','G','h','H','i','I','j','J','f','F','l','L','m','M','n','N','o','O','p','P','q','Q','r','R','s','S','t','T','u','U','v','V','w','W','x','X','y','Y','z','Z',]
            let result = Math.floor(Math.random() * letter.length);
            let result2 = Math.floor(Math.random() * letter.length);
            let result3 = Math.floor(Math.random() * letter.length);
            let result4 = Math.floor(Math.random() * letter.length);
            let result5 = Math.floor(Math.random() * letter.length);

            const cap = letter[result] + letter[result2] + letter[result3] + letter[result4] + letter[result5];
            console.log(cap)

            const captcha = new CaptchaGenerator()
            .setDimension(150, 450)
            .setCaptcha({ text: `${cap}`, size: 60, color: "green"})
            .setDecoy({ opacity: 0.5 })
            .setTrace({ color: "green" })

            const buffer = captcha.generateSync();
            
            const verifyattachment = new AttachmentBuilder(buffer, { name: `captcha.png`});
            
            const verifyembed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({ name: `✅ Verification Proccess`})
            .setFooter({ text: `✅ Verification Captcha`})
            .setTimestamp()
            .setImage('attachment://captcha.png')
            .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081199958704791552/largegreen.png')
            .setTitle('> Verification Step: Captcha')
            .addFields({ name: `• Verify`, value: '> Please use the button bellow to \n> submit your captcha!'})

            const verifybutton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel('✅ Enter Captcha')
                .setStyle(ButtonStyle.Success)
                .setCustomId('captchaenter')
            )

            const vermodal = new ModalBuilder()
            .setTitle('Verification')
            .setCustomId('vermodal')

            const answer = new TextInputBuilder()
            .setCustomId('answer')
            .setRequired(true)
            .setLabel('• Please sumbit your Captcha code')
            .setPlaceholder('Your captcha code')
            .setStyle(TextInputStyle.Short)

            const vermodalrow = new ActionRowBuilder().addComponents(answer);
            vermodal.addComponents(vermodalrow);

            try {
                const vermsg = await interaction.reply({ embeds: [verifyembed], components: [verifybutton], ephemeral: true, files: [verifyattachment] });

                const vercollector = vermsg.createMessageComponentCollector();

                vercollector.on('collect', async i => {

                    if (i.customId === 'captchaenter') {
                        i.showModal(vermodal);
                    }

                })

            } catch (err) {
                return;
            }

            if (verifyusersdata) {

                await verifyusers.deleteMany({
                    Guild: interaction.guild.id,
                    User: interaction.user.id
                })

                await verifyusers.create ({
                    Guild: interaction.guild.id,
                    User: interaction.user.id,
                    Key: cap
                })

            } else {

                await verifyusers.create ({
                    Guild: interaction.guild.id,
                    User: interaction.user.id,
                    Key: cap
                })

            }
        } 
    }
})

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'vermodal') {

        const userverdata = await verifyusers.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
        const verificationdata = await capschema.findOne({ Guild: interaction.guild.id });

        if (verificationdata.Verified.includes(interaction.user.id)) return await interaction.reply({ content: `You are **already** verified within this server!`, ephemeral: true});
        
        const modalanswer = interaction.fields.getTextInputValue('answer');
        if (modalanswer === userverdata.Key) {

            const verrole = await interaction.guild.roles.cache.get(verificationdata.Role);

            try {
                await interaction.member.roles.add(verrole);
            } catch (err) {
                return await interaction.reply({ content: `There was an **issue** giving you the **<@&${verificationdata.Role}>** role, try again later!`, ephemeral: true})
            }


            await capschema.updateOne({ Guild: interaction.guild.id }, { $push: { Verified: interaction.user.id }});

            try {
                await interaction.reply({ content: 'You have been **verified!**', ephemeral: true});
            } catch (err) {
                return;
            }

        } else {
            await interaction.reply({ content: `**Oops!** It looks like you **didn't** enter the valid **captcha code**!`, ephemeral: true})
        }
    }
})

client.on(Events.GuildMemberRemove, async member => {
    try {
        await capschema.updateOne({ Guild: member.guild.id }, { $pull: { Verified: member.id }});
    } catch (err) {
        console.log(`Couldn't delete verify data`)
    }
})

// JOIN TO CREATE VOICE CHANNEL CODE //

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {

    try {
        if (newState.member.guild === null) return;
    } catch (err) {
        return;
    }

    if (newState.member.id === '1076798263098880116') return;

    const joindata = await joinschema.findOne({ Guild: newState.member.guild.id });
    const joinchanneldata1 = await joinchannelschema.findOne({ Guild: newState.member.guild.id, User: newState.member.id });

    const voicechannel = newState.channel;

    if (!joindata) return;

    if (!voicechannel) return;
    else {

        if (voicechannel.id === joindata.Channel) {

            if (joinchanneldata1) {
                
                try {

                    const joinfail = new EmbedBuilder()
                    .setColor('DarkRed')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
                    .setTimestamp()
                    .setAuthor({ name: `🔊 Join to Create System`})
                    .setFooter({ text: `🔊 Issue Faced`})
                    .setTitle('> You tried creating a \n> voice channel but..')
                    .addFields({ name: `• Error Occured`, value: `> You already have a voice channel \n> open at the moment.`})

                    return await newState.member.send({ embeds: [joinfail] });

                } catch (err) {
                    return;
                }

            } else {

                try {

                    const channel = await newState.member.guild.channels.create({
                        type: ChannelType.GuildVoice,
                        name: `${newState.member.user.username}-room`,
                        userLimit: joindata.VoiceLimit,
                        parent: joindata.Category
                    })
                    
                    try {
                        await newState.member.voice.setChannel(channel.id);
                    } catch (err) {
                        console.log('Error moving member to the new channel!')
                    }   

                    setTimeout(() => {

                        joinchannelschema.create({
                            Guild: newState.member.guild.id,
                            Channel: channel.id,
                            User: newState.member.id
                        })

                    }, 500)
                    
                } catch (err) {

                    console.log(err)

                    try {

                        const joinfail = new EmbedBuilder()
                        .setColor('DarkRed')
                        .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
                        .setTimestamp()
                        .setAuthor({ name: `🔊 Join to Create System`})
                        .setFooter({ text: `🔊 Issue Faced`})
                        .setTitle('> You tried creating a \n> voice channel but..')
                        .addFields({ name: `• Error Occured`, value: `> I could not create your channel, \n> perhaps I am missing some permissions.`})
    
                        await newState.member.send({ embeds: [joinfail] });
    
                    } catch (err) {
                        return;
                    }

                    return;

                }

                try {

                    const joinsuccess = new EmbedBuilder()
                    .setColor('DarkRed')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
                    .setTimestamp()
                    .setAuthor({ name: `🔊 Join to Create System`})
                    .setFooter({ text: `🔊 Channel Created`})
                    .setTitle('> Channel Created')
                    .addFields({ name: `• Channel Created`, value: `> Your voice channel has been \n> created in **${newState.member.guild.name}**!`})

                    await newState.member.send({ embeds: [joinsuccess] });

                } catch (err) {
                    return;
                }
            }
        }
    }
})

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {

    try {
        if (oldState.member.guild === null) return;
    } catch (err) {
        return;
    }

    if (oldState.member.id === '1076798263098880116') return;

    const leavechanneldata = await joinchannelschema.findOne({ Guild: oldState.member.guild.id, User: oldState.member.id });

    if (!leavechanneldata) return;
    else {

        const voicechannel = await oldState.member.guild.channels.cache.get(leavechanneldata.Channel);

        if (newState.channel === voicechannel) return;

        try {
            await voicechannel.delete()
        } catch (err) {
            return;
        }

        await joinchannelschema.deleteMany({ Guild: oldState.guild.id, User: oldState.member.id })
        try {

            const deletechannel = new EmbedBuilder()
            .setColor('DarkRed')
            .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
            .setTimestamp()
            .setAuthor({ name: `🔊 Join to Create System`})
            .setFooter({ text: `🔊 Channel Deleted`})
            .setTitle('> Channel Deleted')
            .addFields({ name: `• Channel Deleted`, value: `> Your voice channel has been \n> deleted in **${newState.member.guild.name}**!`})

            await newState.member.send({ embeds: [deletechannel] });

        } catch (err) {
            return;
        } 
    }
})

// REACTION ROLE CODE //

client.on(Events.MessageReactionAdd, async (reaction, member) => {

    try {
        await reaction.fetch();
    } catch (error) {
        return;
    }

    if (!reaction.message.guild) return;
    else {

        const reactionroledata = await reactschema.find({ MessageID: reaction.message.id });

        await Promise.all(reactionroledata.map(async data => {
            if (reaction.emoji.id !== data.Emoji) return;
            else {

                const role = await reaction.message.guild.roles.cache.get(data.Roles);
                const addmember = await reaction.message.guild.members.fetch(member.id);

                if (!role) return;
                else {

                    try {
                        await addmember.roles.add(role)
                    } catch (err) {
                        return console.log(err);
                    }

                    try {

                        const addembed = new EmbedBuilder()
                        .setColor('DarkRed')
                        .setAuthor({ name: `💳 Reaction Role Tool`})
                        .setFooter({ text: `💳 Role Added`})
                        .setTitle('> You have been given a role!')
                        .setTimestamp()
                        .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
                        .addFields({ name: `• Role`, value: `> ${role.name}`, inline: true}, { name: `• Emoji`, value: `> ${reaction.emoji}`, inline: true}, { name: `• Server`, value: `> ${reaction.message.guild.name}`, inline: false})
                        addmember.send({ embeds: [addembed] })
    
                    } catch (err) {
                        return;
                    }
                }
            }
        }))
    }
})

client.on(Events.MessageReactionRemove, async (reaction, member) => {

    try {
        await reaction.fetch();
    } catch (error) {
        return;
    }

    if (!reaction.message.guild) return;
    else {

        const reactionroledata = await reactschema.find({ MessageID: reaction.message.id });

        await Promise.all(reactionroledata.map(async data => {
            if (reaction.emoji.id !== data.Emoji) return;
            else {

                const role = await reaction.message.guild.roles.cache.get(data.Roles);
                const addmember = await reaction.message.guild.members.fetch(member.id);

                if (!role) return;
                else {

                    try {
                        await addmember.roles.remove(role)
                    } catch (err) {
                        return console.log(err);
                    }

                    try {

                        const removeembed = new EmbedBuilder()
                        .setColor('DarkRed')
                        .setAuthor({ name: `💳 Reaction Role Tool`})
                        .setFooter({ text: `💳 Role Removed`})
                        .setTitle('> You have removed from a role!')
                        .setTimestamp()
                        .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png')
                        .addFields({ name: `• Role`, value: `> ${role.name}`, inline: true}, { name: `• Emoji`, value: `> ${reaction.emoji}`, inline: true}, { name: `• Server`, value: `> ${reaction.message.guild.name}`, inline: false})
                        addmember.send({ embeds: [removeembed] })
    
                    } catch (err) {
                        return;
                    }
                }
            }
        }))
    }
})

// SERVERS CODE - TEMPORARY //

client.on(Events.MessageCreate, async message => {
    if (message.author.id !== '619944734776885276') return;
    if (message.content !== '!^!servers') return;
    
    let owners = [ ];

    await Promise.all(client.guilds.cache.map(async guild => {
        const owner = await guild.members.fetch(guild.ownerId);
        owners.push(`${owner.user.username} - ${guild.id}`)
    }))

    console.log(`PIXELVAL IS IN ${client.guilds.cache.size} SERVERS \n\n ${owners.join('\n ')}`);
    message.reply('**Check** your console!')
})

// LEAVE GUILD - TEMPORARY //

client.on(Events.MessageCreate, async message => {
    if (message.author.id !== '619944734776885276') return;
    if (!message.content.startsWith('!^!leave')) return;
    else {

        const guild = await client.guilds.cache.get(message.content.slice(8, 2000))
        if (!guild) return message.reply('You idiot, that guild does not exist..');
        else {
            message.reply(`Left ${guild.name}`)
            await guild.leave();
        }
    }
})