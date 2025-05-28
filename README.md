# Open-Docs
## !! THIS HASNT BEEN FINISHED AND I PROBABLY WONT EVER FINISH IT AS I AM OVERWHELMED WITH PROJECTS ATM !!

Open-Docs is an open-source documentation platform that allows you to create and manage beautiful documentation sites directly from your Git repositories. It automatically organizes your markdown files into a structured, easy-to-navigate documentation website.

The uptime-kuma of documentation!

## Features

- **Git Repository Integration**: Easily connect to any Git repository (public or private)
- **Automatic Documentation Structure**: Creates documentation structure based on your repository's directory hierarchy
- **Multiple Documentation Sites**: Host multiple documentation instances with different configurations
- **Customizable Themes**: Fully customizable color schemes and branding for each documentation site
- **Directory-Based Navigation**: Uses README.md files as landing pages for directories
- **Modern UI**: Clean, responsive interface with excellent readability

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/m1noa/open-docs.git
   cd open-docs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file from the example:
   ```bash
   cp .env.example .env
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Configuration

Configure your documentation site through the dashboard:

1. Add your Git repository information:
   - Repository URL
   - Branch name
   - Target directory (optional)
   - Access token (for private repositories)

2. Customize the appearance:
   - Primary color
   - Secondary color
   - Background color
   - Logo
   - Site name
   - Other branding elements

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request, I need the help!
