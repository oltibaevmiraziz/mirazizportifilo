/* =============================================
   MIRAZIZ OLTIBAEV | CYBER PREMIUM PORTFOLIO
   script.js — Barcha JavaScript funksiyalari
   ============================================= */

// ─────────────────────────────────────────────
// 1. KIBER SYNTH AUDIO TIZIMI (Web Audio API)
// ─────────────────────────────────────────────
let audioCtx = null;
let isAudioMuted = false;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

/** Sintetik tovush generatori – hech qanday audio fayllarsiz */
function playSynthSound(freq, type, duration, volume = 0.05) {
    if (isAudioMuted) return;
    initAudio();
    try {
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = type; // 'sine' | 'square' | 'sawtooth' | 'triangle'
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.log('Audio xatoligi:', e);
    }
}

function playHoverBeep() { playSynthSound(1000, 'sine', 0.08, 0.02); }
function playErrorSound() { playSynthSound(150, 'sawtooth', 0.3, 0.1); }

function playClickSound() {
    playSynthSound(1500, 'triangle', 0.15, 0.04);
    setTimeout(() => playSynthSound(2200, 'sine', 0.1, 0.03), 50);
}

function playSuccessSound() {
    playSynthSound(587.33, 'sine', 0.15, 0.05); // D5
    setTimeout(() => playSynthSound(880, 'sine', 0.25, 0.05), 100); // A5
}

// ─────────────────────────────────────────────
// 2. HIGH-PERFORMANCE CANVAS PARTICLES BG
// ─────────────────────────────────────────────
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 1.5 + 1;
        this.color = Math.random() > 0.85
            ? 'rgba(189, 0, 255, 0.5)'
            : 'rgba(0, 247, 255, 0.4)';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < count; i++) particles.push(new Particle());
}
initParticles();

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(0, 247, 255, ${(1 - dist / 120) * 0.15})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ─────────────────────────────────────────────
// 3. MOBILE MENU TOGGLE
// ─────────────────────────────────────────────
const menuToggle = document.getElementById('mobile-menu');
const navMenu = document.getElementById('nav-menu');

menuToggle.addEventListener('click', () => {
    playClickSound();
    menuToggle.classList.toggle('open');
    navMenu.classList.toggle('open');
});

// ─────────────────────────────────────────────
// 4. NAVIGATION PAGES MANAGER
// ─────────────────────────────────────────────
function showPage(pageId) {
    if (!pageId) return;
    const pageElement = document.getElementById(pageId);
    if (!pageElement) return;

    playClickSound();
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('nav a').forEach(l => l.classList.remove('active-nav'));

    pageElement.classList.add('active');
    const targetNavLink = document.getElementById('nav-' + pageId);
    if (targetNavLink) targetNavLink.classList.add('active-nav');

    menuToggle.classList.remove('open');
    navMenu.classList.remove('open');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.hash = pageId;

    // Skills progress bars
    if (pageId === 'skills') {
        setTimeout(() => {
            document.querySelectorAll('.fill').forEach(bar => {
                bar.style.width = bar.getAttribute('data-width');
            });
        }, 100);
    } else {
        document.querySelectorAll('.fill').forEach(bar => bar.style.width = '0');
    }

    setDayMode(false);
    if (pageId === 'home') resetAndStartTyping();
}

// ─────────────────────────────────────────────
// 5. TYPING EFFECT
// ─────────────────────────────────────────────
const text = 'Miraziz Oltibaev';
let charIndex = 0;
let typingTimeout;

function typeWriter() {
    const el = document.getElementById('typing');
    if (el && charIndex < text.length) {
        el.textContent += text.charAt(charIndex);
        charIndex++;
        typingTimeout = setTimeout(typeWriter, 110);
    }
}

function resetAndStartTyping() {
    clearTimeout(typingTimeout);
    const el = document.getElementById('typing');
    if (el) { el.textContent = ''; charIndex = 0; typeWriter(); }
}

// ─────────────────────────────────────────────
// 6. INITIAL PAGE LOAD & HASH ROUTING
// ─────────────────────────────────────────────
function handleInitialPage() {
    const hashPage = window.location.hash.replace('#', '');
    if (hashPage && document.getElementById(hashPage)) {
        showPage(hashPage);
    } else {
        showPage('home');
    }
}

window.addEventListener('load', () => {
    resetAndStartTyping();
    handleInitialPage();
});

window.addEventListener('hashchange', () => {
    const hashPage = window.location.hash.replace('#', '');
    if (hashPage) showPage(hashPage);
});

function openCvPage() {
    window.location.href = 'cv.html';
}

// ─────────────────────────────────────────────
// 7. 3D CARD TILT EXPERIENCE
// ─────────────────────────────────────────────
function apply3DTilt() {
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mousemove', e => {
            requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rotateX = -((y - rect.height / 2) / rect.height) * 10;
                const rotateY = ((x - rect.width / 2) / rect.width) * 10;
                card.style.transform =
                    `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });
        });

        card.addEventListener('mouseenter', () => playHoverBeep());

        card.addEventListener('mouseleave', () => {
            requestAnimationFrame(() => {
                card.style.transform =
                    'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
            });
        });
    });
}
apply3DTilt();

// ─────────────────────────────────────────────
// 8. CARD CLICK ACTIONS
// ─────────────────────────────────────────────
function setDayMode(on) {
    document.body.classList.toggle('day', on);
}

function bindCardClickActions() {
    document.querySelectorAll('.card').forEach(card => {
        // Pointer visual feedback
        card.addEventListener('pointerdown', () => card.classList.add('clicked'));
        card.addEventListener('pointerup', () => setTimeout(() => card.classList.remove('clicked'), 220));
        card.addEventListener('pointerleave', () => card.classList.remove('clicked'));

        // data-target  → navigate to page
        if (card.dataset.target) {
            card.addEventListener('click', event => {
                if (event.target.closest('a') || event.target.closest('button')) return;
                playClickSound();
                card.classList.add('clicked');
                if (card.closest('#projects')) {
                    setDayMode(true);
                    setTimeout(() => setDayMode(false), 1400);
                }
                setTimeout(() => { card.classList.remove('clicked'); showPage(card.dataset.target); }, 220);
            });
        }

        // data-action  → custom actions
        if (card.dataset.action) {
            card.addEventListener('click', event => {
                if (event.target.closest('a') || event.target.closest('button')) return;
                playClickSound();
                card.classList.add('clicked');
                if (card.closest('#projects')) {
                    setDayMode(true);
                    setTimeout(() => setDayMode(false), 1400);
                }
                const action = card.dataset.action;
                const href = card.dataset.href || '';
                const title = (card.querySelector('h3') && card.querySelector('h3').innerText) || '';

                handleCardAction(action, href, title, card);
            });
        }

        // data-href  → open external link
        if (card.dataset.href && !card.dataset.action) {
            card.addEventListener('click', event => {
                if (event.target.closest('a') || event.target.closest('button')) return;
                playClickSound();
                card.classList.add('clicked');
                if (card.closest('#projects')) {
                    setDayMode(true);
                    setTimeout(() => setDayMode(false), 1400);
                }
                setTimeout(() => { card.classList.remove('clicked'); window.open(card.dataset.href, '_blank'); }, 220);
            });
        }

        // data-product  → show product preview modal
        if (card.dataset.product) {
            card.addEventListener('click', event => {
                if (event.target.closest('a') || event.target.closest('button')) return;
                playClickSound();
                card.classList.add('clicked');
                setTimeout(() => { card.classList.remove('clicked'); openProductPreview(card.dataset.product || 'cube'); }, 220);
            });
        }
    });
}
bindCardClickActions();

/** Loyihalar uchun umumiy harakat boshqaruvchisi */
function handleCardAction(action, href, title, card) {
    if ((action === 'app' || action === 'game') && href) {
        window.location.href = href; // Modal o'rniga sahifaga o'tish
        setTimeout(() => card.classList.remove('clicked'), 220);
    } else {
        setTimeout(() => {
            card.classList.remove('clicked');
            if (action === "about") showPage("about");
            else if (action === "projects") showPage("projects");
        }, 220);
    }
}

// "OPEN PROJECT" tugmalari bosilganda ham modal ochilishi uchun
document.querySelectorAll('#projects .verify-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const card = btn.closest('.card');
        const href = card.dataset.href || btn.getAttribute('href');
        const title = card.querySelector('h3').innerText;
        playClickSound();
        window.location.href = href;
    });
});

// ─────────────────────────────────────────────
// 9. PRODUCT PREVIEW MODAL
// ─────────────────────────────────────────────
const PRODUCT_DATA = {
    car: { title: 'Kiber avtomobil', description: 'Bu yuqori texnologiyali mahsulot avtomobillar uchun yaratilgan. Ma\'lumotlar va dizayn ko\'rinishi shu yerda ko\'rsatiladi.' },
    sneaker: { title: 'Premium sneaker', description: 'Futuristik sneaker sport va kiber-stilni birlashtiradi, qulaylik hamda zamonaviy ko\'rinish beradi.' },
    jacket: { title: 'Cyber jaket', description: 'Issiq va zamonaviy jaket kiber dizayn bilan yaratilgan, kundalik va maxsus ko\'rinish uchun ideal.' },
    watch: { title: 'Smart watch', description: 'Yuqori aniqlikdagi soat real vaqt ma\'lumotlari va futuristik aksessuar xususiyatiga ega.' },
    phone: { title: 'Cyber telefon', description: 'Yuqori tezlikli smartfon katta ekran, ilg\'or kamera va kiber interfeysga ega.' },
    laptop: { title: 'Ultra noutbuk', description: 'Yengil, kuchli va zamonaviy dizaynli noutbuk, kodlash va ijod uchun ideal.' },
    bike: { title: 'Futuristik velosiped', description: 'Energiya tejovchi velosiped va shahar uchun oqlangan kiber transport modelidir.' },
    glasses: { title: 'AR ko\'zoynak', description: 'Aqlli ko\'zoynak real va virtual dunyoni birlashtiruvchi yangi kuzatuv tajribasini taqdim etadi.' },
    bag: { title: 'Zamonaviy sumka', description: 'Sifatli material va oqlangan shaklga ega sumka, har kuni uchun mustahkam va chiroyli.' },
    helmet: { title: 'Kiber shlem', description: 'Xavfsizlik va futuristik ko\'rinish, sport va kiber faoliyat uchun mos mahsulot.' },
    cube: { title: 'Mahsulot ma\'lumoti', description: 'Har bir mahsulotga alohida ta\'rif yoziladi va shu yerda ko\'rsatiladi.' }
};

function openProductPreview(productType) {
    playClickSound();
    const modal = document.getElementById('product-modal');
    modal.classList.remove('fullscreen-mode');
    const titleEl = document.getElementById('preview-title');
    const descriptionEl = document.getElementById('preview-description');
    const info = PRODUCT_DATA[productType] || PRODUCT_DATA.cube;

    if (titleEl) titleEl.textContent = info.title;
    if (descriptionEl) descriptionEl.textContent = info.description;

    // Remove iframe if present, restore preview-info
    const existingFrame = document.getElementById('preview-iframe');
    if (existingFrame) existingFrame.remove();
    const previewInfo = modal.querySelector('.preview-info');
    if (previewInfo) previewInfo.style.display = 'flex';

    modal.style.display = 'flex';
}

function openGameModal(href, title) {
    playClickSound();
    const modal = document.getElementById('product-modal');
    modal.classList.add('fullscreen-mode');

    const previewCard = modal.querySelector('.preview-card');
    const previewInfo = previewCard.querySelector('.preview-info');
    if (previewInfo) previewInfo.style.display = 'none';

    const iframe = document.createElement('iframe');
    iframe.id = 'preview-iframe';
    iframe.src = href || '';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '0';
    iframe.style.background = '#fff';
    // O'yinlar uchun muhim ruxsatlar
    iframe.allow = "autoplay; fullscreen; keyboard; gamepad";
    iframe.setAttribute('allowfullscreen', 'true');

    previewCard.insertBefore(iframe, previewInfo);

    const titleEl = document.getElementById('preview-title');
    if (titleEl) titleEl.textContent = title || 'Game Preview';

    modal.style.display = 'flex';

    // Barcha brauzerlar uchun Fullscreen so'rovi (Cross-browser)
    const requestFS = modal.requestFullscreen ||
        modal.webkitRequestFullscreen ||
        modal.mozRequestFullScreen ||
        modal.msRequestFullscreen;

    if (requestFS) {
        requestFS.call(modal).catch(err => console.warn("Fullscreen reject:", err));
    }
}

function closeProductPreview() {
    playClickSound();
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
    modal.classList.remove('fullscreen-mode');

    const iframe = document.getElementById('preview-iframe');
    if (iframe) iframe.remove();
    const previewInfo = modal.querySelector('.preview-info');
    if (previewInfo) previewInfo.style.display = 'flex';
    modal.style.display = 'none';
}

// Fullscreen chiqishni nazorat qilish (ESC tugmasi uchun)
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const modal = document.getElementById('product-modal');
        if (modal && modal.classList.contains('fullscreen-mode')) closeProductPreview();
    }
});

// ─────────────────────────────────────────────
// 10. TERMINAL CERTIFICATE VERIFICATION
// ─────────────────────────────────────────────
function generateFakeHash(length) {
    let result = '';
    const chars = 'ABCDEF0123456789';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function verifyCert(certId, certName) {
    playClickSound();
    initAudio();
    const modal = document.getElementById('terminal-modal');
    const logContainer = document.getElementById('modal-log-container');
    logContainer.innerHTML = '';
    modal.style.display = 'flex';

    const logs = [
        { text: `[SYSTEM] Tashqi server bilan aloqa o'rnatilmoqda...`, delay: 100, cls: 'terminal-accent' },
        { text: `[SERVER] Ulanish muvaffaqiyatli: SecureSSL TLSv1.3`, delay: 400, cls: '' },
        { text: `[SECURE] Kiber-sertifikat xeshini yuklash boshlandi...`, delay: 700, cls: '' },
        { text: `[DECRYPT] Kalit de-shifrlash faollashtirilmoqda...`, delay: 1000, cls: 'terminal-purple' },
        { text: `[HASH-ID] ID: ${certId.toUpperCase()}_CERT_2026_${generateFakeHash(12)}`, delay: 1300, cls: 'terminal-accent' },
        { text: `[BLOCKCHAIN] Blokcheyn orqali imzo tahlil qilinmoqda...`, delay: 1700, cls: '' },
        { text: `[PENDING] Tasdiq kutilmoqda. SHA-256 imzolari solishtirilmoqda...`, delay: 2000, cls: '' },
        { text: `[VALID] Tahlil yakunlandi! Blok kodi zanjirga mos keldi.`, delay: 2500, cls: 'terminal-success' },
        { text: `--------------------------------------------------------`, delay: 2800, cls: '' },
        { text: `[SUCCESS] SERTIFIKAT VERIFIED!`, delay: 3100, cls: 'terminal-success' },
        { text: `[TITLE] Nomi: ${certName}`, delay: 3300, cls: '' },
        { text: `[OWNER] Mutaxassis: Miraziz Oltibaev`, delay: 3500, cls: '' },
        { text: `[DATE] Imzolangan vaqt: 2026.04.12 16:12:16 UTC`, delay: 3700, cls: '' },
        { text: `--------------------------------------------------------`, delay: 3900, cls: '' },
        { text: `[INFO] Tizim ishonchli. Kiber-himoyalangan aloqa yopildi.`, delay: 4200, cls: 'terminal-success' }
    ];

    logs.forEach(log => {
        setTimeout(() => {
            const p = document.createElement('p');
            p.className = `terminal-log ${log.cls}`;
            p.innerText = log.text;
            logContainer.appendChild(p);
            logContainer.scrollTop = logContainer.scrollHeight;

            if (log.text.includes('SUCCESS') || log.text.includes('VERIFIED')) {
                playSuccessSound();
            } else if (log.text.includes('HASH-ID') || log.text.includes('BLOCKCHAIN')) {
                playSynthSound(800, 'square', 0.05, 0.02);
            } else {
                playSynthSound(600, 'sine', 0.04, 0.01);
            }
        }, log.delay);
    });
}

function closeTerminal() {
    playClickSound();
    document.getElementById('terminal-modal').style.display = 'none';
}

// ─────────────────────────────────────────────
// 11. CONTACT FORM SUBMISSION
// ─────────────────────────────────────────────
function triggerSubmit() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const msg = document.getElementById('contact-msg').value;

    if (name && email && msg) {
        playSuccessSound();
        alert(`Xurmatli ${name}! Xabaringiz kiber-shifrlanib, xavfsiz kanallar orqali Mirazizga muvaffaqiyatli yuborildi!`);
        document.getElementById('contact-name').value = '';
        document.getElementById('contact-email').value = '';
        document.getElementById('contact-msg').value = '';
    } else {
        playErrorSound();
    }
}

// ─────────────────────────────────────────────
// 12. LAPTOP 3D INTERACTIVE (Notebook page)
// ─────────────────────────────────────────────
function explodeLaptop() {
    const laptop = document.getElementById('laptop');
    if (!laptop) return;
    laptop.classList.add('exploded');
    laptop.style.transform = 'rotateX(70deg) rotateZ(-45deg)';
}

function resetLaptop() {
    const laptop = document.getElementById('laptop');
    if (!laptop) return;
    laptop.classList.remove('exploded');
    laptop.style.transform = 'rotateX(60deg) rotateZ(-30deg)';
}

// Notebook SVG hover effect
document.addEventListener('DOMContentLoaded', () => {
    const notebookSvg = document.querySelector('.notebook-svg svg');
    if (notebookSvg) {
        notebookSvg.addEventListener('mouseenter', () => notebookSvg.style.transform = 'rotate(5deg) scale(1.05)');
        notebookSvg.addEventListener('mouseleave', () => notebookSvg.style.transform = 'rotate(0deg) scale(1)');
    }

    // Profile icon hover
    const icon = document.querySelector('.profile-svg');
    if (icon) {
        icon.addEventListener('mouseenter', () => icon.classList.add('svg-hover'));
        icon.addEventListener('mouseleave', () => icon.classList.remove('svg-hover'));
    }
});