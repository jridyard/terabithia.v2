(() => {
    // Extension Identifier
    const TERABITHIA_BRIDGE_ID = 'TERABITHIA_EXTENSION';
    // Extension Identifier

    // We cannot set "window.TERABITHIA_BRIDGE_ID = TERABITHIA_BRIDGE_ID;" here because this is in main context and it could conflict with other extensions
    // We must always be explicit when specifying the extension ID in the main context

    window.TerabithiaBridge[TERABITHIA_BRIDGE_ID].addHandlers({
        helloFromIsolated,
        getValueFromMain,
        clickApiReferenceButton
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

    function clickApiReferenceButton() {
        const apiReferenceButton = document.querySelector('[aria-label="API Reference"]');
        const reactProps = TerabithiaBridge[TERABITHIA_BRIDGE_ID].helpers.getReactProps(apiReferenceButton);
        reactProps.onClick({
            currentTarget: apiReferenceButton,
            preventDefault: () => {}
        });
        return {
            success: true
        };
    }
})();
