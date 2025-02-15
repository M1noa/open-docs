// Store for documentation sites
let docSites = [];

// Load existing documentation sites on page load
window.addEventListener('DOMContentLoaded', () => {
    loadDocSites();
});

// Load documentation sites from the server
async function loadDocSites() {
    try {
        const response = await fetch('/api/docs');
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

// Submit new documentation site
async function submitNewDoc() {
    const form = document.getElementById('newDocForm');
    const formData = new FormData(form);
    const docData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/docs', {
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
}

// Edit documentation site
async function editDoc(docId) {
    const doc = docSites.find(d => d.id === docId);
    if (!doc) return;

    // Implement edit functionality
    console.log('Edit doc:', doc);
}

// Delete documentation site
async function deleteDoc(docId) {
    if (!confirm('Are you sure you want to delete this documentation site?')) return;

    try {
        const response = await fetch(`/api/docs/${docId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            docSites = docSites.filter(doc => doc.id !== docId);
            renderDocSites();
        } else {
            throw new Error('Failed to delete documentation site');
        }
    } catch (error) {
        console.error('Error deleting documentation site:', error);
        alert('Failed to delete documentation site. Please try again.');
    }
}