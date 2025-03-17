(async () => {
    /**
     * Terabithia Bridge
     * Universal script that works in both MAIN and ISOLATED contexts
     */

    console.log('running...');

    // Extension Identifier
    const EXTENSION_ID = 'TERABITHIA_EXTENSION';
    const TERABITHIA_FRAMEWORK_FILE_PATH = 'terabithia.js';

    // Detect if we're in the isolated context (content script)
    const IS_ISOLATED = typeof chrome !== 'undefined' && chrome.runtime?.id !== undefined;
    const CONTEXT = IS_ISOLATED ? 'ISOLATED' : 'MAIN';
    const COUNTERPART = IS_ISOLATED ? 'MAIN' : 'ISOLATED';

    // Logging prefix
    const LOG_PREFIX = `[TerabithiaBridge:${EXTENSION_ID}]`;
    // console.debug(`${LOG_PREFIX} Initializing in ${CONTEXT} context`);

    // awaiuit random delay of 1-5 seconds
    // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    // const randomDelay = async () => {
    //     const ms = Math.floor(Math.random() * 5000) + 1000;
    //     await delay(ms);
    // };
    // await randomDelay();

    // Create the bridge object specific to this context
    // Ensure TerabithiaBridge exists as a container
    if (!window.TerabithiaBridge) {
        window.TerabithiaBridge = {};
    }

    // Create or get the bridge for this extension
    if (!window.TerabithiaBridge[EXTENSION_ID]) {
        window.TerabithiaBridge[EXTENSION_ID] = {
            handlers: {}, // Custom handler functions; Users can generate these in a separate script
            addHandlers: (handlers = {}) => {
                if (!window.TerabithiaBridge[EXTENSION_ID]) {
                    console.error('Could not add handler to TerabithiaBridge. Extension not found: ', EXTENSION_ID);
                    return;
                }
                // go through keys in handlers and set to window.TerabithiaBridge[extensionId].handlers object 1 at a time
                Object.entries(handlers).forEach(([handlerName, handlerCallback]) => {
                    window.TerabithiaBridge[EXTENSION_ID].handlers[handlerName] = handlerCallback;
                });
            }
        };
    } else {
        console.error(
            `${EXTENSION_ID}: TerabithiaBridge already exists for this Extension ID. You are attempting to insert the TERABITHIA framework more than once or another extension is conflicting with yours.`
        );
    }

    const bridge = window.TerabithiaBridge[EXTENSION_ID];

    if (IS_ISOLATED) {
        // ISOLATED CONTEXT IMPLEMENTATION

        // Function to send commands to main context
        bridge.executeInMain = async function (command, data = {}) {
            return new Promise((resolve) => {
                // Generate unique message ID for this request
                const messageId = crypto.randomUUID();

                // Create message payload
                const payload = {
                    source: EXTENSION_ID,
                    context: CONTEXT,
                    messageId,
                    command,
                    data
                };

                // Listen for response with matching messageId
                const responseHandler = (event) => {
                    // Verify message source
                    if (
                        event.data?.source !== EXTENSION_ID ||
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
                    event
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
                const result = await bridge.executeInMain('getReactProperties', {
                    selector: `[data-terabithia-target="${targetId}"]`,
                    reactKeyPrefix
                });

                // Clean up
                element.removeAttribute('data-terabithia-target');
                return result;
            }
        };

        // REMOVED INJECTION AND SIMPLIFIED; NOW TERABITHIA IS LOADED DIRECTLY INTO MAIN FROM MANIFEST
        // // Inject this same script into the main context
        // function injectMainScript() {
        //     const script = document.createElement('script');
        //     script.src = chrome.runtime.getURL(TERABITHIA_FRAMEWORK_FILE_PATH);
        //     script.onload = function () {
        //         this.remove();
        //     };
        //     (document.head || document.documentElement).appendChild(script);
        // }

        // // Initialize the bridge
        // injectMainScript();
        console.log('ISOLATED CONTEXT');
    } else {
        // MAIN CONTEXT IMPLEMENTATION
        console.log('MAIN CONTEXT');

        // Function to send commands to isolated context
        bridge.executeInIsolated = async function (command, data = {}) {
            return new Promise((resolve) => {
                // Generate unique message ID for this request
                const messageId = crypto.randomUUID();

                // Create message payload
                const payload = {
                    source: EXTENSION_ID,
                    context: CONTEXT,
                    messageId,
                    command,
                    data
                };

                // Listen for response with matching messageId
                const responseHandler = (event) => {
                    // Verify message source
                    if (
                        event.data?.source !== EXTENSION_ID ||
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

        bridge.handlers.triggerReactEvent = handleTriggerReactEvent;
        bridge.handlers.getReactProps = handleGetReactProps;
    }

    // SHARED CODE FOR BOTH CONTEXTS

    // Listen for incoming messages from the counterpart context
    window.addEventListener('message', async (event) => {
        // Verify the message source
        if (event.data?.source !== EXTENSION_ID || event.data?.context !== COUNTERPART) {
            return;
        }

        const { messageId, command, data } = event.data;
        let response = {
            success: false,
            message: `Unknown command: ${command}`
        };

        // Handle different commands
        if (CONTEXT === 'MAIN') {
            // Commands handled in MAIN context
            if (
                window.TerabithiaBridge[EXTENSION_ID].handlers &&
                typeof window.TerabithiaBridge[EXTENSION_ID].handlers[command] === 'function'
            ) {
                try {
                    response = await window.TerabithiaBridge[EXTENSION_ID].handlers[command](data);
                } catch (error) {
                    response = {
                        success: false,
                        message: `Error executing command ${command}: ${error.message}`
                    };
                }
            }
        } else {
            // Commands handled in ISOLATED context
            // Check for custom handler functions
            if (
                window.TerabithiaBridge[EXTENSION_ID].handlers &&
                typeof window.TerabithiaBridge[EXTENSION_ID].handlers[command] === 'function'
            ) {
                try {
                    response = await window.TerabithiaBridge[EXTENSION_ID].handlers[command](data);
                } catch (error) {
                    response = {
                        success: false,
                        message: `Error executing command ${command}: ${error.message}`
                    };
                }
            }
        }

        // Send response back to counterpart context
        window.postMessage(
            {
                source: EXTENSION_ID,
                context: CONTEXT,
                messageId,
                response
            },
            '*'
        );
    });

    // MAIN CONTEXT HELPER FUNCTIONS
    function handleTriggerReactEvent(data) {
        if (CONTEXT !== 'MAIN') return { success: false, message: 'Function only available in MAIN context' };

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

            const reactProps = window.TerabithiaBridge[EXTENSION_ID].helpers.getReactProps(element);
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
        if (CONTEXT !== 'MAIN') return { success: false, message: 'Function only available in MAIN context' };

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

            const reactProps = window.TerabithiaBridge[EXTENSION_ID].helpers.getReactProps(element, reactKeyPrefix);
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

    console.debug(`${LOG_PREFIX} ${CONTEXT} context bridge initialized`);
})();
