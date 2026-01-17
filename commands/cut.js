const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "cut",
    description: "Add / Remove command shortcuts",
    enable: true,
    shortcuts: [],

    async execute(client, message, args) {
        const owners = require("../data/owners.json");

        if (
            message.author.id !== owners.owner &&
            !owners.owners.includes(message.author.id)
        ) return;

        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        const command = client.commands.get(commandName);
        if (!command) return;

        const shortcuts = args.map(s => s.toLowerCase());
        if (!shortcuts.length) return;

        const cfgPath = path.join("./data/configs", `${commandName}.json`);
        if (!fs.existsSync(cfgPath)) return;

        const cfg = JSON.parse(fs.readFileSync(cfgPath));

        if (!Array.isArray(cfg.shortcuts))
            cfg.shortcuts = [];

        const added = [];
        const removed = [];

        for (const sc of shortcuts) {
            if (cfg.shortcuts.includes(sc)) {
                cfg.shortcuts = cfg.shortcuts.filter(x => x !== sc);
                removed.push(sc);
            } else {
                cfg.shortcuts.push(sc);
                added.push(sc);
            }
        }

        fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));

        // تحديث الكوماند بالذاكرة
        command.shortcuts = cfg.shortcuts;

        const embed = new EmbedBuilder()
            .setTitle("Shortcut Update")
            .setColor(0x57F287)
            .addFields(
                { name: "Command", value: commandName, inline: true },
                {
                    name: "Added",
                    value: added.length ? added.join(", ") : "None",
                    inline: true
                },
                {
                    name: "Removed",
                    value: removed.length ? removed.join(", ") : "None",
                    inline: true
                }
            );

        message.reply({ embeds: [embed] });
    }
};
