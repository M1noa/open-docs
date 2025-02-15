const buildDocs = require('./build-docs.js');

async function main() {
    try {
        const result = await buildDocs('1739585585760', {
            title: 'Test Documentation',
            sidebar: [],
            customCss: [],
            social: {},
            editLink: {
                baseUrl: 'https://github.com/m1noa/open-docs/edit/main/'
            }
        });
        console.log('Build result:', result);
    } catch (error) {
        console.error('Build failed:', error);
    }
}

main();