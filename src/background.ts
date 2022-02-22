// background.js
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    port.onDisconnect.addListener(() => {
      chrome.tabs.query({ active: true }, (tabs) => {
        const id = { tabId: tabs[0].id };
        chrome.debugger.detach(id);
      });
    });
  }
});
