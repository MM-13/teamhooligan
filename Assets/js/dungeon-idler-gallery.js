const gallery = document.querySelector('[data-screenshot-gallery]');
const viewer = document.querySelector('[data-screenshot-viewer]');

if (gallery && viewer) {
	const lightboxImage = viewer.querySelector('[data-lightbox-image]');
	const counter = viewer.querySelector('[data-lightbox-counter]');
	const screenshots = [];
	let currentIndex = 0;
	let closeTimer;
	let isClosing = false;

	function loadImage(src) {
		return new Promise((resolve) => {
			const image = new Image();
			image.onload = () => resolve(true);
			image.onerror = () => resolve(false);
			image.src = src;
		});
	}

	function showScreenshot(index) {
		currentIndex = (index + screenshots.length) % screenshots.length;
		const screenshot = screenshots[currentIndex];
		lightboxImage.classList.remove('is-entering');
		lightboxImage.src = screenshot.src;
		lightboxImage.alt = screenshot.alt;
		counter.textContent = `${currentIndex + 1} / ${screenshots.length}`;
		void lightboxImage.offsetWidth;
		lightboxImage.classList.add('is-entering');
	}

	function closeViewer() {
		if (!viewer.open || isClosing) {
			return;
		}

		isClosing = true;
		viewer.classList.remove('is-visible');
		closeTimer = window.setTimeout(() => {
			viewer.close();
			isClosing = false;
		}, 180);
	}

	async function populateGallery() {
		let number = 1;

		while (true) {
			const src = `../Images/DungeonIdler/Screenshots/screens${number}.jpg`;
			if (!(await loadImage(src))) {
				break;
			}

			const screenshot = {
				src,
				alt: `Dungeon Idler screenshot ${String(number).padStart(2, '0')}`
			};
			screenshots.push(screenshot);

			const button = document.createElement('button');
			button.className = 'screenshot-card';
			button.type = 'button';
			button.setAttribute('aria-label', `View screenshot ${number}`);

			const thumbnail = new Image();
			thumbnail.src = screenshot.src;
			thumbnail.alt = screenshot.alt;
			thumbnail.loading = 'lazy';
			thumbnail.decoding = 'async';
			button.append(thumbnail);
			button.addEventListener('click', () => {
				if (isClosing) {
					return;
				}
				showScreenshot(screenshots.indexOf(screenshot));
				viewer.showModal();
				requestAnimationFrame(() => viewer.classList.add('is-visible'));
			});
			gallery.append(button);
			number += 1;
		}
	}

	viewer.querySelector('[data-lightbox-close]').addEventListener('click', closeViewer);
	viewer.querySelector('[data-lightbox-previous]').addEventListener('click', () => showScreenshot(currentIndex - 1));
	viewer.querySelector('[data-lightbox-next]').addEventListener('click', () => showScreenshot(currentIndex + 1));
	viewer.addEventListener('click', (event) => {
		if (event.target === viewer) {
			closeViewer();
		}
	});
	viewer.addEventListener('cancel', (event) => {
		event.preventDefault();
		closeViewer();
	});
	viewer.addEventListener('close', () => {
		window.clearTimeout(closeTimer);
		isClosing = false;
	});
	viewer.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeViewer();
		} else if (event.key === 'ArrowLeft') {
			showScreenshot(currentIndex - 1);
		} else if (event.key === 'ArrowRight') {
			showScreenshot(currentIndex + 1);
		}
	});

	populateGallery();
}