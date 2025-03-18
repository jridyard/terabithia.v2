(() => {
    const TERABITHIA_BRIDGE_ID = 'TERABITHIA_EXTENSION';

    window.TerabithiaBridge[TERABITHIA_BRIDGE_ID].addHandlers({
        helloIsolated
    });

    function helloIsolated(messageFromIsolatedContext) {
        console.log('Hello from isolated context (logged in main): ', messageFromIsolatedContext);
        return {
            success: true,
            message: 'Hello from main context!'
        };
    }
})();
