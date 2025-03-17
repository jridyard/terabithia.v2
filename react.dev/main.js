(() => {
    const EXTENSION_ID = 'TERABITHIA_EXTENSION';
    window.TerabithiaBridge[EXTENSION_ID].addHandlers({
        sayHello
    });

    function sayHello(messageFromIsolatedContext) {
        console.log('Hello from isolated context (logged in main): ', messageFromIsolatedContext);
        return {
            success: true,
            message: 'Hello from main context!'
        };
    }
})();
