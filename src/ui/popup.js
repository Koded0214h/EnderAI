// src/ui/popup.js
document.addEventListener('DOMContentLoaded', async () => {
    const vaultBtn = document.getElementById('vaultBtn');
    const scanToggle = document.getElementById('scanToggle');
    const statusDiv = document.getElementById('status');

    // Load current toggle state
    const result = await chrome.storage.local.get(['enderAIScanEnabled']);
    const isEnabled = result.enderAIScanEnabled || false;
    updateToggleUI(isEnabled);

    // Vault button
    vaultBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    // Toggle functionality
    scanToggle.addEventListener('click', async () => {
        const currentlyEnabled = scanToggle.classList.contains('active');
        const newState = !currentlyEnabled;

        // Save to storage
        await chrome.storage.local.set({ enderAIScanEnabled: newState });

        // Update UI
        updateToggleUI(newState);

        // Notify content scripts
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'TOGGLE_SCANNING',
                enabled: newState
            }).catch(() => {
                // Content script might not be loaded yet, that's ok
            });
        }
    });

    function updateToggleUI(enabled) {
        if (enabled) {
            scanToggle.classList.add('active');
            statusDiv.textContent = 'Scanning: Enabled';
            statusDiv.className = 'status active';
        } else {
            scanToggle.classList.remove('active');
            statusDiv.textContent = 'Scanning: Disabled';
            statusDiv.className = 'status inactive';
        }
    }
});
