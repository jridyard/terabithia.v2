# Terabithia.js

![Terabithia Logo](./images/icon.png)

## A Seamless Bridge Between Contexts For Browser Extensions

Terabithia.js is a powerful framework that enables seamless asynchronous communication between the ISOLATED and MAIN
execution contexts for browser extensions. This solves one of the most challenging aspects of browser extension
development - accessing and manipulating page-level JavaScript from isolated extension contexts.

[![Version](https://img.shields.io/badge/version-2.0.1-brightgreen.svg)](https://github.com/yourusername/terabithia.js)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌉 What is Terabithia?

Modern browser extensions operate in different execution contexts for security and reliability reasons:

-   **ISOLATED context**: Where most of your extension code runs, but can't access the webpage's JavaScript environment
-   **MAIN context**: The webpage's JavaScript environment, where React, Angular, and other frameworks operate

Terabithia creates a bridge between these worlds, allowing you to:

-   Trigger React events from your extension
-   Access React component properties
-   Execute code in either context and receive responses asynchronously
-   Create a unified API that works seamlessly across contexts

## 🚀 Features

-   **Promise-based API**: All cross-context communication is fully asynchronous with proper Promise support
-   **Bidirectional Communication**: Execute functions in either context and get responses back
-   **React Integration**: First-class support for accessing and interacting with React components
-   **Type Safety**: Clean, predictable interfaces for cross-context communication
-   **Extensible**: Create custom handlers and extend functionality as needed
-   **Lightweight**: Minimal overhead for your extension

## 📦 Installation

1. Add the "terabithia" folder to your project
2. Configure your `manifest.json` to load the Terabithia scripts:

```json
"content_scripts": [
    {
        "matches": ["<all_urls>"],
        "js": ["terabithia/terabithia-ISOLATED.js"],
        "world": "ISOLATED"
    },
    {
        "matches": ["<all_urls>"],
        "js": ["terabithia/terabithia-MAIN.js"],
        "world": "MAIN"
    }
]
```

3. Create a bridge folder for specific website targets (optional)
4. Add site-specific bridge files to your content scripts (if needed)

## 🔧 Usage

### Basic Communication

From ISOLATED context to MAIN:

```javascript
// Execute a function in MAIN context
TerabithiaBridge[TERABITHIA_BRIDGE_ID].executeInMain('functionName', {
    parameter1: 'value1',
    parameter2: 'value2'
}).then((response) => {
    console.log('Response from MAIN:', response);
});
```

From MAIN context to ISOLATED:

```javascript
// Execute a function in ISOLATED context
TerabithiaBridge[TERABITHIA_BRIDGE_ID].executeInIsolated('functionName', {
    parameter1: 'value1',
    parameter2: 'value2'
}).then((response) => {
    console.log('Response from ISOLATED:', response);
});
```

### Adding Custom Handlers

In ISOLATED context:

```javascript
window.TerabithiaBridge[TERABITHIA_BRIDGE_ID].addHandlers({
    myCustomFunction: (data) => {
        console.log('Received data:', data);
        return {
            success: true,
            data: 'Response from ISOLATED context'
        };
    }
});
```

In MAIN context:

```javascript
window.TerabithiaBridge[TERABITHIA_BRIDGE_ID].addHandlers({
    myCustomFunction: (data) => {
        console.log('Received data:', data);
        return {
            success: true,
            data: 'Response from MAIN context'
        };
    }
});
```

### React Integration

```javascript
// Get React props from an element
const element = document.querySelector('.some-element');
const reactProps = await TerabithiaBridge[TERABITHIA_BRIDGE_ID].helpers.getReactProps(element);

// Trigger a React event
await TerabithiaBridge[TERABITHIA_BRIDGE_ID].helpers.triggerReactEvent(element, 'onClick');
```

## 📚 API Reference

### Core Methods

| Method                             | Context  | Description                                             |
| ---------------------------------- | -------- | ------------------------------------------------------- |
| `executeInMain(command, data)`     | ISOLATED | Executes a function in the MAIN context                 |
| `executeInIsolated(command, data)` | MAIN     | Executes a function in the ISOLATED context             |
| `addHandlers(handlersObj)`         | Both     | Registers handler functions for cross-context execution |

### Helper Methods

| Method                                           | Context  | Description                               |
| ------------------------------------------------ | -------- | ----------------------------------------- |
| `helpers.triggerReactEvent(element, event)`      | ISOLATED | Triggers a React event on an element      |
| `helpers.getReactProps(element, reactKeyPrefix)` | ISOLATED | Gets React properties from an element     |
| `helpers.getReactKey(element, reactKeyPrefix)`   | MAIN     | Gets the React key from an element        |
| `helpers.getReactProps(element, reactKeyPrefix)` | MAIN     | Gets React properties in the MAIN context |

## 🛠️ Advanced Usage

### Custom Bridge for Specific Websites

1. Create a bridge folder for your target website
2. Add ISOLATED.js and MAIN.js files with custom handlers
3. Add them to your manifest:

```json
"content_scripts": [
    {
        "matches": ["https://example.com/*"],
        "js": ["example.com/bridge/ISOLATED.js"],
        "world": "ISOLATED"
    },
    {
        "matches": ["https://example.com/*"],
        "js": ["example.com/bridge/MAIN.js"],
        "world": "MAIN"
    }
]
```

### Response Format

All functions should return an object with:

```javascript
{
    success: true|false,
    message: "Optional message",
    data: "Any data to return"
}
```

## ⚠️ Common Pitfalls

1. **Function Availability**: `TerabithiaBridge[TERABITHIA_BRIDGE_ID].functions` are only available after bridge
   initialization. Use direct execution method if unsure.

2. **Script Ordering**: All bridge scripts must be placed above your core scripts in your manifest.

3. **Data Serialization**: Only JSON-serializable data can be passed between contexts. Functions and complex objects
   will simply fail to send and it will not throw any errors. BE AWARE OF THIS OR YOU WILL BE VERY CONFUSED WHEN THAT
   HAPPENS!

## 📄 License

[MIT License](LICENSE)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](#).

---

Created by Joe Ridyard
