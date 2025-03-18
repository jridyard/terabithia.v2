const TERABITHIA_BRIDGE_ID = 'TERABITHIA_EXTENSION';

TerabithiaBridge[TERABITHIA_BRIDGE_ID].executeInMain('helloIsolated', { message: 'Hello from isolated context!' }).then(
    (response) => {
        console.log('JSON response received from main context: ', response);
    }
);
