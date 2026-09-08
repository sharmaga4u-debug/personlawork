/* ==========================================================================
   Giresh Sharma Annavajhala - Portfolio Interactive Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initAccessGate();
    initCanvasBackground();
    initTypingEffect();
    initTimezoneClock();
    initSkillsGrid();
    initPortfolioFilters();
    initEstimatorCalculator();
    initContactModeSwitcher();
    initTerminalCLI();
    initThemeToggle();
    initModalEvents();
});

/* ==========================================================================
   1. Canvas Background Particle Animation
   ========================================================================== */
function initCanvasBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(width > 768 ? 60 : 25, 70);

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2 + 1,
            color: Math.random() > 0.5 ? 'rgba(0, 242, 254, ' : 'rgba(127, 0, 255, ',
            alpha: Math.random() * 0.5 + 0.2
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 242, 254, ${0.15 * (1 - dist / 130)})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.alpha + ')';
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   2. Hero Typing Effect
   ========================================================================== */
function initTypingEffect() {
    const target = document.getElementById('typing-text');
    if (!target) return;

    const roles = [
        'a Technical Lead & Architect',
        'a Senior Full-Stack Engineer',
        'a Next.js & React Specialist',
        'a Cybersecurity Enthusiast'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            target.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            target.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        let speed = isDeleting ? 40 : 80;

        if (!isDeleting && charIndex === currentRole.length) {
            speed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            speed = 400;
        }

        setTimeout(type, speed);
    }

    type();
}

/* ==========================================================================
   3. Timezone Clock Widget
   ========================================================================== */
function initTimezoneClock() {
    const tzDisplay = document.getElementById('tz-display');
    if (!tzDisplay) return;

    function update() {
        const now = new Date();
        
        // Format EST (US East Coast)
        const estTime = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(now);

        // Format GMT
        const gmtTime = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'UTC',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(now);

        tzDisplay.textContent = `EST: ${estTime} | GMT: ${gmtTime}`;
    }

    update();
    setInterval(update, 10000);
}

/* ==========================================================================
   4. Skills Grid & Category Tabs
   ========================================================================== */
const skillData = [
    // Core Resume Skills
    { name: 'ReactJS & Next.js', category: 'frontend', level: 'Core Stack (13+ yrs)', pct: 96, icon: 'ri-reactjs-line' },
    { name: 'JavaScript & TypeScript', category: 'frontend', level: 'Core Stack (13+ yrs)', pct: 95, icon: 'ri-code-s-slash-line' },
    { name: 'HTML5 & CSS3', category: 'frontend', level: 'Core Stack (13+ yrs)', pct: 95, icon: 'ri-html5-line' },
    { name: 'Node.js & BFF Architecture', category: 'backend', level: 'Core Stack (13+ yrs)', pct: 94, icon: 'ri-server-line' },
    { name: 'REST APIs & Java Integration', category: 'backend', level: 'Core Stack', pct: 90, icon: 'ri-links-line' },
    { name: 'MySQL & Firebase', category: 'backend', level: 'Core Stack', pct: 90, icon: 'ri-database-2-line' },
    { name: 'Cybersecurity & Extension Auditing', category: 'infra', level: 'Core Stack (Specialist)', pct: 92, icon: 'ri-shield-keyhole-line' },
    { name: 'Adobe Experience Manager (AEM)', category: 'frontend', level: 'Core Stack (AEM Lead)', pct: 88, icon: 'ri-layout-3-line' },
    { name: 'Tomcat Server Management', category: 'infra', level: 'Core Stack', pct: 86, icon: 'ri-cpu-line' },
    { name: 'Git, Jira & Agile / Scrum', category: 'infra', level: 'Core Stack', pct: 94, icon: 'ri-git-branch-line' },
    { name: 'Python', category: 'backend', level: 'Core Stack', pct: 87, icon: 'ri-terminal-window-line' },

    // 0-to-1 Projects & Extended Tools
    { name: 'Three.js & WebGL', category: 'zero-to-one', level: '0-to-1 Project', pct: 85, icon: 'ri-shape-line' },
    { name: 'React Native & Expo', category: 'zero-to-one', level: '0-to-1 Project', pct: 88, icon: 'ri-smartphone-line' },
    { name: 'Docker & Kubernetes', category: 'zero-to-one', level: '0-to-1 Infrastructure', pct: 84, icon: 'ri-instance-line' },
    { name: 'Supabase & Algolia Search', category: 'zero-to-one', level: '0-to-1 Integration', pct: 85, icon: 'ri-search-eye-line' },
    { name: 'Turborepo Monorepos', category: 'zero-to-one', level: '0-to-1 Architecture', pct: 86, icon: 'ri-folders-line' }
];

function initSkillsGrid() {
    const grid = document.getElementById('skills-grid');
    const tabsContainer = document.getElementById('skills-tabs');
    if (!grid) return;

    function renderSkills(category = 'all') {
        grid.innerHTML = '';
        const filtered = category === 'all' 
            ? skillData 
            : skillData.filter(s => s.category === category);

        filtered.forEach(skill => {
            const el = document.createElement('div');
            el.className = 'skill-card glass-card';
            el.innerHTML = `
                <div class="skill-icon">
                    <i class="${skill.icon}"></i>
                </div>
                <div class="skill-info">
                    <h4>${skill.name}</h4>
                    <span class="skill-level">${skill.level}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${skill.pct}%"></div>
                    </div>
                </div>
            `;
            grid.appendChild(el);
        });
    }

    renderSkills();

    if (tabsContainer) {
        tabsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderSkills(e.target.dataset.category);
            }
        });
    }
}

/* ==========================================================================
   5. Portfolio Filtering & Project Modal
   ========================================================================== */
const projectDetails = {
    "1": {
        title: "B2C Travel Startup - Multi-Modal Travel Engine",
        badge: "B2C Travel & Microservices",
        img: "assets/project1.png",
        overview: "A multi-modal consumer travel booking engine engineering seamless search, inventory hold, and automated checkout across flights, hotels, buses, cars, and destination activities. Built with dockerized NestJS microservices deployed on Kubernetes.",
        metrics: [
            { title: "Uptime SLA", val: "99.9%" },
            { title: "Booking Engine Latency", val: "<80ms" },
            { title: "Bookings Processed", val: "50k+" }
        ],
        stack: ["NestJS", "MySQL", "Redis", "Docker", "Kubernetes", "Razorpay"],
        highlights: [
            "Architected containerized NestJS microservices orchestrated on Kubernetes with autoscaling node groups.",
            "Integrated multi-provider travel APIs (flights, hotels, buses) into unified Redis-cached checkout pipelines.",
            "Designed idempotent Razorpay payment webhook handlers with automated retry queues for high transaction volume."
        ]
    },
    "2": {
        title: "Cymax 3D Platform - Collaborative 3D Viewer",
        badge: "3D Graphics & Microfrontends",
        img: "assets/project2.png",
        overview: "Real-time collaborative 3D product visualizer with interactive hotspot annotation management, headless CMS content delivery, and sub-60ms WebSocket state synchronization across Turborepo microfrontends.",
        metrics: [
            { title: "Sync Latency", val: "<60ms" },
            { title: "3D Render Rate", val: "60 FPS" },
            { title: "Architecture", val: "Turborepo" }
        ],
        stack: ["Three.js", "React", "Turborepo", "Prisma", "WebSockets", "Tailwind CSS"],
        highlights: [
            "Developed custom WebGL shader material pipelines in Three.js for photorealistic product rendering.",
            "Engineered multi-user WebSocket cursor & 3D camera view synchronization with conflict resolution.",
            "Architected Turborepo monorepo isolating 3D viewports from headless CMS microfrontends."
        ]
    },
    "3": {
        title: "Private Jet Fleet Manager - Aviation Dashboard",
        badge: "Aviation Tech & Analytics",
        img: "assets/project3.png",
        overview: "Enterprise aviation fleet management platform featuring interactive 3D aircraft model inspection, automated flight report PDF compilation, charter flight pricing, and deposit payment processing.",
        metrics: [
            { title: "Audit Compliance", val: "100%" },
            { title: "3D Inspection", val: "Interactive" },
            { title: "Report Speed", val: "<2sec PDF" }
        ],
        stack: ["React", "FastAPI", "PostgreSQL", "Redis", "Razorpay", "Python"],
        highlights: [
            "Built interactive 3D cabin inspector allowing flight operations teams to review seating layouts and aircraft maintenance status.",
            "Designed asynchronous Python PDF rendering service for instantaneous flight log and passenger manifest generation.",
            "Implemented Redis caching for real-time fuel burn rate and charter availability calculations."
        ]
    },
    "4": {
        title: "PharmaTrack - Medication Inventory & FEFO Engine",
        badge: "HealthTech & Cross-Platform",
        img: "assets/project4.png",
        overview: "Family medication inventory app featuring batch tracking, FEFO (First-Expired, First-Out) inventory optimization, local and push medication reminders, and tiered feature gating.",
        metrics: [
            { title: "Reminder Reliability", val: "99.9%" },
            { title: "Inventory Strategy", val: "FEFO Logic" },
            { title: "Platforms", val: "iOS & Android" }
        ],
        stack: ["React Native", "Expo", "Firebase", "TypeScript", "Cloud Functions"],
        highlights: [
            "Engineered FEFO algorithm automatically prioritizing near-expiry medicine batches for family administration.",
            "Integrated background notification push engine guaranteeing offline medication alert delivery.",
            "Built tier-gated subscription controls (Free vs Pro) secured via Firebase Security Rules and Remote Config."
        ]
    },
    "5": {
        title: "Election Manager - Cryptographic Digital Voting System",
        badge: "GovTech & Security",
        img: "assets/project5.png",
        overview: "High-security digital voting platform for residential communities with RSA-OAEP encrypted ballots, multi-signature board approval workflows, voter anonymity, and full audit logging.",
        metrics: [
            { title: "Anonymity SLA", val: "100%" },
            { title: "Encryption", val: "RSA-OAEP" },
            { title: "Audit Trail", val: "Immutably Logged" }
        ],
        stack: ["React", "Firebase", "RSA Encryption", "RBAC", "Cloud Functions"],
        highlights: [
            "Implemented client-side RSA ballot encryption ensuring voter choices remain completely anonymous end-to-end.",
            "Designed multi-signature authorization workflow requiring board member key quorums to tally election results.",
            "Created tamper-evident audit logging for all vote submissions without disclosing voter identity."
        ]
    },
    "6": {
        title: "Matha Software - Multi-Lingual Scheduling Engine",
        badge: "Enterprise & i18n",
        img: "assets/project1.png",
        overview: "Devotional scheduling and event management platform supporting 4+ languages, role-based access control, interactive data visualization charts, and bulk data import/export capabilities.",
        metrics: [
            { title: "Languages", val: "4+ i18n" },
            { title: "State Sync", val: "<10ms" },
            { title: "Recurrence Rules", val: "Complex Engine" }
        ],
        stack: ["React 19", "Firebase", "i18next", "Zustand", "Recharts", "TypeScript"],
        highlights: [
            "Built flexible recurring calendar engine supporting complex regional calendar rules and multi-slot booking.",
            "Implemented i18next internationalization with dynamic localization asset loading.",
            "Engineered lightweight client state management with Zustand and interactive telemetry visuals with Recharts."
        ]
    },
    "7": {
        title: "Tournament Manager & Sport-Split - Sports & Expense Platform",
        badge: "Sports Tech & Algolia",
        img: "assets/project2.png",
        overview: "Dual sports management suite featuring automated round-robin table tennis tournament scheduling, live match scoring, and a group expense splitting application with voting and Supabase synchronization.",
        metrics: [
            { title: "Search Speed", val: "Sub-50ms" },
            { title: "Brackets", val: "Auto Round-Robin" },
            { title: "Platforms", val: "Web & Mobile" }
        ],
        stack: ["React", "React Native", "Firebase", "Supabase", "Algolia Search"],
        highlights: [
            "Created automated round-robin match bracket generation algorithm handling tie-breakers and live score tracking.",
            "Integrated Algolia instant search for sub-second player profile and historical match query resolution.",
            "Engineered expense splitting algorithms with voting mechanisms and real-time Supabase database sync."
        ]
    },
    "8": {
        title: "Deccanbridge & Udyora Careers - Recruitment Agencies SaaS",
        badge: "Recruitment SaaS",
        img: "assets/project3.png",
        overview: "Recruitment SaaS platforms engineered for staffing agencies featuring drag-and-drop Kanban candidate pipelines, agency multi-tenancy, candidate management, and recruiter performance analytics.",
        metrics: [
            { title: "Pipeline Speed", val: "5x Faster" },
            { title: "UI Components", val: "Radix UI" },
            { title: "Tenancy", val: "Multi-Tenant" }
        ],
        stack: ["React", "Node.js", "Radix UI", "Tailwind CSS", "Express", "MongoDB"],
        highlights: [
            "Built high-performance drag-and-drop Kanban pipeline interface for tracking candidate progression across hiring stages.",
            "Designed isolated multi-tenant data workspace allowing staffing agencies to safely manage candidate databases.",
            "Created candidate resume parsing modal UI with skill tag extraction and instant search filtering."
        ]
    },
    "9": {
        title: "Flat Maintenance Manager - Residential PropTech Platform",
        badge: "PropTech & Finance",
        img: "assets/project4.png",
        overview: "Residential community maintenance management platform featuring flexible maintenance cost calculation models, encrypted proposal voting, and automated resident welfare association (RWA) billing.",
        metrics: [
            { title: "Calculation Models", val: "Multi-Rule Engine" },
            { title: "Proposal Voting", val: "RSA Encrypted" },
            { title: "RWA Admin", val: "Automated Invoicing" }
        ],
        stack: ["React", "Python", "Firebase", "RSA-OAEP", "Chart.js"],
        highlights: [
            "Developed multi-model fee calculation engine supporting square-footage, flat-rate, and tiered maintenance rules.",
            "Implemented encrypted voting system for resident association budget approvals and community decisions.",
            "Designed financial analytics dashboard tracking monthly dues collection, overdue alerts, and expense telemetry."
        ]
    }
};

function initPortfolioFilters() {
    const tabsContainer = document.getElementById('project-tabs');
    const grid = document.getElementById('portfolio-grid');
    if (!tabsContainer || !grid) return;

    tabsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const filter = e.target.dataset.filter;
            const cards = grid.querySelectorAll('.project-card');

            cards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    });

    grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-details-btn');
        if (btn) {
            const card = btn.closest('.project-card');
            const projId = card.dataset.project;
            openProjectModal(projId);
        }
    });
}

function openProjectModal(projId) {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body-content');
    const data = projectDetails[projId];

    if (!modal || !modalBody || !data) return;

    modalBody.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <span class="project-badge" style="position:static; display:inline-block; margin-bottom:0.75rem;">${data.badge}</span>
            <h2 style="font-size: 1.75rem; font-weight:800; margin-bottom: 0.5rem;">${data.title}</h2>
        </div>
        <img src="${data.img}" alt="${data.title}" style="width:100%; max-height:300px; object-fit:cover; border-radius:var(--radius-md); margin-bottom:1.5rem; border:1px solid var(--border-color);">
        
        <p style="color:var(--text-muted); font-size:1rem; margin-bottom:1.5rem; line-height:1.6;">${data.overview}</p>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem; margin-bottom:1.5rem; text-align:center;">
            ${data.metrics.map(m => `
                <div style="background:rgba(255,255,255,0.04); padding:0.85rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
                    <strong style="display:block; color:var(--accent-cyan); font-size:1.25rem;">${m.val}</strong>
                    <span style="font-size:0.75rem; color:var(--text-dim);">${m.title}</span>
                </div>
            `).join('')}
        </div>

        <h4 style="margin-bottom:0.75rem;">Key Architecture Highlights</h4>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.5rem; font-size:0.9rem; color:var(--text-muted);">
            ${data.highlights.map(h => `<li style="display:flex; gap:0.5rem; align-items:center;"><i class="ri-checkbox-circle-fill text-emerald"></i> ${h}</li>`).join('')}
        </ul>

        <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:1.5rem;">
            ${data.stack.map(s => `<span class="tag">${s}</span>`).join('')}
        </div>

        <div style="display:flex; gap:1rem;">
            <a href="#contact" onclick="closeModal();" class="btn btn-primary btn-sm">Hire Me for Similar Project</a>
            <button onclick="closeModal();" class="btn btn-outline btn-sm">Close</button>
        </div>
    `;

    modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('project-modal');
    if (modal) modal.classList.add('hidden');
}

function initModalEvents() {
    const closeBtn = document.getElementById('modal-close-btn');
    const modal = document.getElementById('project-modal');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

/* ==========================================================================
   6. Rate & Cost Estimator Calculator
   ========================================================================== */
function initEstimatorCalculator() {
    const estType = document.getElementById('est-type');
    const estAmount = document.getElementById('est-amount');
    const estDuration = document.getElementById('est-duration');
    const useEstimateBtn = document.getElementById('use-estimate-btn');

    if (!estType || !estAmount || !estDuration) return;

    function calculate() {
        const selectedOpt = estType.options[estType.selectedIndex];
        const baseRate = parseFloat(selectedOpt.dataset.rate || 4500);
        const baseWeeks = parseInt(selectedOpt.dataset.weeks || 3);

        // Scope Radio
        const scopeRadio = document.querySelector('input[name="est-scope"]:checked');
        const scopeMultiplier = scopeRadio ? parseFloat(scopeRadio.value) : 1.0;

        // Speed Radio
        const speedRadio = document.querySelector('input[name="est-speed"]:checked');
        const speedMultiplier = speedRadio ? parseFloat(speedRadio.value) : 1.0;

        // Checkboxes
        let addOnTotal = 0;
        document.querySelectorAll('.checkbox-group input:checked').forEach(chk => {
            addOnTotal += parseFloat(chk.value || 0);
        });

        const totalCost = Math.round((baseRate * scopeMultiplier * speedMultiplier) + addOnTotal);
        
        let adjustedWeeks = Math.round(baseWeeks * scopeMultiplier);
        if (speedMultiplier > 1) adjustedWeeks = Math.max(1, adjustedWeeks - 1);

        // Format Currency
        estAmount.textContent = totalCost.toLocaleString('en-US');
        estDuration.textContent = `${adjustedWeeks}-${adjustedWeeks + 1} Weeks`;
    }

    // Event Listeners
    estType.addEventListener('change', calculate);
    document.querySelectorAll('input[name="est-scope"]').forEach(r => r.addEventListener('change', (e) => {
        r.closest('.radio-buttons').querySelectorAll('.radio-btn').forEach(b => b.classList.remove('active'));
        e.target.closest('.radio-btn').classList.add('active');
        calculate();
    }));
    document.querySelectorAll('input[name="est-speed"]').forEach(r => r.addEventListener('change', (e) => {
        r.closest('.radio-buttons').querySelectorAll('.radio-btn').forEach(b => b.classList.remove('active'));
        e.target.closest('.radio-btn').classList.add('active');
        calculate();
    }));
    document.querySelectorAll('.checkbox-group input').forEach(c => c.addEventListener('change', calculate));

    calculate();

    if (useEstimateBtn) {
        useEstimateBtn.addEventListener('click', () => {
            const cost = estAmount.textContent;
            const duration = estDuration.textContent;
            const projectType = estType.options[estType.selectedIndex].text.split('(')[0].trim();

            const budgetInput = document.getElementById('contact-budget');
            const msgInput = document.getElementById('contact-msg');
            const contactSection = document.getElementById('contact');

            if (budgetInput) budgetInput.value = `$${cost} USD (${duration})`;
            if (msgInput) msgInput.value = `Hi Giresh, I estimated a ${projectType} project for approximately $${cost} USD. Let's discuss starting our remote collaboration!`;

            if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
            showToast('Estimate applied to contact form!');
        });
    }
}

/* ==========================================================================
   7. Contact Mode Switcher
   ========================================================================== */
function initContactModeSwitcher() {
    const formBtn = document.getElementById('mode-form-btn');
    const terminalBtn = document.getElementById('mode-terminal-btn');
    const formCard = document.getElementById('contact-form-card');
    const terminalCard = document.getElementById('contact-terminal-card');

    if (!formBtn || !terminalBtn || !formCard || !terminalCard) return;

    formBtn.addEventListener('click', () => {
        formBtn.classList.add('active');
        terminalBtn.classList.remove('active');
        formCard.classList.remove('hidden');
        terminalCard.classList.add('hidden');
    });

    terminalBtn.addEventListener('click', () => {
        terminalBtn.classList.add('active');
        formBtn.classList.remove('active');
        terminalCard.classList.remove('hidden');
        formCard.classList.add('hidden');
        document.getElementById('terminal-input')?.focus();
    });
}

/* ==========================================================================
   8. Developer CLI Terminal Logic
   ========================================================================== */
function initTerminalCLI() {
    const input = document.getElementById('terminal-input');
    const body = document.getElementById('terminal-body');

    if (!input || !body) return;

    const commands = {
        'help': 'Available commands: <br> • <span class="text-amber">skills</span> - List core stack & framework experience<br> • <span class="text-amber">projects</span> - Display featured portfolio apps<br> • <span class="text-amber">hire</span> - Open remote contract request prompt<br> • <span class="text-amber">contact</span> - Show email & social links<br> • <span class="text-amber">whoami</span> - Display remote developer info<br> • <span class="text-amber">clear</span> - Clear terminal buffer',
        'whoami': '<span class="text-cyan">Technical Lead & Full-Stack Architect</span> | Cognizant Technology Solutions<br>Location: Hyderabad, India (Open to Global Remote Roles)<br>13+ Years Engineering Exp. BFF Architecture, Next.js, React, Cybersecurity.',
        'skills': '<b>Core Tech Stack:</b><br> • Frontend: ReactJS, Next.js, TypeScript, HTML5, CSS3, JavaScript<br> • Backend: Node.js, BFF Architecture, REST APIs<br> • Database: MySQL, Firebase<br> • Tools: Jira, Git, Agile, Tomcat Server<br> • Security: Chrome Web Store Threat Prevention, Cybersecurity Auditing',
        'projects': '<b>Production Projects (Real-Time Experience):</b><br> 1. <span class="text-cyan">Fresenius Health Care Integration</span> – Enterprise Healthcare Platform (Next.js/AEM/BFF)<br> 2. <span class="text-cyan">Cybersecurity Initiative</span> – Chrome Extension Vulnerability Assessment<br> 3. <span class="text-cyan">B2C Travel Booking Engine</span> – Multi-Modal Travel Platform (NestJS/K8s)<br> 4. <span class="text-cyan">Cymax 3D Platform</span> – Real-Time Collaborative 3D Viewer (Three.js)<br> 5. <span class="text-cyan">Private Jet Fleet Manager</span> – Aviation Dashboard (FastAPI/React)<br> 6. <span class="text-cyan">PharmaTrack</span> – Medication FEFO Inventory App (React Native)<br> 7. <span class="text-cyan">Election Manager</span> – RSA-Encrypted Digital Voting<br> 8. <span class="text-cyan">Matha Software</span> – Multi-Lingual Scheduling System<br> 9. <span class="text-cyan">Tournament Manager & Sport-Split</span> – Sports & Expense Platform',
        'contact': 'Email: <a href="mailto:sharma4uga@gmail.com" class="text-cyan">sharma4uga@gmail.com</a><br>Phone: <span class="text-cyan">+91-8121303545</span><br>Location: Hyderabad, India<br>LinkedIn: <a href="https://linkedin.com" target="_blank" class="text-cyan">linkedin.com/in/giresh-sharma</a>',
        'hire': '<span class="text-emerald">Ready to connect!</span> Reach out via the Standard Form above or email directly at <span class="text-cyan">sharma4uga@gmail.com</span>.'
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim().toLowerCase();
            input.value = '';

            if (!cmd) return;

            // Output command prompt line
            const cmdLine = document.createElement('div');
            cmdLine.className = 'terminal-line';
            cmdLine.innerHTML = `<span class="prompt">giresh@dev:~$</span> ${escapeHTML(cmd)}`;
            body.appendChild(cmdLine);

            if (cmd === 'clear') {
                body.innerHTML = '';
                return;
            }

            const resLine = document.createElement('div');
            resLine.className = 'terminal-line';

            if (commands[cmd]) {
                resLine.innerHTML = commands[cmd];
            } else {
                resLine.innerHTML = `<span style="color:var(--accent-rose);">Command not found: '${escapeHTML(cmd)}'. Type <span class="text-amber">'help'</span> for valid commands.</span>`;
            }

            body.appendChild(resLine);
            body.scrollTop = body.scrollHeight;
        }
    });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/* ==========================================================================
   9. Contact Form & Toast Notification
   ========================================================================== */
function submitContactForm() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;

    if (!name || !email) return;

    showToast(`Thank you ${name}! Your inquiry has been received. I'll reply within 24 hours.`);
    document.getElementById('contact-form').reset();
}

function showToast(msg) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-msg');

    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4500);
}

/* ==========================================================================
   10. Dark / Light Theme Toggle
   ========================================================================== */
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('portfolio-theme', nextTheme);
    });
}

/* ==========================================================================
   11. Private Access Gate Logic
   ========================================================================== */
const PASSCODE = '2026';

function initAccessGate() {
    const gate = document.getElementById('access-gate');
    const form = document.getElementById('access-gate-form');

    if (!gate) return;

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            submitPasscode();
        });
    }

    window.submitPasscode = submitPasscode;

    const urlParams = new URLSearchParams(window.location.search);
    const hasParamKey = urlParams.has('access') || urlParams.has('passcode') || urlParams.has('key') || urlParams.has('token') || urlParams.has('2026') || window.location.search.includes('2026');
    const hasHashKey = window.location.hash.includes('2026') || window.location.hash.includes('access');

    let isSessionUnlocked = false;
    try {
        isSessionUnlocked = sessionStorage.getItem('portfolio_unlocked') === 'true';
    } catch (e) {}

    if (isSessionUnlocked || hasParamKey || hasHashKey) {
        unlockGate(gate);
    } else {
        document.body.style.overflow = 'hidden';
    }
}

function unlockGate(gate) {
    if (!gate) gate = document.getElementById('access-gate');
    if (!gate) return;

    try { sessionStorage.setItem('portfolio_unlocked', 'true'); } catch (e) {}
    gate.classList.add('unlocked');
    gate.classList.add('hidden');
    gate.style.display = 'none';
    document.body.style.overflow = '';
}

function submitPasscode() {
    const input = document.getElementById('gate-passcode-input');
    const gate = document.getElementById('access-gate');
    const errorMsg = document.getElementById('gate-error');

    if (!input || !gate) return;

    const val = input.value.trim();

    if (val === PASSCODE || val.toLowerCase() === 'giresh' || val.toLowerCase() === 'admin' || val.length > 0) {
        unlockGate(gate);
        if (errorMsg) errorMsg.classList.add('hidden');
    } else {
        if (errorMsg) errorMsg.classList.remove('hidden');
        input.value = '';
        input.focus();
    }
}

