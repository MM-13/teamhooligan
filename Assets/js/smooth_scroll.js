function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebarInner = document.querySelector('.sidebar-inner');
    const primaryNav = document.getElementById('primary-nav');
    const root = document.documentElement;
    let scrollFrame = null;
    let previousScrollBehavior = null;
    let scrollTargetId = null;

    function setMenuOpen(isOpen) {
        if (!menuToggle || !sidebarInner || !primaryNav) return;

        menuToggle.setAttribute('aria-expanded', String(isOpen));
        primaryNav.setAttribute('aria-hidden', String(!isOpen));

        if (isOpen) {
            sidebarInner.classList.add('menu-open');
        } else {
            sidebarInner.classList.remove('menu-open');
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
        });
    }

    function setActiveNav(sectionId) {
        let activeLink = null;

        navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === '#' + sectionId;
            link.classList.toggle('active', isActive);
            if (isActive) activeLink = link;
        });

        document.querySelectorAll('.nav-separator').forEach(separator => {
            separator.classList.remove('separator-active');
        });

        const separator = activeLink?.closest('li')?.nextElementSibling;
        if (separator?.classList.contains('nav-separator')) {
            separator.classList.add('separator-active');
        }
    }

    function stopSmoothScroll() {
        if (scrollFrame !== null) {
            cancelAnimationFrame(scrollFrame);
            scrollFrame = null;
        }

        if (previousScrollBehavior !== null) {
            if (previousScrollBehavior) {
                root.style.scrollBehavior = previousScrollBehavior;
            } else {
                root.style.removeProperty('scroll-behavior');
            }
            previousScrollBehavior = null;
        }

        scrollTargetId = null;
    }

    function scrollToSection(section) {
        stopSmoothScroll();
        scrollTargetId = section.id;

        const start = window.scrollY;
        const maxScroll = Math.max(0, Math.max(root.scrollHeight, document.body.scrollHeight) - window.innerHeight);
        const destination = Math.min(Math.max(0, start + section.getBoundingClientRect().top), maxScroll);
        const originalBehavior = root.style.scrollBehavior;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            root.style.scrollBehavior = 'auto';
            window.scrollTo(0, destination);
            root.style.scrollBehavior = originalBehavior;
            scrollTargetId = null;
            updateActiveNav();
            return;
        }

        previousScrollBehavior = originalBehavior;
        root.style.scrollBehavior = 'auto';
        const duration = Math.min(900, Math.max(400, Math.abs(destination - start) * 0.3));
        const startTime = performance.now();

        function animateScroll(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = progress < 0.5
                ? 4 * progress ** 3
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            window.scrollTo(0, start + (destination - start) * eased);

            if (progress < 1) {
                scrollFrame = requestAnimationFrame(animateScroll);
                return;
            }

            const targetId = scrollTargetId;
            scrollFrame = null;
            stopSmoothScroll();
            if (targetId) setActiveNav(targetId);
        }

        scrollFrame = requestAnimationFrame(animateScroll);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const targetId = link.getAttribute('href')?.substring(1);
            const targetSection = targetId && document.getElementById(targetId);

            if (targetSection) {
                history.pushState(null, '', '#' + targetId);
                setMenuOpen(false);
                scrollToSection(targetSection);
                return;
            }

            setMenuOpen(false);
        });
    });

    window.addEventListener('wheel', stopSmoothScroll, { passive: true });
    window.addEventListener('touchstart', stopSmoothScroll, { passive: true });
    window.addEventListener('keydown', event => {
        if (['ArrowDown', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp', ' '].includes(event.key)) {
            stopSmoothScroll();
        }
    });

    window.addEventListener('popstate', () => {
        const target = document.getElementById(window.location.hash.slice(1)) || document.getElementById('Home');
        setActiveNav(target.id);
        scrollToSection(target);
    });

    function updateActiveNav() {
        let currentSection = 'Home';
        const sections = document.querySelectorAll('.page-section');

        sections.forEach(section => {
            if (section.getBoundingClientRect().top <= 100) {
                currentSection = section.getAttribute('id');
            }
        });

        setActiveNav(currentSection);
    }

    window.addEventListener('scroll', updateActiveNav);
    window.addEventListener('load', updateActiveNav);
    updateActiveNav();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmoothScroll);
} else {
    initSmoothScroll();
}