---
description: Options required for the Debugger client
cover: >-
  https://images.unsplash.com/photo-1604076850742-4c7221f3101b?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxOTcwMjR8MHwxfHNlYXJjaHw0fHxncmFkaWVudHxlbnwwfHx8fDE2ODc2ODk2MDN8MA&ixlib=rb-4.0.3&q=85
coverY: 0
---

# Options

### <mark style="color:blue;">Properties</mark>

<table><thead><tr><th width="200">PARAMETER</th><th>TYPE</th><th>DETAILS</th><th>DEFAULT</th></tr></thead><tbody><tr><td><code>themeColor</code></td><td>#<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a></td><td>Color used in all embed responses</td><td><strong><code>#000000</code></strong></td></tr><tr><td><code>owners</code></td><td><a href="https://old.discordjs.dev/#/docs/discord.js/main/typedef/Snowflake">Snowflake</a>[]</td><td>User IDs that can use this tool</td><td>Application Owner(s)</td></tr><tr><td><code>secrets</code></td><td>any[]</td><td>Secrest to hide during eval</td><td><strong><code>[client.token]</code></strong></td></tr><tr><td><code>registerApplicationCommands</code></td><td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a></td><td>Whether to register slash command (<code>/debug</code>)</td><td><strong><code>false</code></strong></td></tr><tr><td><code>loadDefaultListeners</code></td><td><a href="defaultlisteners.md">DefaultListeners</a></td><td>Customize which events to listen to</td><td><a href="defaultlisteners.md">click here</a></td></tr><tr><td><code>sqlConnectionOptions</code></td><td><a href="https://github.com/mysqljs/mysql#connection-options">ConnectionOptions</a></td><td>MySQL Connection Options</td><td><strong><code>{}</code></strong></td></tr></tbody></table>
