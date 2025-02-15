// StarlightConfig.js - Dashboard component for Starlight configuration

class StarlightConfig {
    constructor() {
        this.config = {
            title: '',
            description: '',
            social: {
                github: '',
                twitter: '',
                discord: ''
            },
            sidebar: [],
            head: [],
            customCss: [],
            lastUpdated: true,
            pagination: true,
            editLink: {
                baseUrl: ''
            },
            defaultLocale: 'root',
            locales: {
                root: {
                    label: 'English',
                    lang: 'en'
                }
            },
            theme: {
                primaryColor: '#7c3aed',
                secondaryColor: '#4f46e5',
                accentColor: '#0ea5e9'
            }
        };
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveConfig();
    }

    async saveConfig() {
        try {
            const response = await fetch('/api/starlight/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.config)
            });

            if (!response.ok) {
                throw new Error('Failed to save Starlight configuration');
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving Starlight configuration:', error);
            throw error;
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('/api/starlight/config');
            if (!response.ok) {
                throw new Error('Failed to load Starlight configuration');
            }
            this.config = await response.json();
            return this.config;
        } catch (error) {
            console.error('Error loading Starlight configuration:', error);
            throw error;
        }
    }
}

export default StarlightConfig;