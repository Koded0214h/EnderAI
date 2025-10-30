// src/ui/vault.js
const form = document.getElementById('vaultForm');
const statusDiv = document.getElementById('status');

// Function to save data with proper structure
function saveOptions() {
  const vaultData = {
    personal: {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim()
    },
    professional: {
      currentTitle: document.getElementById('currentTitle').value.trim(),
      company: document.getElementById('company').value.trim(),
      yearsExperience: parseInt(document.getElementById('yearsExperience').value) || 0,
      skills: [] // Will be populated if we add skills field later
    },
    narratives: {
      professionalSummary: document.getElementById('careerSummary').value.trim(),
      personalInterests: document.getElementById('personalInterests').value.trim(),
      careerObjective: ""
    },
    preferences: {
      tone: "professional",
      writingStyle: "concise"
    }
  };

  // Validate required fields
  if (!vaultData.personal.fullName) {
    showStatus('Please enter your full name', 'error');
    return;
  }

  chrome.storage.local.set({ 'aetherFormVault': vaultData }, () => {
    if (chrome.runtime.lastError) {
      showStatus('Error saving data: ' + chrome.runtime.lastError.message, 'error');
    } else {
      showStatus('✅ Data saved successfully!', 'success');
    }
  });
}

// Function to load data when page opens
function restoreOptions() {
  chrome.storage.local.get('aetherFormVault', (items) => {
    const vaultData = items.aetherFormVault || {};

    // Populate form fields from vault data
    document.getElementById('fullName').value = vaultData.personal?.fullName || '';
    document.getElementById('email').value = vaultData.personal?.email || '';
    document.getElementById('phone').value = vaultData.personal?.phone || '';
    document.getElementById('currentTitle').value = vaultData.professional?.currentTitle || '';
    document.getElementById('company').value = vaultData.professional?.company || '';
    document.getElementById('yearsExperience').value = vaultData.professional?.yearsExperience || '';
    document.getElementById('careerSummary').value = vaultData.narratives?.professionalSummary || '';
    document.getElementById('personalInterests').value = vaultData.narratives?.personalInterests || '';
  });
}

// Enhanced status display
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `show ${type}`;
  statusDiv.style.opacity = '1';

  setTimeout(() => {
    statusDiv.style.opacity = '0';
    setTimeout(() => {
      statusDiv.className = '';
      statusDiv.textContent = '';
    }, 300);
  }, 3000);
}

// Event Listeners
form.addEventListener('submit', (e) => {
  e.preventDefault();
  saveOptions();
});

// Add input validation feedback
document.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('blur', () => {
    if (field.hasAttribute('required') && !field.value.trim()) {
      field.style.borderColor = '#ef4444';
    } else {
      field.style.borderColor = '#e5e7eb';
    }
  });

  field.addEventListener('input', () => {
    if (field.style.borderColor === 'rgb(239, 68, 68)') {
      field.style.borderColor = '#667eea';
    }
  });
});

document.addEventListener('DOMContentLoaded', restoreOptions);
