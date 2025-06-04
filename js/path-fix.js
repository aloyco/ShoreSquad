// Determines if the site is being served from GitHub Pages
const isGitHubPages = window.location.hostname === 'aloyco.github.io';
const basePath = isGitHubPages ? '/ShoreSquad' : '';

// Function to fix asset URLs
function getAssetPath(path) {
    return `${basePath}/${path}`.replace(/\/+/g, '/');
}

// Fix CSS path
document.head.querySelector('link[href*="css/styles.css"]').href = getAssetPath('css/styles.css');
