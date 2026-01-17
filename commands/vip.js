const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require("discord.js");
const fs = require("fs");

module.exports = {
    name: "vip",
    description: "Bot Control Panel",
    enable: true,
    shortcuts: [],

    async execute(client, message) {
        const ownersPath = "./data/owners.json";
        const botPath = "./data/bot.json";
        const configPath = "./config.js";

        const owners = require("../data/owners.json");
        if (
            message.author.id !== owners.owner &&
            !owners.owners.includes(message.author.id)
        ) return;

        const bot = require("../data/bot.json");

        const embed = new EmbedBuilder()
            .setTitle("VIP Panel")
            .setColor(bot.color)
            .addFields(
                { name: "Bot Name", value: bot.name, inline: true },
                { name: "Servers", value: `${client.guilds.cache.size}`, inline: true },
                { name: "Commands", value: `${client.commands.size}`, inline: true },
                { name: "Owners", value: `${owners.owners.length + 1}`, inline: true },
                { name: "Main Owner", value: `<@${owners.owner}>`, inline: true }
            );

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("owner").setLabel("Add/Rem Owner").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("owners").setLabel("Owners").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("name").setLabel("Set Name").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("avatar").setLabel("Set Avatar").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("banner").setLabel("Set Banner").setStyle(ButtonStyle.Primary)
        );

        const buttons2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("prefix").setLabel("Set Prefix").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("status").setLabel("Set Stats").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("restart").setLabel("Restart Bot").setStyle(ButtonStyle.Danger)
        );

        const msg = await message.reply({
            embeds: [embed],
            components: [buttons, buttons2]
        });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 0
        });

        collector.on("collect", async i => {
            if (i.user.id !== message.author.id)
                return i.reply({ content: "❌", ephemeral: true });

            /* ADD / REMOVE OWNER */
            if (i.customId === "owner") {
                if (i.user.id !== owners.owner)
                    return i.reply({ content: "❌", ephemeral: true });

                await i.reply({ content: "ارسل منشن او ID", ephemeral: true });

                const filter = m => m.author.id === message.author.id;
                const collected = await message.channel.awaitMessages({ filter, max: 1 });

                for (const id of collected.first().content.match(/\d+/g)) {
                    owners.owners.includes(id)
                        ? owners.owners = owners.owners.filter(o => o !== id)
                        : owners.owners.push(id);
                }

                fs.writeFileSync(ownersPath, JSON.stringify(owners, null, 2));
            }

            /* OWNERS LIST */
            if (i.customId === "owners") {
                return i.reply({
                    content: `👑 <@${owners.owner}>\n${owners.owners.map(o => `<@${o}>`).join("\n")}`,
                    ephemeral: true
                });
            }

            /* SET NAME */
            if (i.customId === "name") {
                await i.reply({ content: "ارسل اسم البوت الجديد", ephemeral: true });
                const m = (await message.channel.awaitMessages({ max: 1 })).first();
                bot.name = m.content;
                fs.writeFileSync(botPath, JSON.stringify(bot, null, 2));
                await client.user.setUsername(bot.name);
            }

            /* SET AVATAR */
            if (i.customId === "avatar") {
                await i.reply({ content: "ارسل صورة الافتار", ephemeral: true });
                const m = (await message.channel.awaitMessages({ max: 1 })).first();
                if (!m.attachments.first()) return;
                await client.user.setAvatar(m.attachments.first().url);
            }

            /* SET BANNER */
            if (i.customId === "banner") {
                await i.reply({ content: "ارسل صورة البنر", ephemeral: true });
                const m = (await message.channel.awaitMessages({ max: 1 })).first();
                if (!m.attachments.first()) return;
                await client.user.setBanner(m.attachments.first().url);
            }

            /* PREFIX */
            if (i.customId === "prefix") {
                await i.reply({ content: "ارسل البرفكس الجديد", ephemeral: true });
                const m = (await message.channel.awaitMessages({ max: 1 })).first();
                fs.writeFileSync(
                    configPath,
                    `module.exports = { token: "${client.config.token}", prefix: "${m.content}" }`
                );
                client.config.prefix = m.content;
            }

            /* STATUS */
            if (i.customId === "status") {
                await i.reply({ content: "ارسل الحالة", ephemeral: true });
                const m = (await message.channel.awaitMessages({ max: 1 })).first();
                bot.status.text = m.content;
                fs.writeFileSync(botPath, JSON.stringify(bot, null, 2));
                client.user.setActivity(bot.status.text, { type: bot.status.type });
            }

            /* RESTART */
            if (i.customId === "restart") {
                await i.reply({ content: "🔁 Restarting...", ephemeral: true });
                process.exit(0);
            }
        });
    }
};
