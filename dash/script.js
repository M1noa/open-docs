// Store for documentation sites
let docSites = [];

// Load existing documentation sites on page load
window.addEventListener('DOMContentLoaded', () => {
    loadDocSites();
});

// Load documentation sites from the server
async function loadDocSites() {
    try {
        const response = await fetch('/docs/api');
        const data = await response.json();
        docSites = data;
        renderDocSites();
    } catch (error) {
        console.error('Error loading documentation sites:', error);
    }
}

// Render documentation sites in the dashboard
function renderDocSites() {
    const docsListElement = document.getElementById('docsList');
    docsListElement.innerHTML = '';

    docSites.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.innerHTML = `
            <div class="card-header" style="background-color: ${doc.primaryColor}">
                <h5 class="card-title mb-0">${doc.name}</h5>
            </div>
            <div class="card-body">
                <p class="card-text">Repository: ${doc.repoUrl}</p>
                <p class="card-text">Branch: ${doc.branch}</p>
                ${doc.domains && doc.domains.length > 0 ? `<p class="card-text">Domains: ${doc.domains.join(', ')}</p>` : ''}
                <div class="d-flex gap-2">
                    <a href="/docs/${doc.id}" class="btn btn-primary">View Docs</a>
                    <button class="btn btn-secondary" onclick="editDoc('${doc.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteDoc('${doc.id}')">Delete</button>
                </div>
            </div>
        `;
        docsListElement.appendChild(card);
    });
}

// Add new domain field
window.addDomainField = function() {
    const domainList = document.getElementById('domainList');
    const newField = document.createElement('div');
    newField.className = 'input-group mb-2';
    newField.innerHTML = `
        <input type="text" class="form-control" name="domains[]" placeholder="docs.example.com">
        <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">Remove</button>
    `;
    domainList.appendChild(newField);
};

// Submit new documentation site
window.submitNewDoc = async function() {
    const form = document.getElementById('newDocForm');
    const formData = new FormData(form);
    
    // Handle multiple domains
    const domains = Array.from(formData.getAll('domains[]')).filter(domain => domain.trim() !== '');
    const docData = Object.fromEntries(formData.entries());
    delete docData['domains[]'];
    docData.domains = domains;

    try {
        const response = await fetch('/docs/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(docData)
        });

        if (response.ok) {
            const newDoc = await response.json();
            docSites.push(newDoc);
            renderDocSites();
            bootstrap.Modal.getInstance(document.getElementById('newDocModal')).hide();
            form.reset();
        } else {
            throw new Error('Failed to create documentation site');
        }
    } catch (error) {
        console.error('Error creating documentation site:', error);
        alert('Failed to create documentation site. Please try again.');
    }
};

// Edit documentation site
async function editDoc(docId) {
    const doc = docSites.find(d => d.id === docId);
    if (!doc) return;

    // Populate the edit modal with existing data
    const editModal = new bootstrap.Modal(document.getElementById('newDocModal'));
    const form = document.getElementById('newDocForm');
    
    // Set form values
    form.querySelector('[name="name"]').value = doc.name;
    form.querySelector('[name="repoUrl"]').value = doc.repoUrl;
    form.querySelector('[name="branch"]').value = doc.branch;
    form.querySelector('[name="directory"]').value = doc.directory || '';
    form.querySelector('[name="token"]').value = doc.token || '';
    form.querySelector('[name="primaryColor"]').value = doc.primaryColor || '#007bff';
    form.querySelector('[name="logoUrl"]').value = doc.logoUrl || '';
    form.querySelector('[name="githubUrl"]').value = doc.githubUrl || '';
    form.querySelector('[name="twitterUrl"]').value = doc.twitterUrl || '';
    form.querySelector('[name="discordUrl"]').value = doc.discordUrl || '';

    // Clear existing domain fields
    const domainList = document.getElementById('domainList');
    domainList.innerHTML = '';

    // Add existing domains
    if (doc.domains && doc.domains.length > 0) {
        doc.domains.forEach(domain => {
            const field = document.createElement('div');
            field.className = 'input-group mb-2';
            field.innerHTML = `
                <input type="text" class="form-control" name="domains[]" value="${domain}">
                <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">Remove</button>
            `;
            domainList.appendChild(field);
        });
    } else {
        // Add one empty domain field
        addDomainField();
    }

    // Update modal title and submit button
    document.querySelector('#newDocModal .modal-title').textContent = 'Edit Documentation';
    const submitButton = document.querySelector('#newDocModal .btn-primary');
    submitButton.textContent = 'Update Documentation';
    submitButton.onclick = () => updateDoc(docId);

    editModal.show();
}

// Update documentation site
async function updateDoc(docId) {
    const form = document.getElementById('newDocForm');
    const formData = new FormData(form);
    
    // Handle multiple domains
    const domains = Array.from(formData.getAll('domains[]')).filter(domain => domain.trim() !== '');
    const docData = Object.fromEntries(formData.entries());
    delete docData['domains[]'];
    docData.domains = domains;

    try {
        const response = await fetch(`/docs/api/${docId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(docData)
        });

        if (response.ok) {
            const updatedDoc = await response.json();
            const index = docSites.findIndex(d => d.id === docId);
            if (index !== -1) {
                docSites[index] = updatedDoc;
                renderDocSites();
            }
            bootstrap.Modal.getInstance(document.getElementById('newDocModal')).hide();
        } else {
            throw new Error('Failed to update documentation site');
        }
    } catch (error) {
        console.error('Error updating documentation site:', error);
        alert('Failed to update documentation site. Please try again.');
    }
}

// Delete documentation site
async function deleteDoc(docId) {
    if (!confirm('Are you sure you want to delete this documentation site?')) return;

    try {
        const response = await fetch(`/docs/api/${docId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            docSites = docSites.filter(d => d.id !== docId);
            renderDocSites();
        } else {
            throw new Error('Failed to delete documentation site');
        }
    } catch (error) {
        console.error('Error deleting documentation site:', error);
        alert('Failed to delete documentation site. Please try again.');
    }
}