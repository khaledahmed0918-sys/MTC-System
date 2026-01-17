const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ComponentType
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "per",
    description: "Manage permissions",
    enable: true,
    shortcuts: [],

    async execute(client, message, args) {
        const owners = require("../data/owners.json");
        if (
            message.author.id !== owners.owner &&
            !owners.owners.includes(message.author.id)
        ) return;

        const target =
            message.mentions.users.first() ||
            message.mentions.roles.first() ||
            message.guild.members.cache.get(args[0]) ||
            message.guild.roles.cache.get(args[0]);

        if (!target) return;

        const isRole = !!target.id && !!target.members;
        const id = target.id;

        const commands = [...client.commands.values()]
            .filter(c => c.name !== "help");

        const configsPath = "./data/configs";
        const rows = [];
        let index = 0;

        while (index < commands.length) {
            const slice = commands.slice(index, index + 25);
            const menu = new StringSelectMenuBuilder()
                .setCustomId(`per_${index}`)
                .setMinValues(1)
                .setMaxValues(slice.length)
                .setPlaceholder("اختر الأوامر");

            for (const cmd of slice) {
                const cfg = JSON.parse(
                    fs.readFileSync(path.join(configsPath, `${cmd.name}.json`))
                );

                const has = isRole
                    ? cfg.allowedRoles.includes(id)
                    : cfg.allowedUsers.includes(id);

                menu.addOptions({
                    label: cmd.name,
                    value: cmd.name,
                    emoji: has ? "✅" : "❌"
                });
            }

            rows.push(new ActionRowBuilder().addComponents(menu));
            index += 25;
        }

        const embed = new EmbedBuilder()
            .setTitle("Permissions")
            .setDescription(
                `Target: **${target.name || target.user?.username}**`
            )
            .setColor(0x5865F2);

        const msg = await message.reply({
            embeds: [embed],
            components: rows
        });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 0
        });

        collector.on("collect", async i => {
            if (i.user.id !== message.author.id)
                return i.deferUpdate();

            for (const cmdName of i.values) {
                const cfgPath = path.join(configsPath, `${cmdName}.json`);
                const cfg = JSON.parse(fs.readFileSync(cfgPath));

                if (isRole) {
                    cfg.allowedRoles.includes(id)
                        ? cfg.allowedRoles = cfg.allowedRoles.filter(r => r !== id)
                        : cfg.allowedRoles.push(id);
                } else {
                    cfg.allowedUsers.includes(id)
                        ? cfg.allowedUsers = cfg.allowedUsers.filter(u => u !== id)
                        : cfg.allowedUsers.push(id);
                }

                fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
            }

            const newRows = [];
            let idx = 0;

            while (idx < commands.length) {
                const slice = commands.slice(idx, idx + 25);
                const menu = new StringSelectMenuBuilder()
                    .setCustomId(`per_${idx}`)
                    .setMinValues(1)
                    .setMaxValues(slice.length)
                    .setPlaceholder("اختر الأوامر");

                for (const cmd of slice) {
                    const cfg = JSON.parse(
                        fs.readFileSync(path.join(configsPath, `${cmd.name}.json`))
                    );

                    const has = isRole
                        ? cfg.allowedRoles.includes(id)
                        : cfg.allowedUsers.includes(id);

                    menu.addOptions({
                        label: cmd.name,
                        value: cmd.name,
                        emoji: has ? "✅" : "❌"
                    });
                }

                newRows.push(new ActionRowBuilder().addComponents(menu));
                idx += 25;
            }

            await i.update({
                embeds: [embed],
                components: newRows
            });
        });
    }
};
