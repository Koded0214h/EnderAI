// src/ui/popup.js
document.getElementById('vaultBtn').addEventListener('click', () => {
    // This opens a new tab for the options/vault page
    chrome.runtime.openOptionsPage();
});