(() => {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;

    // ---------- Theme ----------
    const root = document.documentElement;
    const themeBtn = $('#themeBtn');
    function applyTheme(t) {
        if (t === 'dark') root.setAttribute('data-theme', 'dark');
        else root.removeAttribute('data-theme');
        themeBtn.innerHTML = t === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    themeBtn.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem('theme', next); } catch (e) {}
    });

    // ---------- Mobile menu ----------
    const menuBtn = $('#menuBtn');
    const nav = $('#nav');
    const setMenu = open => {
        nav.classList.toggle('open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
    };
    menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    document.addEventListener('click', e => {
        if (!e.target.closest('.header-inner')) setMenu(false);
    });

    // ---------- Active nav link ----------
    const links = $$('a[href^="#"]', nav);
    const spy = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (!en.isIntersecting) return;
            links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.map(a => $(a.getAttribute('href'))).filter(Boolean).forEach(t => spy.observe(t));

    // ---------- Hero typing ----------
    const heroName = $('#heroName');
    if (heroName && !reduceMotion) {
        const text = heroName.textContent.trim();
        heroName.textContent = '';
        heroName.classList.add('typing');
        let i = 0;
        const type = () => {
            heroName.textContent = text.slice(0, ++i);
            if (i < text.length) setTimeout(type, 90);
            else { heroName.classList.remove('typing'); heroName.classList.add('typed'); }
        };
        setTimeout(type, 400);
    }

    // ---------- Card tilt ----------
    if (canHover && !reduceMotion) {
        $$('.project-card, .certification-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = 'perspective(900px) rotateX(' + (-y * 8).toFixed(2) + 'deg) rotateY(' + (x * 8).toFixed(2) + 'deg) translateZ(8px)';
                card.style.boxShadow = '0 24px 50px rgba(20, 33, 61, 0.18), 0 0 40px rgba(154, 123, 79, 0.18)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '';
            });
        });
    }

    // ---------- Filters ----------
    function setupFilter(btnSelector, cardSelector) {
        const btns = $$(btnSelector);
        const cards = $$(cardSelector);
        btns.forEach(btn => btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.toggle('active', b === btn));
            const f = btn.dataset.filter;
            cards.forEach(card => {
                const show = f === 'all' || card.dataset.category === f;
                card.classList.toggle('hide', !show);
                card.classList.remove('fade-in');
                if (show) { void card.offsetWidth; card.classList.add('fade-in'); }
            });
        }));
    }
    setupFilter('.project-filter-btn', '.project-card');
    setupFilter('.filter-btn', '.certification-card');

    // ---------- Back to top ----------
    const toTop = $('#toTop');
    window.addEventListener('scroll', () => toTop.classList.toggle('show', window.scrollY > 600), { passive: true });
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

    // ---------- Certificate popup ----------
    const lb = $('#lightbox');
    const lbImg = $('#lbImg');
    const lbCaption = $('#lbCaption');
    let lastFocus = null;
    function openCert(card) {
        lastFocus = card;
        lbImg.src = card.dataset.cert;
        lbImg.alt = card.dataset.title + ' certificate';
        lbCaption.textContent = card.dataset.title;
        lb.hidden = false;
        document.body.classList.add('lb-open');
        $('#lbClose').focus();
    }
    function closeCert() {
        lb.hidden = true;
        lbImg.removeAttribute('src');
        document.body.classList.remove('lb-open');
        if (lastFocus) lastFocus.focus();
    }
    $$('.certification-card[data-cert]').forEach(card => {
        card.addEventListener('click', e => { if (!e.target.closest('a')) openCert(card); });
        card.addEventListener('keydown', e => {
            if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a')) { e.preventDefault(); openCert(card); }
        });
    });
    lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('#lbClose')) closeCert(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeCert(); });

    // ---------- Hero tech orbit ----------
    const orbit = $('#orbit');
    if (orbit) {
        const techs = ['react', 'nodejs', 'javascript', 'typescript', 'html5', 'css3', 'java', 'python', 'mongodb',
            'firebase', 'tailwindcss', 'git', 'github', 'mysql', 'express', 'amazonwebservices', 'vscode', 'c'];
        const n = techs.length;
        const items = techs.map((name, i) => {
            // spread points evenly over a sphere
            const y = 1 - (i / (n - 1)) * 2;
            const r = Math.sqrt(1 - y * y);
            const theta = i * Math.PI * (3 - Math.sqrt(5));
            const el = document.createElement('div');
            el.className = 'orbit-icon';
            el.innerHTML = '<img src="icons/' + name + '.svg" alt="" loading="lazy">';
            orbit.appendChild(el);
            return { el, x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
        });

        let rotY = 0, rotX = 0.35, targetX = 0.35, speed = 0.004, visible = true;
        const radius = () => orbit.clientWidth * 0.40;

        function draw() {
            const R = radius();
            const cy = Math.cos(rotY), sy = Math.sin(rotY);
            const cx = Math.cos(rotX), sx = Math.sin(rotX);
            items.forEach(p => {
                let x = p.x * cy + p.z * sy;
                let z = -p.x * sy + p.z * cy;
                let y = p.y * cx - z * sx;
                z = p.y * sx + z * cx;
                const depth = (z + 1) / 2;            // 0 = far, 1 = near
                const scale = 0.55 + depth * 0.6;
                p.el.style.transform = 'translate3d(' + (x * R).toFixed(1) + 'px,' + (y * R).toFixed(1) + 'px,0) scale(' + scale.toFixed(3) + ')';
                p.el.style.opacity = (0.25 + depth * 0.75).toFixed(2);
                p.el.style.zIndex = Math.round(depth * 100);
            });
        }

        draw();
        if (!reduceMotion) {
            const hero = $('.hero');
            hero.addEventListener('mousemove', e => {
                const r = orbit.getBoundingClientRect();
                const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
                const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
                speed = 0.004 + dx * 0.012;
                targetX = 0.35 + dy * 0.6;
            });
            hero.addEventListener('mouseleave', () => { speed = 0.004; targetX = 0.35; });
            new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(orbit);
            (function loop() {
                if (visible) {
                    rotY += speed;
                    rotX += (targetX - rotX) * 0.05;
                    draw();
                }
                requestAnimationFrame(loop);
            })();
            window.addEventListener('resize', draw);
        }
    }

    // ---------- Reveal on scroll ----------
    const revealEls = $$('.section-head, .prose, .skills, .certifications-filter, .projects-filter, .certifications-grid, .projects-grid, .edu-list, .contact-lead, .contact-icons, .more');
    revealEls.forEach(el => el.classList.add('reveal'));
    if ('IntersectionObserver' in window && !reduceMotion) {
        const io = new IntersectionObserver(es => es.forEach(en => {
            if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        }), { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('in'));
    }

    $('#year').textContent = new Date().getFullYear();
})();
