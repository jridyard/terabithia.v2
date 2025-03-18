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

        (2) TerabithiaBridge[TERABITHIA_BRIDGE_ID].functions.helloFromIsolated({ message: 'Hello from isolated context!' }).then((response) => {
                console.log('JSON response received from main context: ', response);
            });

    * Anytime a handler is added to your bridge, it will become callable from the counterpart context via ".functions"
*/

const BRIDGE_FUNCTIONS = TerabithiaBridge[TERABITHIA_BRIDGE_ID].functions;

console.log('BRIDGE_FUNCTIONS', BRIDGE_FUNCTIONS);
console.log(TerabithiaBridge[TERABITHIA_BRIDGE_ID]);

// BRIDGE_FUNCTIONS.getValueFromMain().then((response) => {
//     console.log('JSON response received from main context: ', response);
// });

TerabithiaBridge[TERABITHIA_BRIDGE_ID].executeInMain('getValueFromMain').then((response) => {
    console.log('JSON response received from main context: ', response);
});
