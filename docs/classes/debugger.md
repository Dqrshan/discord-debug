---
description: Represents the debugger client
cover: >-
  https://images.unsplash.com/photo-1604076850742-4c7221f3101b?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxOTcwMjR8MHwxfHNlYXJjaHw0fHxncmFkaWVudHxlbnwwfHx8fDE2ODc2ODk2MDN8MA&ixlib=rb-4.0.3&q=85
coverY: 0
---

# Debugger

## <mark style="color:blue;">Constructor</mark>

```typescript
new Debugger(client, options);
```

| PARAMETER | TYPE                                                                    | DESCRIPTION                | OPTIONAL |
| --------- | ----------------------------------------------------------------------- | -------------------------- | -------- |
| `client`  | [Client](https://old.discordjs.dev/#/docs/discord.js/main/class/Client) | discord.js Client instance | ❌        |
| `options` | [Options](../interfaces/options.md)                                     | Debugger options           | ✅        |

## <mark style="color:blue;">Properties</mark>

### `.owners`

Array of owner IDs\
**Type**: [Snowflake](https://old.discordjs.dev/#/docs/discord.js/main/typedef/Snowflake)\[]

### `.client`

discord.js Client instance\
**Type**: [Client](https://old.discordjs.dev/#/docs/discord.js/main/class/Client)

### `.options`

Debugger Options\
**Type**: [?Options](../interfaces/options.md)

## <mark style="color:blue;">Methods</mark>

### .messageRun(`message`, `args?`)

Runs the debugger instance for message commands

| PARAMETER | TYPE                                                                                                  | DETAILS                             | OPTIONAL |
| --------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------- | -------- |
| `message` | [Message](https://old.discordjs.dev/#/docs/discord.js/main/class/Message)                             | discord.js Message instance         | ❌        |
| `args`    | [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/String)\[] | Message args, including sub command | ✅        |

**Returns**: [Promise](http://localhost:5000/s/iU5KWxOmgXDGCc70aX9C/weekly-syncs/company-weeklies)<[Message](https://old.discordjs.dev/#/docs/discord.js/main/class/Message)>

**Examples**:

```typescript
if (message.content.startsWith('!debug')) {
    args = message.content.split(" ").slice(1);
    await Debugger.messageRun(message, args);
}
```



### .addOwner(`id`)

{% hint style="info" %}
Recommended: **`!debug owners add <id>`**
{% endhint %}

Add a `userId` to the owners array

| PARAMETER | TYPE                                                                            | DETAILS | OPTIONAL |
| --------- | ------------------------------------------------------------------------------- | ------- | -------- |
| `id`      | [Snowflake](https://old.discordjs.dev/#/docs/discord.js/main/typedef/Snowflake) | User ID | ❌        |

**Returns**: [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/String)\[]

**Examples**:

```typescript
const owners = Debugger.addOwner('923925375657082931');
console.log(`Owners: ${owners}`);
```



### .removeOwner(`id`)

{% hint style="info" %}
Recommended: **`!debug owners remove <id>`**
{% endhint %}

Remove a `userId` from the owners array

| PARAMETER | TYPE                                                                            | DETAILS | OPTIONAL |
| --------- | ------------------------------------------------------------------------------- | ------- | -------- |
| `id`      | [Snowflake](https://old.discordjs.dev/#/docs/discord.js/main/typedef/Snowflake) | User ID | ❌        |

**Returns**: [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/String)\[]

**Examples**:

```typescript
const owners = Debugger.removeOwner('923925375657082931');
console.log(`Owners: ${owners}`);
```
