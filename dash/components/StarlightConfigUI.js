// StarlightConfigUI.js - UI component for Starlight configuration

class StarlightConfigUI {
    constructor() {
        this.config = new StarlightConfig();
        this.container = document.createElement('div');
        this.container.className = 'starlight-config';
    }

    async init() {
        await this.loadConfig();
        this.render();
    }

    async loadConfig() {
        try {
            await this.config.loadConfig();
        } catch (error) {
            console.error('Error loading configuration:', error);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>Starlight Configuration</h3>
                </div>
                <div class="card-body">
                    <form id="starlightConfigForm">
                        <div class="mb-3">
                            <label class="form-label">Site Title</label>
                            <input type="text" class="form-control" name="title" value="${this.config.config.title}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Description</label>
                            <textarea class="form-control" name="description">${this.config.config.description}</textarea>
                        </div>
                        <div class="mb-3">
                            <h4>Social Links</h4>
                            <div class="row">
                                <div class="col">
                                    <label class="form-label">GitHub</label>
                                    <input type="url" class="form-control" name="social.github" value="${this.config.config.social.github}">
                                </div>
                                <div class="col">
                                    <label class="form-label">Twitter</label>
                                    <input type="url" class="form-control" name="social.twitter" value="${this.config.config.social.twitter}">
                                </div>
                                <div class="col">
                                    <label class="form-label">Discord</label>
                                    <input type="url" class="form-control" name="social.discord" value="${this.config.config.social.discord}">
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <h4>Theme Colors</h4>
                            <div class="row">
                                <div class="col">
                                    <label class="form-label">Primary Color</label>
                                    <input type="color" class="form-control" name="theme.primaryColor" value="${this.config.config.theme.primaryColor}">
                                </div>
                                <div class="col">
                                    <label class="form-label">Secondary Color</label>
                                    <input type="color" class="form-control" name="theme.secondaryColor" value="${this.config.config.theme.secondaryColor}">
                                </div>
                                <div class="col">
                                    <label class="form-label">Accent Color</label>
                                    <input type="color" class="form-control" name="theme.accentColor" value="${this.config.config.theme.accentColor}">
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <h4>Features</h4>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" name="lastUpdated" ${this.config.config.lastUpdated ? 'checked' : ''}>
                                <label class="form-check-label">Show Last Updated</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" name="pagination" ${this.config.config.pagination ? 'checked' : ''}>
                                <label class="form-check-label">Enable Pagination</label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Edit Link Base URL</label>
                            <input type="url" class="form-control" name="editLink.baseUrl" value="${this.config.config.editLink.baseUrl}">
                        </div>
                        <button type="submit" class="btn btn-primary">Save Configuration</button>
                    </form>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const form = this.container.querySelector('#starlightConfigForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const newConfig = {};

            formData.forEach((value, key) => {
                if (key.includes('.')) {
                    const [section, field] = key.split('.');
                    if (!newConfig[section]) newConfig[section] = {};
                    newConfig[section][field] = value;
                } else {
                    newConfig[key] = value;
                }
            });

            try {
                await this.config.updateConfig(newConfig);
                alert('Configuration saved successfully!');
            } catch (error) {
                console.error('Error saving configuration:', error);
                alert('Failed to save configuration. Please try again.');
            }
        });
    }
}

export default StarlightConfigUI;