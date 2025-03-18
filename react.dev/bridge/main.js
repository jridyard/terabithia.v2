(() => {
    // Extension Identifier
    const TERABITHIA_BRIDGE_ID = 'TERABITHIA_EXTENSION';
    // Extension Identifier

    window.TerabithiaBridge[TERABITHIA_BRIDGE_ID].addHandlers({
        helloFromIsolated,
        getValueFromMain
    });

    function helloFromIsolated({ message }) {
        console.log('Message received from ISOLATED context (logged in MAIN) <> Your message: ', message);
        console.log('Now sending response back to ISOLATED!');
        return {
            success: true,
            data: 'Message was successfully sent from ISOLATED to MAIN. This value was then returned back to ISOLATED!'
        };
    }

    async function getValueFromMain() {
        // await random delay between 500ms and 2000ms
        await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 2000) + 500));
        const randInt = Math.floor(Math.random() * 100);
        console.log(
            'getValueFromMain received from ISOLATED context (executed in MAIN). Now sending response back to ISOLATED!'
        );
        return {
            success: true,
            data: randInt
        };
    }
})();
