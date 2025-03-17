// // For accessing service worker for testing...
// // (Accessing local storage)
// // on extension updated, check for tabs matching a format from an array, if tabs exist then remove the tab and create a new one
// chrome.runtime.onInstalled.addListener(({ reason }) => {
//     if (reason === 'update') {
//         const tabsToReplace = ['https://react.dev/'];
//         // Get all tabs
//         chrome.tabs.query({}, (tabs) => {
//             tabs.forEach((tab) => {
//                 tabsToReplace.forEach((tabToReplace) => {
//                     console.log(tab.url);
//                     if (tab.url?.includes(tabToReplace)) {
//                         chrome.tabs.remove(tab.id, () => {
//                             chrome.tabs.create({ url: tabToReplace });
//                         });
//                     }
//                 });
//             });
//         });
//     }
// });
