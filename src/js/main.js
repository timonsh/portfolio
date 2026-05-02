"use strict";

// Meta

const meta = {
    id: 'timonsh',
    version: 'v2.1.1',
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

    // Scroll Animations (legacy .animate-on-scroll + simple .reveal-up)
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .reveal-up');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.12 });

    animatedElements.forEach(el => observer.observe(el));

    /* Keyboard close for image preview */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const preview = document.querySelector('#large-image-preview');
            if (preview && preview.style.display === 'flex') {
                preview_image('close');
            }
        }
    });

    /* FWG live embed: load iframe when in view, image as fallback */
    setupLiveEmbed();

    /* Hero terminal: typewriter cycling through commands */
    setupHeroTerminal();

    /* Support buttons: particle burst + pulse before navigating */
    setupSupportButtons();

    /* Project stack: pin sticky container, switch active card on scroll */
    setupProjectStack();

    /* Nav: compact + widened state once user scrolled past hero */
    const navArea = document.getElementById('nav-area');
    if (navArea) {
        const SCROLL_THRESHOLD = 80;
        let navScrolled = false;
        const updateNavState = () => {
            const should = window.scrollY > SCROLL_THRESHOLD;
            if (should !== navScrolled) {
                navScrolled = should;
                navArea.classList.toggle('nav-scrolled', should);
            }
        };
        window.addEventListener('scroll', updateNavState, { passive: true });
        updateNavState();
    }

    /* Cursor-tracked grid mask — smooth lerp, idle = no rAF */
    const grid = document.getElementById('bg-grid');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    if (grid && !reduceMotion && !coarsePointer) {
        let tx = window.innerWidth / 2;
        let ty = window.innerHeight / 2;
        let cx = tx;
        let cy = ty;
        let rafId = null;

        const tick = () => {
            cx += (tx - cx) * 0.16;
            cy += (ty - cy) * 0.16;
            grid.style.setProperty('--mx', cx.toFixed(1) + 'px');
            grid.style.setProperty('--my', cy.toFixed(1) + 'px');
            if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) {
                rafId = requestAnimationFrame(tick);
            } else {
                rafId = null;
            }
        };

        window.addEventListener('mousemove', (e) => {
            tx = e.clientX;
            ty = e.clientY;
            if (!rafId) rafId = requestAnimationFrame(tick);
        }, { passive: true });
    }
});

/* Live website embed: iframe when truly reachable + embeddable, image as fallback. */
function setupLiveEmbed() {
    document.querySelectorAll('.embed-frame[data-src]').forEach((frame) => {
        const iframe = frame.querySelector('iframe');
        const url = frame.dataset.src;
        if (!iframe || !url) return;

        const IFRAME_W = 1400;
        const fitScale = () => {
            const w = frame.clientWidth;
            if (w > 0) frame.style.setProperty('--embed-scale', (w / IFRAME_W).toFixed(4));
        };
        fitScale();
        window.addEventListener('resize', fitScale, { passive: true });

        // Did the iframe actually load the cross-origin content, or is it stuck on about:blank?
        // Cross-origin success → reading contentWindow.location.href throws SecurityError.
        // Blocked / failed (X-Frame-Options, CSP, mixed content, network) → URL is "about:blank".
        const isContentLoaded = () => {
            try {
                const win = iframe.contentWindow;
                if (!win) return false;
                const href = win.location.href;
                return href && href !== 'about:blank' && href !== '';
            } catch (e) {
                return e && e.name === 'SecurityError';
            }
        };

        let started = false;
        const start = () => {
            if (started) return;
            started = true;

            let resolved = false;
            const fail = () => {
                if (resolved) return;
                resolved = true;
                frame.classList.add('embed-failed');
                frame.classList.remove('embed-ready');
            };
            const succeed = () => {
                if (resolved) return;
                resolved = true;
                frame.classList.add('embed-ready');
            };

            iframe.addEventListener('load', () => {
                // Defer the check — some browsers blank the iframe between load and the block notice.
                setTimeout(() => {
                    if (isContentLoaded()) succeed();
                    else fail();
                }, 150);
            }, { once: true });

            iframe.addEventListener('error', fail, { once: true });
            setTimeout(fail, 8000); // hard cap

            iframe.src = url;
        };

        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        start();
                        obs.disconnect();
                    }
                });
            }, { rootMargin: '300px' });
            obs.observe(frame);
        } else {
            start();
        }
    });
}
/* Project stack: pin section, switch active card based on scroll position */
function setupProjectStack() {
    const wrapper = document.querySelector('.project-stack-wrapper');
    if (!wrapper) return;
    const sticky = wrapper.querySelector('.project-stack-sticky');
    if (!sticky) return;
    const cards = sticky.querySelectorAll(':scope > section');
    if (!cards.length) return;

    wrapper.style.setProperty('--card-count', cards.length);

    cards.forEach(c => {
        c.classList.remove('animate-on-scroll', 'visible');
    });

    // Build the side progress indicator
    const progress = document.createElement('div');
    progress.className = 'stack-progress';
    progress.setAttribute('aria-hidden', 'true');
    cards.forEach((card, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.dataset.idx = i;
        const label = card.querySelector('h1');
        dot.title = label ? label.textContent.trim() : `Projekt ${i + 1}`;
        dot.addEventListener('click', () => {
            // getBoundingClientRect + scrollY gives reliable absolute Y regardless of layout
            const rect = wrapper.getBoundingClientRect();
            const wrapperTop = rect.top + window.scrollY;
            const range = wrapper.offsetHeight - window.innerHeight;
            // Land in the middle of the i-th segment so the right card activates
            const target = wrapperTop + (range * (i + 0.5)) / cards.length;
            window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
        });
        progress.appendChild(dot);
    });
    document.body.appendChild(progress);
    const dots = progress.querySelectorAll('button');

    let activeIdx = -1;
    const setActive = (newIdx) => {
        if (newIdx === activeIdx) return;
        activeIdx = newIdx;
        cards.forEach((card, i) => {
            card.classList.toggle('stack-active', i === activeIdx);
            card.classList.toggle('stack-prev', i < activeIdx);
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
    };

    let ticking = false;
    const update = () => {
        const rect = wrapper.getBoundingClientRect();
        const range = wrapper.offsetHeight - window.innerHeight;
        const p = range > 0
            ? Math.max(0, Math.min(1, -rect.top / range))
            : 0;
        const idx = Math.min(
            Math.floor(p * cards.length),
            cards.length - 1
        );
        setActive(idx);
        ticking = false;
    };

    const onScroll = () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    };

    // Show/hide the progress indicator only while we're in the pinned area
    if ('IntersectionObserver' in window) {
        const visObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                progress.classList.toggle('visible', entry.isIntersecting);
            });
        }, { rootMargin: '-15% 0px -15% 0px', threshold: 0 });
        visObserver.observe(wrapper);
    }

    const mq = window.matchMedia(
        '(min-width: 916px) and (prefers-reduced-motion: no-preference)'
    );

    const enable = () => {
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        update();
    };

    const disable = () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        cards.forEach(c => c.classList.remove('stack-active', 'stack-prev'));
        dots.forEach(d => d.classList.remove('active'));
        progress.classList.remove('visible');
        activeIdx = -1;
    };

    if (mq.matches) {
        enable();
    } else {
        cards.forEach(c => c.classList.remove('stack-active', 'stack-prev'));
    }

    mq.addEventListener('change', (e) => {
        if (e.matches) enable();
        else disable();
    });
}

/* Hero terminal: typewriter cycling through fake shell commands */
function setupHeroTerminal() {
    const terminal = document.querySelector('.hero-terminal');
    if (!terminal) return;
    const cmdEl = terminal.querySelector('[data-cycle]');
    const outEl = terminal.querySelector('[data-cycle-output]');
    if (!cmdEl || !outEl) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Each entry: [command, outputHtml]
    const commands = [
        ['cat timon.sh',
         '<span class="out-muted">#!/bin/sh</span> · <span class="out-accent">timon schroth</span> · frontend dev'],
        ['ls /projects',
         'memory-shift  fwg-bsp  ghostcrypt  dunkle-geschichten'],
        ['sudo pacman -S git',
         '<span class="out-accent">::</span> git is up to date <span class="out-muted">— nothing to do</span>'],
        ['echo $STACK',
         '<span class="out-accent">javascript</span> · <span class="out-accent">html</span> · <span class="out-accent">css</span>'],
        ['ping archlinux.org',
         '<span class="out-muted">64 bytes from</span> <span class="out-accent">archlinux.org</span> <span class="out-muted">: time=12.3 ms</span>'],
    ];

    let cmdIndex = 0;
    const TYPE_SPEED = 85;     // ms per character
    const ERASE_SPEED = 38;    // ms per character (erase faster)
    const HOLD_AFTER_TYPE = 2800;
    const HOLD_AFTER_ERASE = 550;

    if (reduceMotion) {
        // Just show the first one, no animation
        const [cmd, out] = commands[0];
        cmdEl.textContent = cmd;
        outEl.innerHTML = out;
        return;
    }

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    const typeText = async (el, text) => {
        terminal.classList.add('typing');
        for (let i = 0; i <= text.length; i++) {
            el.textContent = text.slice(0, i);
            await sleep(TYPE_SPEED + Math.random() * 35);
        }
        terminal.classList.remove('typing');
    };

    const eraseText = async (el) => {
        terminal.classList.add('typing');
        const text = el.textContent;
        for (let i = text.length; i >= 0; i--) {
            el.textContent = text.slice(0, i);
            await sleep(ERASE_SPEED);
        }
        terminal.classList.remove('typing');
    };

    const fadeSet = async (el, html) => {
        el.style.opacity = '0';
        await sleep(180);
        el.innerHTML = html;
        el.style.opacity = '1';
    };

    const cycle = async () => {
        while (true) {
            const [cmd, out] = commands[cmdIndex];
            await typeText(cmdEl, cmd);
            await sleep(280);
            await fadeSet(outEl, out);
            await sleep(HOLD_AFTER_TYPE);
            await fadeSet(outEl, '');
            await sleep(120);
            await eraseText(cmdEl);
            await sleep(HOLD_AFTER_ERASE);
            cmdIndex = (cmdIndex + 1) % commands.length;
        }
    };

    // Only start when terminal is visible — saves cycles when off-screen
    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    cycle();
                    obs.disconnect();
                }
            });
        }, { rootMargin: '0px', threshold: 0.4 });
        obs.observe(terminal);
    } else {
        cycle();
    }
}

/* Support buttons: brand-colored pulse + particle burst, then navigate */
function setupSupportButtons() {
    const buttons = document.querySelectorAll('.support-btn');
    if (!buttons.length) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const url = btn.href;
            if (!url) return;

            // Reduced motion: just open the link with no theatrics
            if (reduceMotion) return;

            e.preventDefault();

            const isCoffee = btn.classList.contains('support-bmc');
            const symbol = isCoffee ? '☕' : '❤️';

            // Re-trigger the pulse class
            btn.classList.remove('support-clicked');
            void btn.offsetWidth;
            btn.classList.add('support-clicked');

            // Spawn 7 particles bursting from the button center
            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const COUNT = 7;

            for (let i = 0; i < COUNT; i++) {
                const particle = document.createElement('span');
                particle.className = 'support-particle';
                particle.textContent = symbol;
                particle.style.left = cx + 'px';
                particle.style.top  = cy + 'px';

                // Spread upward in a fan (-70° to +70° from straight up)
                const angle = (Math.random() - 0.5) * Math.PI * 0.78;
                const distance = 80 + Math.random() * 60;
                const tx = Math.sin(angle) * distance;
                const ty = -Math.cos(angle) * distance - 20;
                particle.style.setProperty('--tx', tx.toFixed(1) + 'px');
                particle.style.setProperty('--ty', ty.toFixed(1) + 'px');
                particle.style.setProperty('--rot', ((Math.random() - 0.5) * 90).toFixed(0) + 'deg');
                particle.style.setProperty('--scale-end', (0.6 + Math.random() * 0.4).toFixed(2));
                particle.style.animationDelay = (i * 35) + 'ms';

                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 1300);
            }

            // Navigate after pulse + first wave of particles is visible
            setTimeout(() => {
                btn.classList.remove('support-clicked');
                window.open(url, '_blank', 'noopener');
            }, 600);
        });
    });
}
