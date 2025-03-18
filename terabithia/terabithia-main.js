(async () => {
    /**
     * Terabithia Bridge - MAIN CONTEXT
     * Script that runs in the MAIN context (page context)
     */

    // Extension Identifier
    const TERABITHIA_BRIDGE_ID = 'TERABITHIA_EXTENSION';
    // Extension Identifier

    const CONTEXT = 'MAIN';
    const COUNTERPART = 'ISOLATED';

    // Logging prefix
    const LOG_PREFIX = `[TerabithiaBridge:${TERABITHIA_BRIDGE_ID}]`;

    // Create the bridge object specific to this context
    // Ensure TerabithiaBridge exists as a container
    if (!window.TerabithiaBridge) {
        window.TerabithiaBridge = {};
    }

    // Create or get the bridge for this extension
    if (!window.TerabithiaBridge[TERABITHIA_BRIDGE_ID]) {
        window.TerabithiaBridge[TERABITHIA_BRIDGE_ID] = {
            functions: {}, // When a handler is added, we will send a message to the counterpart and it will be added as a function to call directly
            handlers: {}, // Custom handler functions; Users can generate these in a separate script
            addHandlers: (handlers = {}) => {
                if (!window.TerabithiaBridge[TERABITHIA_BRIDGE_ID]) {
                    console.error(
                        'Could not add handler to TerabithiaBridge. Extension not found: ',
                        TERABITHIA_BRIDGE_ID
                    );
                    return;
                }
                // go through keys in handlers and set to window.TerabithiaBridge[extensionId].handlers object 1 at a time
                Object.entries(handlers).forEach(([handlerName, handlerCallback]) => {
                    window.TerabithiaBridge[TERABITHIA_BRIDGE_ID].handlers[handlerName] = handlerCallback;
                    // Send message to isolated context to add the handler as a function
                    window.postMessage(
                        {
                            source: TERABITHIA_BRIDGE_ID,
                            context: CONTEXT,
                            type: 'default-command',
                            command: 'addFunction',
                            data: {
                                handlerName
                            }
                        },
                        '*'
                    );
                });
            }
        };
    } else {
        console.error(
            `${TERABITHIA_BRIDGE_ID}: TerabithiaBridge already exists for this Extension ID. You are attempting to insert the TERABITHIA framework more than once or another extension is conflicting with yours.`
        );
    }

    const bridge = window.TerabithiaBridge[TERABITHIA_BRIDGE_ID];

    // Function to send commands to isolated context
    bridge.executeInIsolated = async function (command, data = {}) {
        return new Promise((resolve) => {
            // Generate unique message ID for this request
            const messageId = crypto.randomUUID();

            // Create message payload
            const payload = {
                source: TERABITHIA_BRIDGE_ID,
                context: CONTEXT,
                messageId,
                command,
                data
            };

            // Listen for response with matching messageId
            const responseHandler = (event) => {
                // Verify message source
                if (
                    event.data?.source !== TERABITHIA_BRIDGE_ID ||
                    event.data?.context !== COUNTERPART ||
                    event.data?.messageId !== messageId
                ) {
                    return;
                }

                // Remove listener and resolve promise with response data
                window.removeEventListener('message', responseHandler);
                resolve(event.data.response);
            };

            // Add listener and send message
            window.addEventListener('message', responseHandler);
            window.postMessage(payload, '*');
        });
    };

    // Helpers for React interactions
    bridge.helpers = {
        // Get React key
        getReactKey: (element, reactKeyPrefix = '__reactProps') => {
            if (!element) return null;
            return Object.keys(element).find((key) => key.startsWith(reactKeyPrefix));
        },

        // Get React properties
        getReactProps: (element, reactKeyPrefix = '__reactProps') => {
            const reactKey = bridge.helpers.getReactKey(element, reactKeyPrefix);
            return element?.[reactKey];
        }
    };

    // MAIN CONTEXT HELPER FUNCTIONS
    function handleTriggerReactEvent(data) {
        const { selector, event } = data;

        if (!selector) {
            return {
                success: false,
                message: 'Missing selector for React event'
            };
        }

        if (!event) {
            return {
                success: false,
                message: 'Missing event name for React event'
            };
        }

        try {
            const element = document.querySelector(selector);
            if (!element) {
                return {
                    success: false,
                    message: `Element not found: ${selector}`
                };
            }

            const reactProps = window.TerabithiaBridge[TERABITHIA_BRIDGE_ID].helpers.getReactProps(element);
            if (!reactProps) {
                return {
                    success: false,
                    message: `No React properties found on element: ${selector}`
                };
            }

            const eventHandler = reactProps[event];
            if (typeof eventHandler !== 'function') {
                return {
                    success: false,
                    message: `No event handler found for '${event}' on element: ${selector}`
                };
            }

            eventHandler(new Event(''));
            return {
                success: true,
                message: `Successfully triggered ${event} on ${selector}`
            };
        } catch (error) {
            return {
                success: false,
                message: `Error triggering React event: ${error.message}`
            };
        }
    }

    // Get React properties from an element in page context
    // ... then serialize it in a format that can be sent BACK to ISOLATED context
    function handleGetReactProps(data) {
        const { selector, reactKeyPrefix } = data;

        if (!selector) {
            return {
                success: false,
                message: 'Missing selector for getting React properties'
            };
        }

        try {
            const element = document.querySelector(selector);
            if (!element) {
                return {
                    success: false,
                    message: `Element not found: ${selector}`
                };
            }

            const reactProps = window.TerabithiaBridge[TERABITHIA_BRIDGE_ID].helpers.getReactProps(
                element,
                reactKeyPrefix
            );
            if (!reactProps) {
                return {
                    success: false,
                    message: `No React properties found on element: ${selector}`
                };
            }

            // Filter out function properties as they can't be serialized
            const serializable = Object.entries(reactProps).reduce((acc, [key, value]) => {
                if (typeof value !== 'function') {
                    acc[key] = value;
                }
                return acc;
            }, {});

            return {
                success: true,
                data: serializable
            };
        } catch (error) {
            return {
                success: false,
                message: `Error getting React properties: ${error.message}`
            };
        }
    }

    // Add handlers to the bridge
    bridge.handlers.triggerReactEvent = handleTriggerReactEvent;
    bridge.handlers.getReactProps = handleGetReactProps;

    // Listen for incoming messages from the isolated context
    window.addEventListener('message', async (event) => {
        // Verify the message source
        if (event.data?.source !== TERABITHIA_BRIDGE_ID || event.data?.context !== COUNTERPART) {
            return;
        }

        const { messageId, command, data, type } = event.data;
        let response = {
            success: false,
            message: `Unknown command: ${command}`
        };

        // Handle different commands
        if (type === 'default-command') {
            switch (command) {
                case 'addFunction':
                    bridge.functions[data.handlerName] = async (json = {}) => {
                        return await bridge.executeInIsolated(data.handlerName, json);
                    };
                    response = {
                        success: true,
                        message: `Function added: ${data.handlerName}`
                    };
                    break;
            }
        } else if (bridge.handlers[command]) {
            try {
                response = await bridge.handlers[command](data);
            } catch (error) {
                response = {
                    success: false,
                    message: `Error executing command ${command}: ${error.message}`
                };
            }
        }

        // Send response back to counterpart context
        window.postMessage(
            {
                source: TERABITHIA_BRIDGE_ID,
                context: CONTEXT,
                messageId,
                response
            },
            '*'
        );
    });

    console.debug(`${LOG_PREFIX} ${CONTEXT} context bridge initialized`);
})();
