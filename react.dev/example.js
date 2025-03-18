// Extension Identifier
const TERABITHIA_BRIDGE_ID = 'TERABITHIA_EXTENSION';
// Extension Identifier

/*
    There are two ways to write bridge functions:
        (1) TerabithiaBridge[TERABITHIA_BRIDGE_ID].executeInMain('helloFromIsolated', {
                message: 'Hello from isolated context!'
            }).then((response) => {
                console.log('JSON response received from main context: ', response);
            });

        (2) const BRIDGE_FUNCTIONS = TerabithiaBridge[TERABITHIA_BRIDGE_ID].functions;

            BRIDGE_FUNCTIONS.helloFromIsolated({ message: 'Hello from isolated context!' }).then((response) => {
                console.log('JSON response received from main context: ', response);
            });

    * Anytime a handler is added to your bridge, it will become callable from the counterpart context via ".functions"

    *** WARNING ***

    YOU SHOULD ONLY USE "BRIDGE_FUNCTIONS" IF YOU ARE SURE THAT THE HANDLER HAS BEEN ADDED TO THE BRIDGE
    IT TAKES A FEW MILLISECONDS ON SCRIPT LOAD FOR THE HANDLER TO BE ADDED TO THE BRIDGE AS A FUNCTION TO CALL DIRECTLY
    IT IS SAFER TO WRITE THE WHOLE THING OUT LIKE IN VERSION (1) ABOVE

    *** WARNING ***
*/

TerabithiaBridge[TERABITHIA_BRIDGE_ID].executeInMain('helloFromIsolated', {
    message: 'Hello from isolated context!'
}).then((response) => {
    console.log('JSON response received from main context: ', response);
});

TerabithiaBridge[TERABITHIA_BRIDGE_ID].executeInMain('getValueFromMain').then((response) => {
    console.log('JSON response received from main context: ', response);
});

// bridge "functions" are only available after the bridge has been initialized fully, the below would not run since it runs alongside the scripts initialization process
// const BRIDGE_FUNCTIONS = TerabithiaBridge[TERABITHIA_BRIDGE_ID].functions;
// BRIDGE_FUNCTIONS.getValueFromMain().then((response) => {
//     console.log('JSON response received from main context: ', response);
// });
