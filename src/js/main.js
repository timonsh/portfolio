"use strict";

// Meta

const meta = {
    id: 'timonsh',
    version: 'v3.1.0',
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
    /* Boot screen: full webbyteOS boot plays on every load */
    setupBootScreen();

    /* Age: fill any [data-birthdate] from the current date — never goes stale */
    setupDynamicAge();

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

    /* Project stack: pin sticky container, glide cards on scroll */
    setupProjectStack();

    /* Cookie consent: GA only after opt-in (DSGVO / TDDDG) */
    setupCookieConsent();

    /* Custom cursor: dot + trailing ring (fine pointer only) */
    setupCustomCursor();

    /* Thin scroll progress bar at the top edge */
    setupScrollProgress();

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
/* Project stack: pinned container with snap-scrolling between cards.
   While the stack is pinned, one wheel/key gesture advances exactly one card
   (an eased scroll animation moves to the next segment center; momentum is
   swallowed while it runs). Rendering itself stays continuous: a lerped
   virtual position follows the scroll, so every switch is a fluid crossfade.
   You can never rest "between" two cards — an idle settle-snap pulls any
   off-center position (scrollbar drags, entry momentum) to the nearest card. */
function setupProjectStack() {
    const wrapper = document.querySelector('.project-stack-wrapper');
    if (!wrapper) return;
    const sticky = wrapper.querySelector('.project-stack-sticky');
    if (!sticky) return;
    const cards = Array.from(sticky.querySelectorAll(':scope > section'));
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
        dot.addEventListener('click', () => snapTo(i, 850));
        progress.appendChild(dot);
    });
    document.body.appendChild(progress);
    const dots = progress.querySelectorAll('button');

    const N = cards.length;
    const HOLD = 0.28;      // central fraction of each segment where a card rests fully visible
    const SMOOTH = 7.5;     // 1/s — time-based easing rate, identical feel on 60 and 144 Hz

    let target = 0;         // scroll-derived position in [0, n-1]
    let current = 0;        // smoothed position that the cards actually render from
    let rafId = null;
    let lastTime = 0;
    let activeDot = -1;

    const computeTarget = () => {
        const rect = wrapper.getBoundingClientRect();
        const range = wrapper.offsetHeight - window.innerHeight;
        const p = range > 0 ? Math.max(0, Math.min(1, -rect.top / range)) : 0;
        // Card i is centered in the middle of its scroll segment
        target = Math.max(0, Math.min(cards.length - 1, p * cards.length - 0.5));
    };

    // Flatten |d| ≤ HOLD to 0 → every card gets a rest zone where it sits still
    const shape = (d) => {
        const ad = Math.abs(d);
        if (ad <= HOLD) return 0;
        return Math.sign(d) * (ad - HOLD) / (1 - HOLD);
    };

    const easeOut = t => 1 - Math.pow(1 - t, 2);

    const render = () => {
        cards.forEach((card, i) => {
            const t = shape(i - current);   // 0 = resting · +1 = waiting below · -1 = gone above
            const away = Math.min(1, Math.abs(t));
            const presence = easeOut(1 - away);
            const y = t * 90;
            const scale = 1 - away * 0.06;
            const blur = (1 - presence) * 5;

            card.style.opacity = presence.toFixed(3);
            card.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
            card.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
            card.style.zIndex = String(100 - Math.round(away * 50));
            card.style.pointerEvents = away < 0.5 ? 'auto' : 'none';
        });

        const idx = Math.round(current);
        if (idx !== activeDot) {
            activeDot = idx;
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }
    };

    const tick = (now) => {
        const dt = lastTime ? Math.min(0.1, (now - lastTime) / 1000) : 1 / 60;
        lastTime = now;
        current += (target - current) * (1 - Math.exp(-SMOOTH * dt));
        if (Math.abs(target - current) < 0.0015) {
            current = target;
            render();
            lastTime = 0;
            rafId = null;
            return;
        }
        render();
        rafId = requestAnimationFrame(tick);
    };

    const kick = () => {
        computeTarget();
        if (!rafId) rafId = requestAnimationFrame(tick);
        scheduleSettle();
    };

    /* --- Snap scrolling: one gesture = exactly one card --- */

    // Fractional, unclamped scroll position in card units (card i rests at i)
    const fracPos = () => {
        const rect = wrapper.getBoundingClientRect();
        const range = wrapper.offsetHeight - window.innerHeight;
        const p = range > 0 ? -rect.top / range : 0;
        return p * N - 0.5;
    };

    const segCenterY = (i) => {
        const rect = wrapper.getBoundingClientRect();
        const wrapperTop = rect.top + window.scrollY;
        const range = wrapper.offsetHeight - window.innerHeight;
        return wrapperTop + (range * (i + 0.5)) / N;
    };

    // The stack counts as pinned while the sticky area fills the viewport
    const isPinned = () => {
        const rect = wrapper.getBoundingClientRect();
        return rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
    };

    let snapAnim = null;
    let snapLock = false;
    let settleTimer = null;

    const animateScrollTo = (toY, duration, done) => {
        if (snapAnim) cancelAnimationFrame(snapAnim);
        const fromY = window.scrollY;
        const delta = toY - fromY;
        if (Math.abs(delta) < 1) {
            snapAnim = null;
            if (done) done();
            return;
        }
        const t0 = performance.now();
        const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const step = (now) => {
            const t = Math.min(1, (now - t0) / duration);
            // 'instant' — the page-wide CSS scroll-behavior:smooth would turn
            // every per-frame set into a native smooth scroll and fight us
            window.scrollTo({ top: fromY + delta * ease(t), behavior: 'instant' });
            if (t < 1) {
                snapAnim = requestAnimationFrame(step);
            } else {
                snapAnim = null;
                if (done) done();
            }
        };
        snapAnim = requestAnimationFrame(step);
    };

    const snapTo = (idx, duration = 800) => {
        snapLock = true;
        clearTimeout(settleTimer);
        animateScrollTo(segCenterY(idx), duration, () => {
            // Keep swallowing trackpad momentum for a beat after arrival
            setTimeout(() => { snapLock = false; }, 300);
        });
    };

    const stepCards = (dir) => {
        const pos = fracPos();
        const idx = dir > 0
            ? Math.min(N - 1, Math.ceil(pos + 0.05))
            : Math.max(0, Math.floor(pos - 0.05));
        snapTo(idx);
    };

    // Distinguish a fresh scroll gesture from a decaying trackpad momentum
    // tail: fresh = pause since the last wheel event, a clearly growing
    // delta, or the constant large notches of a discrete mouse wheel.
    let lastWheelT = 0;
    let lastDelta = 0;
    const isFreshGesture = (delta, now) => {
        const gap = now - lastWheelT;
        if (gap > 220) return true;
        const abs = Math.abs(delta);
        if (abs > Math.abs(lastDelta) * 1.6 + 2) return true;
        return abs >= 80 && Math.abs(abs - Math.abs(lastDelta)) < 1;
    };

    const onWheel = (e) => {
        if (e.ctrlKey) return;                 // pinch-zoom
        if (!isPinned()) return;
        const dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
        if (!dir) return;
        const pos = fracPos();
        // Resting on an edge card + scrolling outward → hand back to the page
        if (dir > 0 && pos >= N - 1 - 0.02) return;
        if (dir < 0 && pos <= 0.02) return;
        e.preventDefault();
        const now = performance.now();
        const fresh = isFreshGesture(e.deltaY, now);
        lastWheelT = now;
        lastDelta = e.deltaY;
        if (snapLock || !fresh) return;
        stepCards(dir);
    };

    const onKey = (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.target instanceof Element && e.target.closest('button, a, input, textarea, select')) return;
        if (!isPinned()) return;
        let dir = 0;
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) dir = 1;
        else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) dir = -1;
        else return;
        const pos = fracPos();
        if (dir > 0 && pos >= N - 1 - 0.02) return;
        if (dir < 0 && pos <= 0.02) return;
        e.preventDefault();
        if (snapLock) return;
        stepCards(dir);
    };

    // Any other scroll input (scrollbar drag, entry momentum): once it goes
    // quiet, pull the nearest card to rest — never park between two cards.
    const scheduleSettle = () => {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
            if (snapLock || !isPinned()) return;
            const pos = fracPos();
            const nearest = Math.max(0, Math.min(N - 1, Math.round(pos)));
            if (Math.abs(pos - nearest) > 0.04) snapTo(nearest, 650);
        }, 150);
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
        window.addEventListener('scroll', kick, { passive: true });
        window.addEventListener('resize', kick, { passive: true });
        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('keydown', onKey);
        computeTarget();
        current = target;   // no glide on initial paint
        render();
    };

    const disable = () => {
        window.removeEventListener('scroll', kick);
        window.removeEventListener('resize', kick);
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('keydown', onKey);
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        if (snapAnim) {
            cancelAnimationFrame(snapAnim);
            snapAnim = null;
        }
        clearTimeout(settleTimer);
        snapLock = false;
        cards.forEach(c => { c.style.cssText = ''; });
        dots.forEach(d => d.classList.remove('active'));
        progress.classList.remove('visible');
        activeDot = -1;
    };

    if (mq.matches) enable();

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

/* ============================================================ */
/* Cookie consent — Google Analytics loads ONLY after opt-in    */
/* (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG)              */
/* ============================================================ */

const CONSENT_KEY = 'wbs-cookie-consent';
const GA_ID = 'G-ZFXZ4GKQ7J';

function loadAnalytics() {
    if (window.__wbsGaLoaded) return;
    window.__wbsGaLoaded = true;
    window['ga-disable-' + GA_ID] = false;

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
}

function applyConsent(choice) {
    try { localStorage.setItem(CONSENT_KEY, choice); } catch (e) { /* storage blocked — session-only */ }
    if (choice === 'granted') {
        loadAnalytics();
    } else {
        // Official GA kill switch — also stops an already-loaded tracker
        window['ga-disable-' + GA_ID] = true;
    }
}

function buildConsentBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie-Einstellungen');
    banner.innerHTML =
        '<div class="cookie-banner-inner">' +
            '<div class="cookie-banner-text">' +
                '<h2>🍪 Cookies & Analyse</h2>' +
                '<p>Diese Website möchte Google Analytics nutzen, um die Nutzung anonym auszuwerten. ' +
                'Der Dienst wird <strong>erst nach deiner Einwilligung</strong> geladen. ' +
                'Details in der <a href="/impressum.html#datenschutz">Datenschutzerklärung</a>.</p>' +
            '</div>' +
            '<div class="cookie-banner-actions">' +
                '<button type="button" class="cookie-btn cookie-decline">Ablehnen</button>' +
                '<button type="button" class="cookie-btn cookie-accept">Akzeptieren</button>' +
            '</div>' +
        '</div>';

    banner.querySelector('.cookie-accept').addEventListener('click', () => {
        applyConsent('granted');
        hideConsentBanner();
    });
    banner.querySelector('.cookie-decline').addEventListener('click', () => {
        applyConsent('denied');
        hideConsentBanner();
    });
    return banner;
}

// Shared so a reopen can cancel an in-flight removal (see below)
let bannerRemoveTimer = null;

function showConsentBanner() {
    // A hide() may be mid-flight: the banner is fading out and already
    // scheduled for removal. Cancel that — otherwise tapping "Cookies" in
    // the footer right after a choice would rebuild the banner only for the
    // old timer to yank it straight back out ("nothing happens").
    if (bannerRemoveTimer) {
        clearTimeout(bannerRemoveTimer);
        bannerRemoveTimer = null;
    }

    let banner = document.getElementById('cookie-banner');
    if (!banner) {
        banner = buildConsentBanner();
        document.body.appendChild(banner);
    }
    // Double rAF so the entry transition reliably plays after insertion
    requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('show')));
}

function hideConsentBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    banner.classList.remove('show');
    if (bannerRemoveTimer) clearTimeout(bannerRemoveTimer);
    bannerRemoveTimer = setTimeout(() => {
        banner.remove();
        bannerRemoveTimer = null;
    }, 600);
}

/* Global — reopens the banner; wired to the "Cookies" footer button via inline onclick */
function cookie_settings() {
    showConsentBanner();
}

function setupCookieConsent() {
    let stored = null;
    try { stored = localStorage.getItem(CONSENT_KEY); } catch (e) { /* storage blocked */ }

    if (stored === 'granted') {
        loadAnalytics();
    } else if (stored === 'denied') {
        window['ga-disable-' + GA_ID] = true;
    } else {
        showConsentBanner();
    }
}

/* ============================================================ */
/* Boot screen — OS-style opening, full boot once per session   */
/* ============================================================ */

function setupBootScreen() {
    const boot = document.getElementById('boot-screen');
    if (!boot) return;

    // The full webbyteOS boot plays on every load (pure-CSS timeline in
    // style.css). We only need to drop the overlay once its hide animation
    // is done so it can never sit on top of the page and trap clicks.
    setTimeout(() => boot.remove(), 2350);
}

/* ============================================================ */
/* Dynamic age — computed from a birthdate, so the copy is       */
/* always correct without anyone ever editing it                 */
/* ============================================================ */

function ageFromBirthdate(birthISO) {
    const birth = new Date(birthISO + 'T00:00:00');
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function setupDynamicAge() {
    document.querySelectorAll('[data-birthdate]').forEach((el) => {
        const age = ageFromBirthdate(el.getAttribute('data-birthdate'));
        // Only overwrite with a sane value; otherwise keep the HTML fallback
        if (age !== null && age > 0 && age < 130) {
            el.textContent = String(age);
        }
    });
}

/* ============================================================ */
/* Custom cursor — iPadOS-style: one translucent blob that      */
/* snaps onto compact controls and morphs into their shape      */
/* ============================================================ */

function setupCustomCursor() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduceMotion || !finePointer) return;

    const blob = document.createElement('div');
    blob.id = 'cursor-blob';
    blob.setAttribute('aria-hidden', 'true');
    document.body.appendChild(blob);
    document.documentElement.classList.add('custom-cursor');

    const SIZE = 22;        // resting circle diameter
    const FOLLOW = 30;      // 1/s — quick, near-1:1 like iPadOS
    const HOVER_SELECTOR = 'a, button, input, textarea, select, [onclick]';

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let x = mx, y = my;
    let rafId = null;
    let lastTime = 0;
    let shown = false;
    let hoverEl = null;

    // Only compact controls get the snap-morph — large cards keep the blob
    const morphTarget = (node) => {
        if (!(node instanceof Element)) return null;
        const el = node.closest(HOVER_SELECTOR);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        if (r.width > 420 || r.height > 110 || r.width < 8) return null;
        return el;
    };

    const tick = (now) => {
        const dt = lastTime ? Math.min(0.1, (now - lastTime) / 1000) : 1 / 60;
        lastTime = now;
        const a = 1 - Math.exp(-FOLLOW * dt);

        let tx = mx, ty = my;
        if (hoverEl) {
            // Snapped: sit on the control's center, with a gentle parallax
            // pull toward the real pointer — the iPadOS "magnet" feel
            const r = hoverEl.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            tx = cx + (mx - cx) * 0.15;
            ty = cy + (my - cy) * 0.22;
        }

        x += (tx - x) * a;
        y += (ty - y) * a;
        blob.style.setProperty('--x', x.toFixed(1) + 'px');
        blob.style.setProperty('--y', y.toFixed(1) + 'px');

        // While snapped, keep following (the control moves when scrolling)
        const settled = !hoverEl && Math.abs(tx - x) < 0.15 && Math.abs(ty - y) < 0.15;
        if (settled) {
            lastTime = 0;
            rafId = null;
        } else {
            rafId = requestAnimationFrame(tick);
        }
    };

    const kick = () => { if (!rafId) rafId = requestAnimationFrame(tick); };

    const setHover = (el) => {
        if (el === hoverEl) return;
        hoverEl = el;
        if (el) {
            const r = el.getBoundingClientRect();
            const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius);
            const pad = Math.min(10, Math.max(6, r.height * 0.12));
            blob.style.width = (r.width + pad) + 'px';
            blob.style.height = (r.height + pad) + 'px';
            blob.style.borderRadius = Math.min(
                (isNaN(radius) ? 12 : radius + pad / 2),
                (r.height + pad) / 2
            ) + 'px';
            document.documentElement.classList.add('cursor-morph');
        } else {
            blob.style.width = '';
            blob.style.height = '';
            blob.style.borderRadius = '';
            document.documentElement.classList.remove('cursor-morph');
        }
        kick();
    };

    window.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        if (!shown) {
            shown = true;
            // Skip the fly-in from screen center on first contact
            x = mx;
            y = my;
            document.documentElement.classList.add('cursor-visible');
        }
        kick();
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
        document.documentElement.classList.remove('cursor-visible');
    });
    document.addEventListener('mouseenter', () => {
        if (shown) document.documentElement.classList.add('cursor-visible');
    });

    window.addEventListener('mousedown', () => {
        document.documentElement.classList.add('cursor-down');
    }, { passive: true });
    window.addEventListener('mouseup', () => {
        document.documentElement.classList.remove('cursor-down');
    }, { passive: true });

    document.addEventListener('mouseover', (e) => {
        // Inside the WebByte Studio Tag its own custom cursor takes over:
        // hide the site blob and don't snap-morph onto the badge's controls.
        const inBadge = e.target instanceof Element && e.target.closest('.studio-badge');
        document.documentElement.classList.toggle('cursor-in-badge', !!inBadge);
        setHover(inBadge ? null : morphTarget(e.target));
    }, { passive: true });

    // If the snapped control scrolls away or gets removed, release the morph
    window.addEventListener('scroll', () => {
        if (hoverEl && !document.contains(hoverEl)) setHover(null);
    }, { passive: true });
}

/* ============================================================ */
/* Scroll progress — hairline gradient bar at the very top      */
/* ============================================================ */

function setupScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    let ticking = false;
    const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
}
