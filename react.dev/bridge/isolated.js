(() => {
    const TERABITHIA_BRIDGE_ID = 'TERABITHIA_EXTENSION';

    window.TerabithiaBridge[TERABITHIA_BRIDGE_ID].addHandlers({
        helloMain
    });

    function helloMain(messageFromMainContext) {
        console.log('Hello from main context (logged in isolated): ', messageFromMainContext);
        return {
            success: true,
            message: 'Hello from isolated context!'
        };
    }
})();
