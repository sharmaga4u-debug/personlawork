/* ==========================================================================
   Giresh Sharma Annavajhala - Portfolio FX Layer
   WebGL aurora background, custom cursor, magnetic buttons, card spotlight
   & tilt, kinetic hero intro, text scramble, scroll FX and a ⌘K palette.
   Loaded after app.js; every effect degrades gracefully.
   ========================================================================== */

(function () {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    document.addEventListener('DOMContentLoaded', () => {
        initShaderBackground();
        initMarquee();
        initHeroIntro();
        initSectionTitles();
        initScramble();
        initScrollFx();
        initMobileMenu();
        initCardClicks();
        initCommandPalette();
        initSpotlight();
        if (finePointer && !reduceMotion) {
            initCursor();
            initMagnetic();
            initTilt();
        }
    });

    /* ----------------------------------------------------------------------
       1. WebGL Aurora Background (falls back to the particle canvas)
       ---------------------------------------------------------------------- */
    const VERT = `
        attribute vec2 a_pos;
        void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;

    const FRAG = `
        precision mediump float;
        uniform vec2 u_res;
        uniform float u_time;
        uniform vec2 u_mouse;
        uniform float u_light;
        uniform float u_scroll;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                       mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
        }
        float fbm(vec2 p) {
            float v = 0.0, a = 0.5;
            for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
            return v;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / u_res;
            float aspect = u_res.x / u_res.y;
            vec2 p = uv; p.x *= aspect;
            vec2 m = u_mouse; m.x *= aspect;
            float t = u_time * 0.045;

            // Domain-warped fbm -> flowing aurora ribbons
            vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 5.2));
            vec2 r = vec2(fbm(p * 1.4 + 4.0 * q + vec2(1.7, 9.2) + t * 1.5),
                          fbm(p * 1.4 + 4.0 * q + vec2(8.3, 2.8) - t));
            float f = fbm(p * 1.4 + 4.0 * r + u_scroll * 0.35);

            float glow = exp(-3.2 * distance(p, m));

            vec3 bg = mix(vec3(0.039, 0.055, 0.090), vec3(0.972, 0.980, 0.988), u_light);
            vec3 cyan = vec3(0.0, 0.95, 1.0);
            vec3 violet = vec3(0.50, 0.0, 1.0);
            vec3 pink = vec3(1.0, 0.31, 0.80);

            vec3 col = mix(violet, cyan, clamp(q.x * 1.25, 0.0, 1.0));
            col = mix(col, pink, clamp(r.y * r.y * 0.8, 0.0, 1.0));

            float intensity = smoothstep(0.32, 0.95, f) * (0.55 + glow * 0.75);
            float strength = mix(0.42, 0.22, u_light);
            vec3 c = mix(bg, col, intensity * strength);

            // Soft vignette in dark mode
            float vig = smoothstep(1.25, 0.25, length(uv - 0.5));
            c *= mix(0.72 + 0.28 * vig, 1.0, u_light);

            gl_FragColor = vec4(c, 1.0);
        }
    `;

    function initShaderBackground() {
        const canvas = document.getElementById('gl-bg');
        const particleFallback = () => {
            canvas?.remove();
            if (typeof initCanvasBackground === 'function') initCanvasBackground();
        };
        if (!canvas) return particleFallback();

        const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
        if (!gl) return particleFallback();

        const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
        };
        const vs = compile(gl.VERTEX_SHADER, VERT);
        const fs = compile(gl.FRAGMENT_SHADER, FRAG);
        if (!vs || !fs) return particleFallback();

        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return particleFallback();
        gl.useProgram(prog);

        // WebGL is working: the particle canvas is no longer needed
        document.getElementById('bg-canvas')?.remove();

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(prog, 'a_pos');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const u = {
            res: gl.getUniformLocation(prog, 'u_res'),
            time: gl.getUniformLocation(prog, 'u_time'),
            mouse: gl.getUniformLocation(prog, 'u_mouse'),
            light: gl.getUniformLocation(prog, 'u_light'),
            scroll: gl.getUniformLocation(prog, 'u_scroll')
        };

        // Render at reduced resolution: the output is a soft gradient anyway
        const scale = window.innerWidth < 768 ? 0.35 : 0.5;
        const resize = () => {
            canvas.width = Math.max(1, Math.floor(window.innerWidth * scale));
            canvas.height = Math.max(1, Math.floor(window.innerHeight * scale));
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(u.res, canvas.width, canvas.height);
        };
        resize();
        window.addEventListener('resize', resize);

        const target = { x: 0.7, y: 0.6 };
        const mouse = { x: 0.7, y: 0.6 };
        window.addEventListener('pointermove', (e) => {
            target.x = e.clientX / window.innerWidth;
            target.y = 1 - e.clientY / window.innerHeight;
        }, { passive: true });

        const isLight = () => root.getAttribute('data-theme') === 'light' ? 1 : 0;
        let light = isLight();
        let running = true;
        const start = performance.now();

        let last = start;
        const draw = (now) => {
            // Time-based easing so slow devices don't lag behind the theme or pointer
            const dt = Math.min((now - last) / 1000, 0.1);
            last = now;
            const follow = 1 - Math.exp(-dt * 2.5);
            mouse.x += (target.x - mouse.x) * follow;
            mouse.y += (target.y - mouse.y) * follow;
            light += (isLight() - light) * (1 - Math.exp(-dt * 8));
            const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

            gl.uniform1f(u.time, (now - start) / 1000);
            gl.uniform2f(u.mouse, mouse.x, mouse.y);
            gl.uniform1f(u.light, light);
            gl.uniform1f(u.scroll, window.scrollY / maxScroll);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };

        if (reduceMotion) {
            // Static frame, redrawn only when the theme changes
            light = isLight();
            draw(start + 20000);
            new MutationObserver(() => { light = isLight(); draw(start + 20000); })
                .observe(root, { attributes: true, attributeFilter: ['data-theme'] });
            return;
        }

        const loop = (now) => {
            if (!running) return;
            draw(now);
            requestAnimationFrame(loop);
        };
        document.addEventListener('visibilitychange', () => {
            running = !document.hidden;
            if (running) requestAnimationFrame(loop);
        });
        requestAnimationFrame(loop);
    }

    /* ----------------------------------------------------------------------
       2. Tech Marquee Band
       ---------------------------------------------------------------------- */
    function initMarquee() {
        const host = document.getElementById('fx-marquee');
        if (!host) return;

        const rows = [
            ['React', 'Next.js', 'TypeScript', 'Node.js', 'BFF Architecture', 'AEM', 'Three.js', 'WebRTC'],
            ['Cybersecurity', 'Firebase', 'MySQL', 'Docker', 'Kubernetes', 'Capacitor', 'React Native', 'Python']
        ];

        host.innerHTML = rows.map((row, i) => {
            const items = row.map((t, j) =>
                `<span class="fx-marquee-item${j % 2 ? ' is-outline' : ''}">${t}</span><span class="fx-marquee-star">✦</span>`
            ).join('');
            return `<div class="fx-marquee-row${i % 2 ? ' reverse' : ''}"><div class="fx-marquee-track">${items}${items}${items}</div></div>`;
        }).join('');
    }

    /* ----------------------------------------------------------------------
       3. Kinetic Typography (word-by-word mask reveal)
       ---------------------------------------------------------------------- */
    function splitWords(el) {
        let i = 0;
        const wrap = (text, cls) => {
            const outer = document.createElement('span');
            outer.className = 'w';
            const inner = document.createElement('span');
            inner.className = 'w-i' + (cls ? ' ' + cls : '');
            inner.style.setProperty('--i', i++);
            inner.textContent = text;
            outer.append(inner);
            return outer;
        };

        const nodes = [...el.childNodes];
        el.textContent = '';
        nodes.forEach((node) => {
            const cls = node.nodeType === 1 ? node.className : '';
            node.textContent.split(/(\s+)/).forEach((part) => {
                if (!part) return;
                if (/^\s+$/.test(part)) el.append(' ');
                else el.append(wrap(part, cls));
            });
        });
    }

    function initHeroIntro() {
        const title = document.querySelector('.hero-title');
        const content = document.querySelector('.hero-content');
        clearTimeout(window.__fxFailsafe);

        if (!title || !content || reduceMotion) {
            root.classList.add('fx-intro');
            return;
        }

        splitWords(title);
        [...content.children].forEach((child, idx) => child.style.setProperty('--d', idx));

        const play = () => {
            if (root.classList.contains('fx-intro')) return;
            requestAnimationFrame(() => root.classList.add('fx-intro'));
            countUpMetrics();
        };

        const gate = document.getElementById('access-gate');
        const gateOpen = gate && !gate.classList.contains('unlocked') && gate.style.display !== 'none';
        if (gateOpen) document.addEventListener('portfolio:unlocked', play, { once: true });
        else play();
    }

    function countUpMetrics() {
        document.querySelectorAll('.metric-num').forEach((el, idx) => {
            const match = el.textContent.trim().match(/^([\d.]+)(.*)$/);
            if (!match) return;
            const targetVal = parseFloat(match[1]);
            const decimals = (match[1].split('.')[1] || '').length;
            const suffix = match[2];
            const begin = performance.now() + 900 + idx * 150;
            const duration = 1600;

            el.textContent = (0).toFixed(decimals) + suffix;
            const tick = (now) => {
                const t = Math.min(Math.max((now - begin) / duration, 0), 1);
                const eased = 1 - Math.pow(1 - t, 4);
                el.textContent = (targetVal * eased).toFixed(decimals) + suffix;
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
    }

    function initSectionTitles() {
        // Relies on app.js scroll reveal adding .in-view to .section-header
        if (reduceMotion || !('IntersectionObserver' in window)) return;
        document.querySelectorAll('.section-title').forEach(splitWords);
    }

    /* ----------------------------------------------------------------------
       4. Text Scramble (section tags on reveal, nav links on hover)
       ---------------------------------------------------------------------- */
    const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEF';

    function scrambleText(node, finalText, duration = 700) {
        const begin = performance.now();
        const len = finalText.length;
        const step = (now) => {
            const p = Math.min((now - begin) / duration, 1);
            const revealed = Math.floor(p * len);
            let out = finalText.slice(0, revealed);
            for (let i = revealed; i < len; i++) {
                out += /\s/.test(finalText[i]) ? finalText[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }
            node.textContent = out;
            if (p < 1) requestAnimationFrame(step);
            else node.textContent = finalText;
        };
        requestAnimationFrame(step);
    }

    function lastTextNode(el) {
        const nodes = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim());
        return nodes[nodes.length - 1];
    }

    function initScramble() {
        if (reduceMotion || !('IntersectionObserver' in window)) return;

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const node = lastTextNode(entry.target);
                if (node) scrambleText(node, node.textContent);
                io.unobserve(entry.target);
            });
        }, { threshold: 0.6 });
        document.querySelectorAll('.section-tag').forEach(tag => io.observe(tag));

        if (!finePointer) return;
        document.querySelectorAll('.nav-links .nav-link').forEach((link) => {
            const node = link.firstChild;
            if (!node || node.nodeType !== 3) return;
            const text = node.textContent;
            let busy = false;
            link.addEventListener('mouseenter', () => {
                if (busy) return;
                busy = true;
                link.style.width = link.offsetWidth + 'px';
                link.style.display = 'inline-block';
                scrambleText(node, text, 380);
                setTimeout(() => {
                    link.style.width = '';
                    link.style.display = '';
                    busy = false;
                }, 420);
            });
        });
    }

    /* ----------------------------------------------------------------------
       5. Scroll FX: progress bar, floating navbar, scrollspy, timeline fill
       ---------------------------------------------------------------------- */
    function initScrollFx() {
        const bar = document.createElement('div');
        bar.className = 'fx-progress';
        document.body.append(bar);

        const navbar = document.getElementById('navbar');
        const timeline = document.querySelector('.timeline');
        let fill = null;
        if (timeline) {
            fill = document.createElement('div');
            fill.className = 'timeline-progress';
            timeline.prepend(fill);
        }

        const links = [...document.querySelectorAll('.nav-links .nav-link')];
        const sections = links
            .map(l => document.querySelector(l.getAttribute('href')))
            .filter(Boolean);

        let ticking = false;
        const update = () => {
            ticking = false;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
            if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);

            if (fill) {
                const r = timeline.getBoundingClientRect();
                const p = Math.min(Math.max((window.innerHeight * 0.6 - r.top) / r.height, 0), 1);
                fill.style.transform = `scaleY(${p})`;
            }

            let current = null;
            sections.forEach((sec) => {
                if (sec.getBoundingClientRect().top < window.innerHeight * 0.4) current = sec.id;
            });
            links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        }, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    /* ----------------------------------------------------------------------
       6. Mobile Menu
       ---------------------------------------------------------------------- */
    function initMobileMenu() {
        const btn = document.getElementById('mobile-toggle');
        const nav = document.getElementById('nav-links');
        if (!btn || !nav) return;
        const icon = btn.querySelector('i');

        const setOpen = (open) => {
            nav.classList.toggle('active', open);
            btn.setAttribute('aria-expanded', String(open));
            btn.setAttribute('aria-label', open ? 'Close Menu' : 'Open Menu');
            if (icon) icon.className = open ? 'ri-close-line' : 'ri-menu-3-line';
        };

        btn.addEventListener('click', () => setOpen(!nav.classList.contains('active')));
        nav.addEventListener('click', (e) => {
            if (e.target.closest('a')) setOpen(false);
        });
    }

    /* ----------------------------------------------------------------------
       7. Whole project card opens its details
       ---------------------------------------------------------------------- */
    function initCardClicks() {
        const grid = document.getElementById('portfolio-grid');
        if (!grid || typeof openProjectModal !== 'function') return;
        grid.addEventListener('click', (e) => {
            if (e.target.closest('a, button')) return;
            const card = e.target.closest('.project-card');
            if (card) openProjectModal(card.dataset.project);
        });
    }

    /* ----------------------------------------------------------------------
       8. Custom Cursor
       ---------------------------------------------------------------------- */
    function initCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'fx-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        cursor.innerHTML = '<div class="fx-cursor-ring"><span class="fx-cursor-label"></span></div><div class="fx-cursor-dot"></div>';
        document.body.append(cursor);
        root.classList.add('fx-has-cursor');

        const ring = cursor.querySelector('.fx-cursor-ring');
        const dot = cursor.querySelector('.fx-cursor-dot');
        const label = cursor.querySelector('.fx-cursor-label');

        let x = -100, y = -100, rx = -100, ry = -100;
        let visible = false;

        window.addEventListener('pointermove', (e) => {
            x = e.clientX;
            y = e.clientY;
            if (!visible) {
                visible = true;
                rx = x;
                ry = y;
                cursor.classList.add('is-visible');
            }
            dot.style.transform = `translate(${x}px, ${y}px)`;
        }, { passive: true });

        document.documentElement.addEventListener('mouseleave', () => {
            visible = false;
            cursor.classList.remove('is-visible');
        });

        document.addEventListener('mouseover', (e) => {
            const t = e.target;
            const text = t.closest('input, textarea, select');
            const interactive = t.closest('a, button, .tab-btn, label, [role="option"]');
            const view = t.closest('.project-card');
            cursor.classList.toggle('is-text', !!text);
            cursor.classList.toggle('is-hover', !!interactive && !text);
            cursor.classList.toggle('is-view', !!view && !interactive && !text);
            label.textContent = view && !interactive && !text ? 'View' : '';
        });

        window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
        window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

        const loop = () => {
            rx += (x - rx) * 0.18;
            ry += (y - ry) * 0.18;
            ring.style.transform = `translate(${rx}px, ${ry}px)`;
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    /* ----------------------------------------------------------------------
       9. Magnetic Buttons
       ---------------------------------------------------------------------- */
    function initMagnetic() {
        document.querySelectorAll('.btn, .theme-toggle-btn, .social-link, .cmdk-trigger, .launch-pill').forEach((el) => {
            const strength = el.classList.contains('btn-block') ? 0.06 : 0.28;
            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2);
                const dy = e.clientY - (r.top + r.height / 2);
                el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
            });
            el.addEventListener('pointerleave', () => { el.style.transform = ''; });
        });
    }

    /* ----------------------------------------------------------------------
       10. 3D Tilt (cards) & phone parallax (featured project)
       ---------------------------------------------------------------------- */
    function initTilt() {
        document.querySelectorAll('.project-card:not(.featured-project), .feature-card, .avatar-card').forEach((el) => {
            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                el.style.transform = `perspective(1000px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg) translateY(-4px)`;
            });
            el.addEventListener('pointerleave', () => { el.style.transform = ''; });
        });

        const featured = document.querySelector('.featured-project');
        const visual = featured?.querySelector('.featured-visual');
        if (featured && visual) {
            featured.addEventListener('pointermove', (e) => {
                const r = featured.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                visual.style.transform = `perspective(900px) rotateY(${(px * 14).toFixed(2)}deg) rotateX(${(-py * 10).toFixed(2)}deg) translate(${(px * 18).toFixed(1)}px, ${(py * 12).toFixed(1)}px)`;
            });
            featured.addEventListener('pointerleave', () => { visual.style.transform = ''; });
        }
    }

    /* ----------------------------------------------------------------------
       11. Spotlight glow that follows the pointer inside cards
       ---------------------------------------------------------------------- */
    const SPOT = '.project-card, .feature-card, .skill-card, .timeline-content, .contact-form-container, .terminal-container, .footer-mega';

    function initSpotlight() {
        if (!finePointer) return;
        document.addEventListener('pointermove', (e) => {
            const el = e.target.closest && e.target.closest(SPOT);
            if (!el) return;
            const r = el.getBoundingClientRect();
            el.style.setProperty('--mx', `${e.clientX - r.left}px`);
            el.style.setProperty('--my', `${e.clientY - r.top}px`);
        }, { passive: true });
    }

    /* ----------------------------------------------------------------------
       12. Command Palette (⌘K / Ctrl+K / "/")
       ---------------------------------------------------------------------- */
    function initCommandPalette() {
        const EMAIL = 'sharma4uga@gmail.com';
        const KINNECT_URL = 'https://sharmaga4u-debug.github.io/kinnect/';
        const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
        const kbd = document.getElementById('cmdk-kbd');
        if (kbd) kbd.textContent = isMac ? '⌘K' : 'Ctrl K';

        const goTo = sel => () => document.querySelector(sel)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        const toast = msg => (typeof showToast === 'function' ? showToast(msg) : null);

        const items = [
            { group: 'Navigate', icon: 'ri-home-5-line', label: 'Home', run: goTo('#hero') },
            { group: 'Navigate', icon: 'ri-user-smile-line', label: 'About — Why remote works', run: goTo('#about') },
            { group: 'Navigate', icon: 'ri-cpu-line', label: 'Skills & Stack', run: goTo('#skills') },
            { group: 'Navigate', icon: 'ri-briefcase-line', label: 'Portfolio', run: goTo('#projects') },
            { group: 'Navigate', icon: 'ri-history-line', label: 'Experience', run: goTo('#experience') },
            { group: 'Navigate', icon: 'ri-mail-send-line', label: 'Contact', run: goTo('#contact') }
        ];

        document.querySelectorAll('.project-card[data-project]').forEach((card) => {
            const title = card.querySelector('.project-header h3')?.textContent.trim();
            if (!title) return;
            const hint = card.querySelector('.project-badge, .featured-kicker')?.textContent.trim() || '';
            items.push({
                group: 'Projects',
                icon: card.classList.contains('featured-project') ? 'ri-sparkling-line' : 'ri-folder-open-line',
                label: title,
                hint,
                run: () => typeof openProjectModal === 'function' && openProjectModal(card.dataset.project)
            });
        });

        items.push(
            { group: 'Actions', icon: 'ri-rocket-2-line', label: 'Open Kinnect live app', hint: 'New tab', run: () => window.open(KINNECT_URL, '_blank', 'noopener') },
            { group: 'Actions', icon: 'ri-contrast-2-line', label: 'Toggle dark / light theme', run: () => document.getElementById('theme-toggle')?.click() },
            {
                group: 'Actions', icon: 'ri-file-copy-line', label: 'Copy email address', hint: EMAIL,
                run: () => {
                    if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(() => toast('Email copied to clipboard!'), () => toast(EMAIL));
                    else toast(EMAIL);
                }
            },
            {
                group: 'Actions', icon: 'ri-terminal-box-line', label: 'Open developer terminal',
                run: () => { document.getElementById('mode-terminal-btn')?.click(); goTo('#contact')(); }
            },
            {
                group: 'Actions', icon: 'ri-send-plane-line', label: 'Hire me — send an inquiry',
                run: () => {
                    document.getElementById('mode-form-btn')?.click();
                    goTo('#contact')();
                    setTimeout(() => document.getElementById('contact-name')?.focus({ preventScroll: true }), 700);
                }
            }
        );

        const overlay = document.createElement('div');
        overlay.className = 'cmdk hidden';
        overlay.id = 'cmdk';
        overlay.innerHTML = `
            <div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="Command menu">
                <div class="cmdk-search">
                    <i class="ri-search-line"></i>
                    <input type="text" id="cmdk-input" placeholder="Search sections, projects, actions…" autocomplete="off" spellcheck="false" aria-controls="cmdk-list">
                    <kbd>Esc</kbd>
                </div>
                <div class="cmdk-list" id="cmdk-list" role="listbox"></div>
                <div class="cmdk-footer">
                    <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
                    <span><kbd>↵</kbd> select</span>
                    <span><kbd>Esc</kbd> close</span>
                </div>
            </div>`;
        document.body.append(overlay);

        const input = overlay.querySelector('#cmdk-input');
        const list = overlay.querySelector('#cmdk-list');
        let results = [];
        let active = 0;
        let lastFocus = null;

        const fuzzy = (text, q) => {
            text = text.toLowerCase();
            let i = 0;
            for (const ch of q) {
                i = text.indexOf(ch, i);
                if (i === -1) return false;
                i++;
            }
            return true;
        };

        const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

        const render = () => {
            const raw = input.value.trim().toLowerCase();
            const q = raw.replace(/\s+/g, '');
            const haystack = it => `${it.label} ${it.hint || ''} ${it.group}`.toLowerCase();
            // Exact substring matches win; loose fuzzy matching only when there are none
            const exact = items.filter(it => haystack(it).includes(raw));
            results = !q ? items : exact.length ? exact : items.filter(it => fuzzy(haystack(it), q));
            active = Math.min(active, Math.max(results.length - 1, 0));

            if (!results.length) {
                list.innerHTML = `<div class="cmdk-empty">No results for “${esc(input.value)}”</div>`;
                return;
            }

            let html = '';
            let group = '';
            results.forEach((it, idx) => {
                if (it.group !== group) {
                    group = it.group;
                    html += `<div class="cmdk-group">${esc(group)}</div>`;
                }
                html += `<div class="cmdk-item${idx === active ? ' active' : ''}" role="option" aria-selected="${idx === active}" data-idx="${idx}">
                    <i class="${it.icon}"></i>
                    <span class="cmdk-label">${esc(it.label)}</span>
                    ${it.hint ? `<span class="cmdk-hint">${esc(it.hint)}</span>` : ''}
                    <i class="ri-corner-down-left-line cmdk-enter"></i>
                </div>`;
            });
            list.innerHTML = html;
            list.querySelector('.cmdk-item.active')?.scrollIntoView({ block: 'nearest' });
        };

        const open = () => {
            const gate = document.getElementById('access-gate');
            if (gate && !gate.classList.contains('unlocked') && gate.style.display !== 'none') return;
            lastFocus = document.activeElement;
            input.value = '';
            active = 0;
            render();
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => input.focus());
        };

        const close = () => {
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
            lastFocus?.focus?.({ preventScroll: true });
        };

        const runItem = (idx) => {
            const it = results[idx];
            if (!it) return;
            close();
            setTimeout(it.run, 30);
        };

        input.addEventListener('input', () => { active = 0; render(); });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(results.length, 1); render(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + results.length) % Math.max(results.length, 1); render(); }
            else if (e.key === 'Enter') { e.preventDefault(); runItem(active); }
            else if (e.key === 'Escape') { e.preventDefault(); close(); }
        });
        list.addEventListener('mousemove', (e) => {
            const item = e.target.closest('.cmdk-item');
            if (!item || Number(item.dataset.idx) === active) return;
            active = Number(item.dataset.idx);
            list.querySelectorAll('.cmdk-item').forEach(el => {
                const on = Number(el.dataset.idx) === active;
                el.classList.toggle('active', on);
                el.setAttribute('aria-selected', String(on));
            });
        });
        list.addEventListener('click', (e) => {
            const item = e.target.closest('.cmdk-item');
            if (item) runItem(Number(item.dataset.idx));
        });
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        document.getElementById('cmdk-trigger')?.addEventListener('click', open);

        document.addEventListener('keydown', (e) => {
            const typing = e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]');
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                overlay.classList.contains('hidden') ? open() : close();
            } else if (e.key === '/' && !typing && overlay.classList.contains('hidden')) {
                e.preventDefault();
                open();
            }
        });
    }
})();
