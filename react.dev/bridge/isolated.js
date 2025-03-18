(() => {
    // Extension Identifier
    const TERABITHIA_BRIDGE_ID = 'TERABITHIA_EXTENSION';
    // Extension Identifier

    window.TerabithiaBridge[TERABITHIA_BRIDGE_ID].addHandlers({
        helloFromMain
    });

    function helloFromMain({ message }) {
        console.log('Message received from MAIN context (logged in ISOLATED) <> Your message: ', message);
        console.log('Now sending response back to MAIN!');
        return {
            success: true,
            data: 'Message was successfully sent from MAIN to ISOLATED. This value was then returned back to MAIN!'
        };
    }
})();
