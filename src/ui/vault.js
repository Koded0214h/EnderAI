// src/ui/vault.js
const form = document.getElementById('vaultForm');
const statusDiv = document.getElementById('status');
const inputFields = ['fullName', 'careerSummary', 'personalInterests'];

// Function to save data with proper structure
// In vault.js - make sure you're saving ALL fields
function saveOptions() {
  const vaultData = {
    personal: {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value, // Make sure this exists
      phone: document.getElementById('phone').value   // Make sure this exists
    },
    professional: {
      currentTitle: document.getElementById('currentTitle').value,
      company: document.getElementById('company').value,
      yearsExperience: parseInt(document.getElementById('yearsExperience').value) || 0,
      skills: document.getElementById('keySkills') ? document.getElementById('keySkills').value.split(',').map(s => s.trim()) : []
    },
    narratives: {
      professionalSummary: document.getElementById('careerSummary').value,
      personalInterests: document.getElementById('personalInterests').value,
      careerObjective: ""
    },
    preferences: {
      tone: "professional",
      writingStyle: "concise"
    }
  };

  chrome.storage.local.set({ 'aetherFormVault': vaultData }, () => {
    statusDiv.textContent = 'Data saved successfully!';
    setTimeout(() => {
      statusDiv.textContent = '';
    }, 1500);
  });
}

// Function to load data when page opens
function restoreOptions() {
  chrome.storage.local.get('aetherFormVault', (items) => {
    const vaultData = items.aetherFormVault || {};
    
    // Populate form fields from vault data
    document.getElementById('fullName').value = vaultData.personal?.fullName || '';
    document.getElementById('careerSummary').value = vaultData.narratives?.professionalSummary || '';
    document.getElementById('personalInterests').value = vaultData.narratives?.personalInterests || '';
  });
}

// Event Listeners
form.addEventListener('submit', (e) => {
  e.preventDefault();
  saveOptions();
});

document.addEventListener('DOMContentLoaded', restoreOptions);