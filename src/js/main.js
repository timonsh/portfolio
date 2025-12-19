"use strict";

// Meta


const meta = {
    id: 'timonsh',
    version: 'v2.0',
    name: 'Timon Schroth [timonsh] · WebByte Studio',
    creator: 'webbytestudio',
};

/* Image Preview Modal */

function preview_image(event, img_src) {
    const preview = document.querySelector('#large-image-preview');
    const previewImg = preview.querySelector('img');
    const nav = document.querySelector('#navigation');
    const navArea = document.querySelector('#nav-area');
    const main = document.querySelector('main');

    if (event === 'view') {
        preview.style.display = 'flex';
        preview.style.animation = 'fade_in 0.5s both';
        nav.style.animation = 'fade_out 0.5s both';
        navArea.style.animation = 'fade_out 0.5s both';
        main.style.filter = 'brightness(0.5)';
        main.style.opacity = '0.5';
        previewImg.src = img_src;
        previewImg.style.animation = 'fade_in 0.5s both';
    } else if (event === 'close') {
        preview.style.animation = 'fade_out 0.5s both';
        setTimeout(() => { preview.style.display = 'none'; }, 500);
        nav.style.animation = 'fade_in 0.5s both';
        navArea.style.animation = 'fade_in 0.5s both';
        main.style.filter = 'brightness(1)';
        main.style.opacity = '1';
    }
}

/* Navigation */

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('#navigation .nav-link');
    const sections = [];

    navLinks.forEach(link => {
        const sectionId = link.getAttribute('data-section');
        const section = document.getElementById(sectionId);
        if (section) {
            sections.push({ id: sectionId, element: section, link: link });
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                let scrollPosition;

                if (targetId === 'nav-area') {
                    scrollPosition = 0;
                } else {
                    const navHeight = document.getElementById('navigation').offsetHeight;
                    const offset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                    scrollPosition = elementPosition - navHeight - offset;
                }

                window.scrollTo({ top: Math.max(0, scrollPosition), behavior: 'smooth' });
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    const updateActiveOnScroll = () => {
        const scrollPosition = window.scrollY;
        const navHeight = document.getElementById('navigation')?.offsetHeight || 0;
        const offset = navHeight + 100;
        let currentSection = sections[0];

        for (const section of sections) {
            if (scrollPosition >= section.element.offsetTop - offset) {
                currentSection = section;
            }
        }

        if (currentSection) {
            navLinks.forEach(l => l.classList.remove('active'));
            currentSection.link.classList.add('active');
        }
    };

    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(() => {
            updateActiveOnScroll();
            scrollTimeout = null;
        }, 50);
    });

    updateActiveOnScroll();

    // Scroll Animations
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
});