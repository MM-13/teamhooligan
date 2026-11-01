const form = document.getElementById('game-form');
const titleInput = document.getElementById('game-title');
const taglineInput = document.getElementById('game-tagline');
const shortDescriptionInput = document.getElementById('game-short-description');
const fullDescriptionInput = document.getElementById('game-full-description');
const trailerInput = document.getElementById('game-trailer-url');
const steamUrlInput = document.getElementById('game-steam-url');
const developerInput = document.getElementById('game-developer');
const publisherInput = document.getElementById('game-publisher');
const genreInput = document.getElementById('game-genre');
const playersInput = document.getElementById('game-players');
const platformInput = document.getElementById('game-platform');
const releaseDateInput = document.getElementById('game-release-date');
const pageFileInput = document.getElementById('game-page-file');
const featuredInput = document.getElementById('game-featured');
const keyArtInput = document.getElementById('game-key-art');
const screenshotInput = document.getElementById('screenshot-input');
const screenshotDropzone = document.getElementById('screenshot-dropzone');
const screenshotList = document.getElementById('screenshot-list');
const cardPreview = document.getElementById('card-preview');
const cardSnippet = document.getElementById('card-snippet');
const generateButton = document.getElementById('generate-button');
const copyCardButton = document.getElementById('copy-card-button');
const downloadLink = document.getElementById('download-link');
const generationStatus = document.getElementById('generation-status');
const menuToggle = document.querySelector('.menu-toggle');
const sidebarInner = document.querySelector('.sidebar-inner');
const primaryNavigation = document.getElementById('primary-nav');
let currentObjectUrl = null;
let screenshotFiles = [];
let screenshotPreviewUrls = [];
let keyArtFile = null;

if (menuToggle && sidebarInner && primaryNavigation) {
    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!isOpen));
        primaryNavigation.setAttribute('aria-hidden', String(isOpen));
        sidebarInner.classList.toggle('menu-open', !isOpen);
    });
}

function slugify(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function createFolderName(value) {
    return slugify(value) || 'team-hooligan-game';
}

function getImageExtension(file) {
    const knownExtensions = {
        'image/avif': 'avif',
        'image/bmp': 'bmp',
        'image/gif': 'gif',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/svg+xml': 'svg',
        'image/webp': 'webp',
    };
    if (knownExtensions[file.type]) {
        return knownExtensions[file.type];
    }

    const extension = file.name.split('.').pop().toLowerCase();
    return /^[a-z0-9]{1,8}$/.test(extension) ? extension : 'img';
}

function getHttpUrl(value) {
    try {
        const url = new URL(value.trim());
        return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
        return '';
    }
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
    const href = escapeHtml(data.pagePath || '#');
    return `<article class="game-card${featuredClass}">
        <h3>${escapeHtml(data.title)}</h3>
        <p>${escapeHtml(data.shortDescription)}</p>
        <a href="${href}" class="button button-primary">View game page</a>
    </article>`;
}

function buildGameplaySection(items, description) {
    const gameplayItems = items
        .filter((item) => item.title || item.description)
        .map((item, index) => `<article class="gameplay-item">
                    <span class="gameplay-index">${String(index + 1).padStart(2, '0')}</span>
                    <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div>
                </article>`)
        .join('');

    if (!gameplayItems && !description) {
        return '';
    }

    return `<section class="game-detail-section" aria-labelledby="gameplay-heading">
            <div class="section-heading">
                <span class="eyebrow">The run</span>
                <h2 id="gameplay-heading">Learn from every attempt</h2>
            </div>
            ${description ? `<p class="gameplay-intro">${escapeHtml(description)}</p>` : ''}
            ${gameplayItems ? `<div class="gameplay-list">${gameplayItems}</div>` : ''}
        </section>`;
}

function buildTrailerMarkup(embedUrl, keyArtPath, title) {
    if (!embedUrl) {
        const keyArt = keyArtPath
            ? `<img src="${escapeHtml(keyArtPath)}" alt="${escapeHtml(title)} artwork">`
            : '';
        return `<div class="trailer-placeholder" role="note" aria-label="${escapeHtml(title)} trailer">
            ${keyArt}
            <div class="trailer-placeholder-copy">
                <span class="eyebrow">Trailer</span>
                <p>Reserved for official game footage</p>
            </div>
        </div>`;
    }

    return `<div class="video-embed"><iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(title)} trailer" allowfullscreen loading="lazy"></iframe></div>`;
}

function buildGamePageHtml(data) {
    const gameplaySection = buildGameplaySection(data.gameplay, data.fullDescription);
    const screenshotSection = data.screenshots.length
        ? `<section class="game-detail-section" aria-labelledby="screenshots-heading">
            <div class="section-heading">
                <span class="eyebrow">In-game</span>
                <h2 id="screenshots-heading">Screenshots</h2>
            </div>
            <div class="screenshot-grid" data-screenshot-gallery aria-label="${escapeHtml(data.title)} screenshots"></div>
            <script type="application/json" data-screenshot-manifest>${JSON.stringify(data.screenshots).replace(/</g, '\\u003c')}</script>
            <dialog class="screenshot-lightbox" data-screenshot-viewer aria-label="Screenshot viewer">
                <button class="lightbox-close" type="button" data-lightbox-close aria-label="Close screenshot viewer">&times;</button>
                <button class="lightbox-arrow lightbox-previous" type="button" data-lightbox-previous aria-label="Previous screenshot"></button>
                <figure class="lightbox-figure">
                    <img class="lightbox-image" data-lightbox-image alt="">
                    <figcaption class="lightbox-counter" data-lightbox-counter></figcaption>
                </figure>
                <button class="lightbox-arrow lightbox-next" type="button" data-lightbox-next aria-label="Next screenshot"></button>
            </dialog>
        </section>`
        : '';
    const heroImage = data.keyArtPath
        ? `<figure class="game-key-art"><img src="${escapeHtml(data.keyArtPath)}" alt="${escapeHtml(data.title)} key art" loading="lazy" decoding="async"></figure>`
        : '';
    const heroButton = data.storeUrl
        ? `<a class="button button-primary" href="${escapeHtml(data.storeUrl)}">${escapeHtml(data.storeButtonText)}</a>`
        : '';
    const detailsButton = data.storeUrl
        ? `<a class="button button-primary" href="${escapeHtml(data.storeUrl)}">Visit ${escapeHtml(data.title)} online</a>`
        : '';
    const trailerMarkup = buildTrailerMarkup(data.trailerEmbedUrl, data.keyArtPath, data.title);
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${escapeHtml(data.shortDescription)}">
<meta name="theme-color" content="#0c0302">
<title>${escapeHtml(data.title)} | Team Hooligan</title>
<link rel="stylesheet" href="css/styles.css">
<link rel="stylesheet" href="css/game-page.css">
</head>
<body>
    <header class="sidebar">
        <div class="sidebar-inner">
            <div class="header-top">
                <div class="header-logo">
                    <a href="../../../index.html" class="logo-link" aria-label="Team Hooligan home">
                        <img src="images/team-hooligan-logo.png" alt="Team Hooligan">
                    </a>
                </div>
                <button class="menu-toggle" aria-controls="primary-nav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="menu-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Menu</span>
                </button>
            </div>
            <nav id="primary-nav" class="main-nav sidebar-nav" aria-label="Primary navigation" aria-hidden="false">
                <ul>
                    <li><a href="../../../index.html">Home</a></li>
                    <li class="nav-separator">|</li>
                    <li><a href="../../../index.html#Games">Games</a></li>
                    <li class="nav-separator">|</li>
                    <li><a href="../../../index.html#About">About</a></li>
                    <li class="nav-separator">|</li>
                    <li><a href="../../../index.html#Contact">Contact</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="content game-detail-content">
        <section class="game-detail-hero${data.keyArtPath ? '' : ' game-detail-hero-no-art'}" aria-labelledby="game-title">
            <div class="game-detail-copy">
                <span class="eyebrow">${escapeHtml(data.tagline || data.genre)}</span>
                <h1 id="game-title">${escapeHtml(data.title)}</h1>
                <p>${escapeHtml(data.shortDescription)}</p>
                ${heroButton}
                <dl class="game-facts game-facts-hero">
                    <div><dt>Players</dt><dd>${escapeHtml(data.players)}</dd></div>
                    <div><dt>Platform</dt><dd>${escapeHtml(data.platform)}</dd></div>
                    <div><dt>Release</dt><dd>${escapeHtml(data.releaseDate)}</dd></div>
                </dl>
            </div>
            ${heroImage}
        </section>

        ${gameplaySection}

        <section class="game-detail-section trailer-section" aria-labelledby="trailer-heading">
            <div class="section-heading">
                <span class="eyebrow">Media</span>
                <h2 id="trailer-heading">Trailer</h2>
            </div>
            ${trailerMarkup}
        </section>

        ${screenshotSection}

        <section class="game-detail-section game-details-section" aria-labelledby="details-heading">
            <div class="section-heading">
                <span class="eyebrow">${escapeHtml(data.title)}</span>
                <h2 id="details-heading">Game details</h2>
            </div>
            <dl class="game-facts game-facts-full">
                <div><dt>Developer</dt><dd>${escapeHtml(data.developer)}</dd></div>
                <div><dt>Publisher</dt><dd>${escapeHtml(data.publisher)}</dd></div>
                <div><dt>Genre</dt><dd>${escapeHtml(data.genre)}</dd></div>
                <div><dt>Players</dt><dd>${escapeHtml(data.players)}</dd></div>
                <div><dt>Platform</dt><dd>${escapeHtml(data.platform)}</dd></div>
                <div><dt>Release date</dt><dd>${escapeHtml(data.releaseDate)}</dd></div>
            </dl>
            ${detailsButton}
        </section>

        <footer class="game-detail-footer">
            <a href="../../../index.html#Games">&larr; Back to all games</a>
        </footer>
    </main>
    <script src="js/gallery.js" defer></script>
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

function collectGameData() {
    const folderName = createFolderName(pageFileInput.value.trim() || titleInput.value);
    const trailerUrl = getHttpUrl(trailerInput.value);
    const selectedKeyArt = keyArtFile || screenshotFiles[0] || null;
    const gameplay = [1, 2, 3].map((number) => ({
        title: document.getElementById(`game-feature-${number}-title`).value.trim(),
        description: document.getElementById(`game-feature-${number}-description`).value.trim(),
    }));

    return {
        title: titleInput.value.trim() || 'New Game',
        tagline: taglineInput.value.trim(),
        shortDescription: shortDescriptionInput.value.trim(),
        fullDescription: fullDescriptionInput.value.trim(),
        trailerEmbedUrl: getYouTubeEmbedUrl(trailerUrl),
        storeUrl: getHttpUrl(steamUrlInput.value),
        storeButtonText: 'Visit store page',
        developer: developerInput.value.trim(),
        publisher: publisherInput.value.trim(),
        genre: genreInput.value.trim(),
        players: playersInput.value.trim(),
        platform: platformInput.value.trim(),
        releaseDate: releaseDateInput.value.trim(),
        folderName,
        pagePath: `Assets/GamePages/${folderName}/index.html`,
        featured: featuredInput.checked,
        gameplay,
        keyArtFile: selectedKeyArt,
        screenshots: [],
    };
}

function updatePreview() {
    const data = collectGameData();
    const cardHTML = buildCardHtml(data);
    cardPreview.innerHTML = cardHTML;
    cardSnippet.value = cardHTML;
}

async function fetchTemplateText(path) {
    const response = await fetch(new URL(path, document.baseURI));
    if (!response.ok) {
        throw new Error(`Could not load ${path} (${response.status})`);
    }
    return response.text();
}

async function fetchTemplateBlob(path) {
    const response = await fetch(new URL(path, document.baseURI));
    if (!response.ok) {
        throw new Error(`Could not load ${path} (${response.status})`);
    }
    return response.blob();
}

async function updateDownloadLink() {
    if (typeof JSZip === 'undefined') {
        throw new Error('The ZIP library did not load. Check your internet connection and reload the generator.');
    }

    const data = collectGameData();
    data.keyArtPath = data.keyArtFile
        ? `images/key-art.${getImageExtension(data.keyArtFile)}`
        : '';
    data.screenshots = screenshotFiles.map((file, index) => {
        const path = `images/screenshots/screenshot-${String(index + 1).padStart(2, '0')}.${getImageExtension(file)}`;
        return { src: path, alt: `${data.title} screenshot ${String(index + 1).padStart(2, '0')}`, file };
    });

    const zip = new JSZip();
    const pageFolder = zip.folder(data.folderName);
    const screenshotManifest = data.screenshots.map(({ src, alt }) => ({ src, alt }));
    const html = buildGamePageHtml({ ...data, screenshots: screenshotManifest });

    pageFolder.file('index.html', html);
    pageFolder.file('css/styles.css', await fetchTemplateText('Assets/css/styles.css'));
    pageFolder.file('css/game-page.css', await fetchTemplateText('Assets/GamePages/dungeon-idler.css'));
    pageFolder.file('js/gallery.js', await fetchTemplateText('Assets/js/dungeon-idler-gallery.js'));
    pageFolder.file('images/team-hooligan-logo.png', await fetchTemplateBlob('Assets/Images/TeamHooligan_Logo.png'));

    if (data.keyArtFile) {
        pageFolder.file(data.keyArtPath, data.keyArtFile);
    }
    data.screenshots.forEach(({ src, file }) => pageFolder.file(src, file));

    const blob = await zip.generateAsync({ type: 'blob' });
    if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
    }
    currentObjectUrl = URL.createObjectURL(blob);
    downloadLink.href = currentObjectUrl;
    downloadLink.download = `${data.folderName}.zip`;
    downloadLink.hidden = false;
    downloadLink.textContent = `Download ${data.folderName}.zip`;
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

keyArtInput.addEventListener('change', () => {
    const file = keyArtInput.files[0];
    if (!file) {
        return;
    }
    if (!file.type.startsWith('image/')) {
        generationStatus.textContent = 'Choose an image file for key art.';
        keyArtInput.value = '';
        return;
    }
    keyArtFile = file;
    generationStatus.textContent = '';
    updatePreview();
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
    generateButton.disabled = true;
    generateButton.textContent = 'Generating...';
    generationStatus.textContent = '';
    try {
        await updateDownloadLink();
        generateButton.textContent = 'Bundle ready';
        generationStatus.textContent = 'Your page bundle is ready to download.';
        setTimeout(() => {
            generateButton.textContent = 'Generate page bundle';
            generateButton.disabled = false;
        }, 1200);
    } catch (error) {
        console.error(error);
        generateButton.textContent = 'Generate page bundle';
        generateButton.disabled = false;
        generationStatus.textContent = error.message || 'The page bundle could not be created.';
    }
});

copyCardButton.addEventListener('click', copyCardSnippet);

window.addEventListener('load', () => {
    updateScreenshotList();
    updatePreview();
});
