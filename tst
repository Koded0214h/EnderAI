{
    "manifest_version": 3,
    "name": "AetherForm Assistant",
    "version": "1.0",
    "description": "Transform form filling into a few clicks with AI-powered autofill, contextual writing, and compliance checking.",
    
    "background": {
        "service_worker": "src/background/service-worker.js"
    },
    
    "action": {
        "default_popup": "src/ui/popup.html",
        "default_title": "AetherForm Assistant"
    },
    
    "options_page": "src/ui/vault.html",
    
    "permissions": [
        "storage",
        "activeTab",
        "scripting"
    ],
    
    "host_permissions": [
        "<all_urls>"
    ],
    
    "content_scripts": [
        {
            "matches": ["<all_urls>"],
            "js": [
                "src/content/field-detector.js",
                "src/content/form-scanner.js",
                "src/content/validator.js"
            ],
            "run_at": "document_end"
        }
    ]
}