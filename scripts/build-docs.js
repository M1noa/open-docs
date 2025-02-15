const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

async function buildDocs(docId, config) {
    try {
        const docPath = path.join(process.cwd(), 'docs', docId);
        
        // Ensure the docs directory exists
        await fs.mkdir(docPath, { recursive: true });
        
        // Write astro.config.mjs
        const astroConfig = `import { defineConfig } from 'astro';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight(${JSON.stringify(config, null, 2)}),
  ],
});
`;
        
        await fs.writeFile(path.join(docPath, 'astro.config.mjs'), astroConfig);
        
        // Install dependencies in root project
        execSync('npm install @astrojs/starlight astro', {
            cwd: process.cwd(),
            stdio: 'inherit'
        });
        
        // Create package.json in doc directory if it doesn't exist
        const packageJson = {
            "name": `docs-${docId}`,
            "type": "module",
            "dependencies": {
                "@astrojs/starlight": "latest",
                "astro": "latest"
            }
        };
        await fs.writeFile(path.join(docPath, 'package.json'), JSON.stringify(packageJson, null, 2));
        
        // Build the documentation
        execSync('npx astro build', {
            cwd: docPath,
            stdio: 'inherit'
        });
        
        return true;
    } catch (error) {
        console.error('Error building documentation:', error);
        return false;
    }
}

module.exports = buildDocs;