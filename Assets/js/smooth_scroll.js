function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebarInner = document.querySelector('.sidebar-inner');
    const primaryNav = document.getElementById('primary-nav');

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

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href')?.substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }

            setMenuOpen(false);
        });
    });

    function updateActiveNav() {
        let currentSection = 'Home';
        const sections = document.querySelectorAll('.page-section');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 100) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active');
                document.querySelectorAll('.nav-separator').forEach(sep => sep.classList.remove('separator-active'));
                const separator = link.closest('li')?.nextElementSibling;
                if (separator && separator.classList.contains('nav-separator')) {
                    separator.classList.add('separator-active');
                }
            }
        });
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