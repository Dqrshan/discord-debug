---
description: Options required for the Debugger client
cover: >-
  https://images.unsplash.com/photo-1604079628040-94301bb21b91?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxOTcwMjR8MHwxfHNlYXJjaHw5fHxjb2xvcnxlbnwwfHx8fDE2ODc2OTA3NTJ8MA&ixlib=rb-4.0.3&q=85
coverY: 43
---

# Options

## <mark style="color:green;">Properties</mark>

| PARAMETER                     | TYPE                                                                                                 | DETAILS                       | OPTIONAL | DEFAULT              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------- | -------- | -------------------- |
| `secrets`                     | any\[]                                                                                               | Secrets to hide during eval   | ✅        | `[client.token]`     |
| `owners`                      | [Snowflake](https://old.discordjs.dev/#/docs/discord.js/main/typedef/Snowflake)\[]                   | Owners that can use this tool | ✅        | Application owner(s) |
| `registerApplicationCommands` | [boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Boolean) | Integrate slash commands      | ✅        | `false`              |
