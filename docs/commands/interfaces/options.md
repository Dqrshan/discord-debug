---
description: Options required for the Debugger client
cover: >-
    https://images.unsplash.com/photo-1604076850742-4c7221f3101b?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxOTcwMjR8MHwxfHNlYXJjaHw0fHxncmFkaWVudHxlbnwwfHx8fDE2ODc2ODk2MDN8MA&ixlib=rb-4.0.3&q=85
coverY: 0
---

# Options

## <mark style="color:green;">Properties</mark>

| PARAMETER                     | TYPE                                                                                                | DETAILS                       | OPTIONAL | DEFAULT              |
| ----------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------- | -------- | -------------------- |
| `secrets`                     | any\[]                                                                                              | Secrets to hide during eval   | ✅       | `[client.token]`     |
| `owners`                      | [Snowflake](https://old.discordjs.dev/#/docs/discord.js/main/typedef/Snowflake)\[]                  | Owners that can use this tool | ✅       | Application owner(s) |
| `registerApplicationCommands` | [boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean) | Integrate slash commands      | ✅       | `false`              |
