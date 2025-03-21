(async () => {
    /**
     * Terabithia Bridge - ISOLATED CONTEXT
     * Script that runs in the ISOLATED context (content script)
     */

    // Extension Identifier
    const TERABITHIA_BRIDGE_ID = 'TERABITHIA_EXTENSION';
    // Extension Identifier

    const CONTEXT = 'ISOLATED';
    const COUNTERPART = 'MAIN';

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
                    // Send message to main context to add the handler as a function
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

    // Function to send commands to main context
    bridge.executeInMain = async function (command, data = {}) {
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

    // Helpers for common operations
    bridge.helpers = {
        // Trigger React event on an element
        triggerReactEvent: async (element, event) => {
            if (!element) {
                return {
                    success: false,
                    message: 'No element provided'
                };
            }

            // Create temporary unique ID for targeting
            const targetId = `terabithia-${crypto.randomUUID()}`;
            element.setAttribute('data-terabithia-target', targetId);

            // Execute in main context
            const result = await bridge.executeInMain('triggerReactEvent', {
                selector: `[data-terabithia-target="${targetId}"]`,
                event,
                type: 'default-command'
            });

            // Clean up
            element.removeAttribute('data-terabithia-target');
            return result;
        },

        // Get React properties from an element
        getReactProps: async (element, reactKeyPrefix = '__reactProps') => {
            if (!element) {
                return {
                    success: false,
                    message: 'No element provided'
                };
            }

            // Create temporary unique ID for targeting
            const targetId = `terabithia-${crypto.randomUUID()}`;
            element.setAttribute('data-terabithia-target', targetId);

            // Execute in main context
            const result = await bridge.executeInMain('getReactProps', {
                selector: `[data-terabithia-target="${targetId}"]`,
                reactKeyPrefix,
                type: 'default-command'
            });

            // Clean up
            element.removeAttribute('data-terabithia-target');
            return result;
        }
    };

    // Listen for incoming messages from the main context
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

        // Commands handled in ISOLATED context
        // Handle different commands
        if (type === 'default-command') {
            switch (command) {
                case 'addFunction':
                    bridge.functions[data.handlerName] = async (json = {}) => {
                        return await bridge.executeInMain(data.handlerName, json);
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
