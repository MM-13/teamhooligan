const form = document.getElementById('game-form');
const titleInput = document.getElementById('game-title');
const taglineInput = document.getElementById('game-tagline');
const shortDescriptionInput = document.getElementById('game-short-description');
const fullDescriptionInput = document.getElementById('game-full-description');
const trailerInput = document.getElementById('game-trailer-url');
const pageFileInput = document.getElementById('game-page-file');
const featuredInput = document.getElementById('game-featured');
const screenshotInput = document.getElementById('screenshot-input');
const screenshotDropzone = document.getElementById('screenshot-dropzone');
const screenshotList = document.getElementById('screenshot-list');
const cardPreview = document.getElementById('card-preview');
const cardSnippet = document.getElementById('card-snippet');
const generateButton = document.getElementById('generate-button');
const copyCardButton = document.getElementById('copy-card-button');
const downloadLink = document.getElementById('download-link');
let currentObjectUrl = null;
let screenshotFiles = [];
let screenshotPreviewUrls = [];

function slugify(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function createFileName(value) {
    const base = slugify(value) || 'team-hooligan-game';
    return `${base}.html`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getYouTubeEmbedUrl(url) {
    if (!url) {
        return null;
    }

    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    return null;
}

function buildCardHtml(data) {
    const featuredClass = data.featured ? ' featured' : '';
    const href = escapeHtml(data.pageFileName || '#');
    return `<article class="game-card${featuredClass}">
        <h3>${escapeHtml(data.title)}</h3>
        <p>${escapeHtml(data.shortDescription)}</p>
        <a href="${href}" class="button button-primary">View game page</a>
    </article>`;
}

function buildScreenshotCards(urls) {
    return urls
        .filter(Boolean)
        .map((url) => `<figure class="screenshot-card"><img src="${escapeHtml(url)}" alt="Game screenshot"></figure>`)
        .join('');
}

function buildTrailerMarkup(embedUrl) {
    if (!embedUrl) {
        return '<div class="hero-media"><span>Trailer placeholder</span></div>';
    }

    return `<div class="hero-media video-embed"><iframe src="${escapeHtml(embedUrl)}" title="Game trailer" allowfullscreen loading="lazy"></iframe></div>`;
}

function buildGamePageHtml(data) {
    const screenshotCards = buildScreenshotCards(data.screenshots);
    const heroMedia = buildTrailerMarkup(data.trailerEmbedUrl);
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(data.title)} | Team Hooligan</title>
<link rel="stylesheet" href="Assets/css/styles.css">
</head>
<body>
    <header class="sidebar">
        <div class="sidebar-inner">
            <div class="header-top">
                <div class="header-logo">
                    <a href="index.html" class="logo-link">
                        <img src="Assets/images/TeamHooligan_Logo.png" alt="Team Hooligan Logo">
                    </a>
                </div>
            </div>
            <nav id="primary-nav" class="main-nav sidebar-nav" aria-label="Primary navigation" aria-hidden="true">
                <ul>
                    <li><a href="index.html#Home" class="nav-link">Home</a></li>
                    <li class="nav-separator">|</li>
                    <li><a href="index.html#Games" class="nav-link">Games</a></li>
                    <li class="nav-separator">|</li>
                    <li><a href="index.html#About" class="nav-link">About</a></li>
                    <li class="nav-separator">|</li>
                    <li><a href="index.html#Contact" class="nav-link">Contact</a></li>
                </ul>
            </nav>
            <div class="menu-footer">
                <div class="social-links sidebar-footer">
                    <a href="#" class="social-icon" aria-label="Steam"></a>
                    <a href="#" class="social-icon" aria-label="Itch.io"></a>
                    <a href="#" class="social-icon" aria-label="Discord"></a>
                    <a href="#" class="social-icon" aria-label="Twitter"></a>
                    <a href="#" class="social-icon" aria-label="Instagram"></a>
                    <a href="#" class="social-icon" aria-label="YouTube"></a>
                </div>
            </div>
        </div>
    </header>

    <main class="content">
        <section class="page-section hero-section">
            <div class="section-inner">
                <div class="hero-copy">
                    <span class="eyebrow">${escapeHtml(data.tagline)}</span>
                    <h1>${escapeHtml(data.title)}</h1>
                    <p>${escapeHtml(data.shortDescription)}</p>
                    <div class="hero-cta">
                        <a href="#screenshots" class="button button-primary">View screenshots</a>
                    </div>
                </div>
                ${heroMedia}
            </div>
        </section>

        <section class="page-section about-section" id="screenshots">
            <div class="section-inner">
                <div class="about-intro">
                    <h2>About the game</h2>
                    <p>${escapeHtml(data.fullDescription)}</p>
                </div>
                <div class="screenshot-grid">
                    ${screenshotCards}
                </div>
            </div>
        </section>
    </main>
</body>
</html>`;
}

function updateScreenshotList() {
    screenshotPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    screenshotPreviewUrls = screenshotFiles.map((file) => URL.createObjectURL(file));

    screenshotList.innerHTML = screenshotFiles
        .map((file, index) => `
            <div class="screenshot-list-item">
                <img src="${escapeHtml(screenshotPreviewUrls[index])}" alt="Screenshot preview">
                <div class="screenshot-item-info">
                    <span>${escapeHtml(file.name)}</span>
                    <small>${Math.round(file.size / 1024)} KB</small>
                </div>
                <button type="button" class="remove-screenshot" data-index="${index}">Remove</button>
            </div>
        `)
        .join('');
}

function addScreenshotFiles(files) {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) {
        return;
    }

    screenshotFiles = screenshotFiles.concat(imageFiles);
    updateScreenshotList();
    updatePreview();
}

function readFilesAsDataUrls(files) {
    return Promise.all(
        files.map(
            (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error('Unable to read file'));
                    reader.readAsDataURL(file);
                })
        )
    );
}

function updatePreview() {
    const data = {
        title: titleInput.value.trim() || 'New Game',
        tagline: taglineInput.value.trim() || 'Official studio release',
        shortDescription: shortDescriptionInput.value.trim() || 'A fast, stylish game from Team Hooligan.',
        fullDescription: fullDescriptionInput.value.trim() || 'Write a longer description here to explain what makes the game unique, its gameplay loop, and what players can expect.',
        trailerUrl: trailerInput.value.trim(),
        pageFileName: pageFileInput.value.trim() || createFileName(titleInput.value),
        featured: featuredInput.checked,
        screenshots: screenshotFiles.map((file) => file.name),
    };

    const cardHTML = buildCardHtml(data);
    cardPreview.innerHTML = cardHTML;
    cardSnippet.value = cardHTML;

    const embedUrl = getYouTubeEmbedUrl(data.trailerUrl);
    data.trailerEmbedUrl = embedUrl;

    if (!pageFileInput.value.trim()) {
        pageFileInput.value = createFileName(titleInput.value);
    }
}

async function updateDownloadLink() {
    const data = {
        title: titleInput.value.trim() || 'New Game',
        tagline: taglineInput.value.trim() || 'Official studio release',
        shortDescription: shortDescriptionInput.value.trim() || 'A fast, stylish game from Team Hooligan.',
        fullDescription: fullDescriptionInput.value.trim() || 'Write a longer description here to explain what makes the game unique, its gameplay loop, and what players can expect.',
        trailerUrl: trailerInput.value.trim(),
        pageFileName: createFileName(pageFileInput.value.trim() || titleInput.value),
        featured: featuredInput.checked,
        screenshots: await readFilesAsDataUrls(screenshotFiles),
    };
    data.trailerEmbedUrl = getYouTubeEmbedUrl(data.trailerUrl);

    const html = buildGamePageHtml(data);
    const blob = new Blob([html], { type: 'text/html' });
    if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
    }
    currentObjectUrl = URL.createObjectURL(blob);
    downloadLink.href = currentObjectUrl;
    downloadLink.download = data.pageFileName;
    downloadLink.hidden = false;
    downloadLink.textContent = `Download ${data.pageFileName}`;
}

function copyCardSnippet() {
    navigator.clipboard.writeText(cardSnippet.value).then(() => {
        copyCardButton.textContent = 'Copied!';
        setTimeout(() => {
            copyCardButton.textContent = 'Copy card HTML';
        }, 1200);
    });
}

form.addEventListener('input', updatePreview);

screenshotInput.addEventListener('change', (event) => {
    addScreenshotFiles(event.target.files);
    screenshotInput.value = '';
});

screenshotDropzone.addEventListener('click', () => screenshotInput.click());
screenshotDropzone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        screenshotInput.click();
    }
});

screenshotDropzone.addEventListener('dragenter', (event) => {
    event.preventDefault();
    screenshotDropzone.classList.add('drag-over');
});

screenshotDropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    screenshotDropzone.classList.add('drag-over');
});

screenshotDropzone.addEventListener('dragleave', () => {
    screenshotDropzone.classList.remove('drag-over');
});

screenshotDropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    screenshotDropzone.classList.remove('drag-over');
    addScreenshotFiles(event.dataTransfer.files);
});

screenshotList.addEventListener('click', (event) => {
    const button = event.target.closest('.remove-screenshot');
    if (!button) {
        return;
    }
    const index = Number(button.dataset.index);
    if (!Number.isNaN(index)) {
        screenshotFiles.splice(index, 1);
        updateScreenshotList();
        updatePreview();
    }
});

generateButton.addEventListener('click', async () => {
    generateButton.textContent = 'Generating...';
    await updateDownloadLink();
    generateButton.textContent = 'Ready to download';
    setTimeout(() => {
        generateButton.textContent = 'Generate game page';
    }, 1200);
});

copyCardButton.addEventListener('click', copyCardSnippet);

window.addEventListener('load', () => {
    updateScreenshotList();
    updatePreview();
});
