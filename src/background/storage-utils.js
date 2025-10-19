// src/background/storage-utils.js
class StorageManager {
    constructor() {
        this.vaultKey = 'aetherFormVault';
    }

    async getVaultData() {
        return new Promise((resolve) => {
            chrome.storage.local.get([this.vaultKey], (result) => {
                resolve(result[this.vaultKey] || this.getDefaultVault());
            });
        });
    }

    async saveVaultData(vaultData) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [this.vaultKey]: vaultData }, resolve);
        });
    }

    getDefaultVault() {
        return {
            personal: {},
            professional: {},
            narratives: {},
            preferences: {
                tone: 'professional',
                writingStyle: 'concise',
                autoTranslate: false,
                validationStrictness: 'medium'
            }
        };
    }

    async exportVault() {
        const data = await this.getVaultData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        return URL.createObjectURL(blob);
    }

    async importVault(jsonData) {
        try {
            const vaultData = JSON.parse(jsonData);
            await this.saveVaultData(vaultData);
            return true;
        } catch (error) {
            console.error('Failed to import vault:', error);
            return false;
        }
    }
}

const storageManager = new StorageManager();