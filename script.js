/* ==========================================================================
   JAVASCRIPT CONTROLLER (JUN WEI PORTFOLIO)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Components
    initNavbar();
    initScrollReveal();
    initHeroParticles();
    initHUDStream();
    initPortfolioLightbox();
    initTradingLab();
});

/* ==========================================================================
   NAVBAR CONTROLLER (ACTIVE SCROLL & MOBILE TOGGLE)
   ========================================================================== */

function initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = document.body.dataset.page;

    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === currentPage);
    });

    // Scroll effect (Header background change)
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close Mobile Menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

/* ==========================================================================
   SCROLL REVEAL (INTERSECTION OBSERVER)
   ========================================================================== */

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const progressBars = document.querySelectorAll('.progress-bar');

    const observerOptions = {
        root: null, // viewport
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Animate progress bars in about section when visible
                if (entry.target.id === 'about') {
                    progressBars.forEach(bar => {
                        const width = bar.style.width;
                        bar.style.transform = 'scaleX(1)';
                    });
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(element => {
        revealObserver.observe(element);
    });
}

/* ==========================================================================
   HERO CANVAS (FLOWING PARTICLES & CONNECTION LINES)
   ========================================================================== */

function initHeroParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const mouseXDisplay = document.getElementById('mouse-x');
    const mouseYDisplay = document.getElementById('mouse-y');

    let particles = [];
    let animationFrameId;
    let mouse = { x: null, y: null, radius: 150 };

    // Resize canvas
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        initParticlesArray();
    }

    // Particle Object Structure
    class Particle {
        constructor(x, y, vx, vy, size) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.size = size;
            this.baseX = x;
            this.baseY = y;
            // High styling colors matching White/Beige/Grey
            this.color = Math.random() > 0.4 
                ? 'rgba(255, 255, 255, 0.45)' 
                : 'rgba(230, 223, 211, 0.65)'; // Beige accent
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            // Drift velocity
            this.x += this.vx;
            this.y += this.vy;

            // Bounce back from boundaries
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            // Mouse interactive repulsion force
            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.hypot(dx, dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Push particles away
                    const angle = Math.atan2(dy, dx);
                    const pushX = Math.cos(angle) * force * 2;
                    const pushY = Math.sin(angle) * force * 2;
                    
                    this.x -= pushX;
                    this.y -= pushY;
                }
            }
        }
    }

    // Populate particles density based on size
    function initParticlesArray() {
        particles = [];
        const area = canvas.width * canvas.height;
        const particleCount = Math.floor(area / 11000); // Clean balanced spacing

        for (let i = 0; i < particleCount; i++) {
            const size = Math.random() * 2 + 1; // 1px to 3px
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const vx = (Math.random() - 0.5) * 0.4;
            const vy = (Math.random() - 0.5) * 0.4;
            particles.push(new Particle(x, y, vx, vy, size));
        }
    }

    // Draw lines between near particles
    function connect() {
        const maxDist = 120;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const dist = Math.hypot(dx, dy);

                if (dist < maxDist) {
                    // Gradual fade out based on proximity distance
                    const alpha = (1 - dist / maxDist) * 0.15;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }

            // Connect particles to mouse
            if (mouse.x != null && mouse.y != null) {
                const dx = particles[a].x - mouse.x;
                const dy = particles[a].y - mouse.y;
                const dist = Math.hypot(dx, dy);

                if (dist < mouse.radius) {
                    const alpha = (1 - dist / mouse.radius) * 0.25;
                    ctx.strokeStyle = `rgba(230, 223, 211, ${alpha})`; // Warm beige line to cursor
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        connect();
        animationFrameId = requestAnimationFrame(animate);
    }

    // Mouse Events
    window.addEventListener('mousemove', (e) => {
        // Adjust for viewport scrolling
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;

        // Update coordinate printout
        if (mouseXDisplay && mouseYDisplay) {
            mouseXDisplay.textContent = Math.round(mouse.x).toString().padStart(4, '0');
            mouseYDisplay.textContent = Math.round(mouse.y).toString().padStart(4, '0');
        }
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
        if (mouseXDisplay && mouseYDisplay) {
            mouseXDisplay.textContent = '0000';
            mouseYDisplay.textContent = '0000';
        }
    });

    window.addEventListener('resize', resizeCanvas);
    
    // Start Animation
    resizeCanvas();
    animate();
}

/* ==========================================================================
   HUD TEXT LOG STREAM SIMULATION
   ========================================================================== */

function initHUDStream() {
    const streamContainer = document.getElementById('hud-stream');
    if (!streamContainer) return;

    const logTemplates = [
        "ALGO.EXECUTION: INIT OK",
        "CONNECT: DATA_SERVER_01 // SECURE",
        "SCANNING: MA5 MA20 CRITICAL OVERLAYS",
        "RETRIEVING: HISTORICAL WEIGHTS...",
        "NEURAL LOG: LAYER_DENSE COMPLETED",
        "PREDICTION: VOLATILITY SCALING = 1.05",
        "DECISION: BOUNDARY CHECK ACTIVE",
        "STRATEGY: MULTI-FACTOR RUNNING",
        "SENTIMENT: NLP FEED LOADED",
        "PSYCHOLOGY: ERROR ACCUMULATION = 0.0%",
        "COORDINATE: STOCHASTIC VECTOR UPDATED"
    ];

    function addLog() {
        // Random choose template
        const text = logTemplates[Math.floor(Math.random() * logTemplates.length)];
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        
        const logItem = document.createElement('div');
        logItem.className = 'stream-item';
        logItem.innerHTML = `<span>[${time}]</span> ${text}`;

        streamContainer.appendChild(logItem);

        // Keep limited lines
        while (streamContainer.children.length > 5) {
            streamContainer.removeChild(streamContainer.firstChild);
        }
    }

    // Seed initial entries
    for (let i = 0; i < 4; i++) {
        setTimeout(addLog, i * 500);
    }

    // Loop interval
    setInterval(addLog, 4000);
}

/* ==========================================================================
   PORTFOLIO CONTROLLER (LIGHTBOX & SVG FALLBACK GENERATION)
   ========================================================================== */

// Helper: Check if an image actually exists, otherwise replace with placeholder
function handleImageFallbacks() {
    const portfolioImages = document.querySelectorAll('.portfolio-img');
    portfolioImages.forEach(img => {
        img.addEventListener('error', function() {
            // Replaced with structured placeholder SVG data URI
            const index = this.closest('.portfolio-card').getAttribute('data-index');
            const fallbackSVG = createSVGPlaceholder(parseInt(index) + 2);
            this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(fallbackSVG);
            this.classList.add('is-fallback');
        });
    });
}

// Generate premium high-tech look vector placeholders
function createSVGPlaceholder(imgNumber) {
    const numStr = imgNumber.toString().padStart(2, '0');
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 375" width="100%" height="100%">
        <rect width="100%" height="100%" fill="#EFEFEF"/>
        <!-- Background Grid -->
        <path d="M 0 37.5 L 600 37.5 M 0 75 L 600 75 M 0 112.5 L 600 112.5 M 0 150 L 600 150 M 0 187.5 L 600 187.5 M 0 225 L 600 225 M 0 262.5 L 600 262.5 M 0 300 L 600 300 M 0 337.5 L 600 337.5" stroke="rgba(0,0,0,0.02)" stroke-width="1"/>
        <path d="M 60 0 L 60 375 M 120 0 L 120 375 M 180 0 L 180 375 M 240 0 L 240 375 M 300 0 L 300 375 M 360 0 L 360 375 M 420 0 L 420 375 M 480 0 L 480 375 M 540 0 L 540 375" stroke="rgba(0,0,0,0.02)" stroke-width="1"/>
        
        <!-- Tech HUD Elements -->
        <rect x="20" y="20" width="560" height="335" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>
        <rect x="25" y="25" width="30" height="30" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>
        <line x1="25" y1="25" x2="55" y2="55" stroke="rgba(0,0,0,0.15)"/>
        
        <circle cx="300" cy="187" r="80" fill="none" stroke="rgba(210, 200, 185, 0.4)" stroke-width="2"/>
        <circle cx="300" cy="187" r="110" fill="none" stroke="rgba(0,0,0,0.05)" stroke-dasharray="5,5" stroke-width="1"/>
        <circle cx="300" cy="187" r="40" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>
        
        <!-- Crosshairs -->
        <line x1="160" y1="187" x2="440" y2="187" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>
        <line x1="300" y1="60" x2="300" y2="315" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>
        
        <!-- Diagonal Lines -->
        <line x1="20" y1="20" x2="100" y2="100" stroke="rgba(0,0,0,0.03)" stroke-width="1"/>
        <line x1="580" y1="20" x2="500" y2="100" stroke="rgba(0,0,0,0.03)" stroke-width="1"/>
        <line x1="20" y1="355" x2="100" y2="275" stroke="rgba(0,0,0,0.03)" stroke-width="1"/>
        <line x1="580" y1="355" x2="500" y2="275" stroke="rgba(0,0,0,0.03)" stroke-width="1"/>

        <!-- Text Data -->
        <text x="300" y="192" font-family="'Share Tech Mono', monospace" font-size="16" fill="rgba(0,0,0,0.6)" text-anchor="middle" letter-spacing="1">IMG/0${imgNumber}.JPG</text>
        <text x="300" y="215" font-family="'Outfit', sans-serif" font-size="11" fill="rgba(0,0,0,0.3)" text-anchor="middle" letter-spacing="2">AI TECHNOLOGY DEMO SYSTEM</text>
        <text x="40" y="335" font-family="'Share Tech Mono', monospace" font-size="10" fill="rgba(0,0,0,0.4)">CH.STAT: OFFLINE</text>
        <text x="560" y="335" font-family="'Share Tech Mono', monospace" font-size="10" fill="rgba(0,0,0,0.4)" text-anchor="end">SYS.REF: #00${imgNumber}</text>
    </svg>
    `;
}

function initPortfolioLightbox() {
    // Run image fallback verification immediately
    handleImageFallbacks();

    const lightbox = document.getElementById('lightbox');
    const lightboxContainer = document.getElementById('lightbox-img-container');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    if (!lightbox || !lightboxContainer || !lightboxClose || !lightboxCaption || !portfolioCards.length) return;

    portfolioCards.forEach(card => {
        card.addEventListener('click', () => {
            const index = card.getAttribute('data-index');
            const imgSrc = card.getAttribute('data-src');
            const title = card.querySelector('.card-title').textContent;
            const desc = card.querySelector('.card-desc').textContent;

            lightboxContainer.innerHTML = '';
            lightboxCaption.innerHTML = `<strong>${title}</strong> — ${desc}`;

            // Create temp image to test if file exists
            const tempImg = new Image();
            tempImg.src = imgSrc;
            
            tempImg.onload = () => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = title;
                lightboxContainer.appendChild(img);
            };

            tempImg.onerror = () => {
                // Generate and inject vector SVG placeholder
                const fallbackSVG = createSVGPlaceholder(parseInt(index) + 2);
                const wrapper = document.createElement('div');
                wrapper.innerHTML = fallbackSVG;
                lightboxContainer.appendChild(wrapper.firstElementChild);
            };

            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Lock background scrolling
        });
    });

    // Close Actions
    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    lightboxClose.addEventListener('click', closeLightbox);
    
    // Close on clicking backdrop glass
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard ESC Close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

/* ==========================================================================
   TRADING LAB CONTROLLER (SIMULATION, MOVING AVERAGE & CANVAS CHART)
   ========================================================================== */

function initTradingLab() {
    const btnStart = document.getElementById('btn-start');
    const btnStop = document.getElementById('btn-stop');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const valPrice = document.getElementById('val-price');
    const valMa5 = document.getElementById('val-ma5');
    const valMa20 = document.getElementById('val-ma20');
    const valSignal = document.getElementById('val-signal');
    const chartCanvas = document.getElementById('trading-chart');

    if (!btnStart || !btnStop || !statusDot || !statusText || !valPrice || !valMa5 || !valMa20 || !valSignal || !chartCanvas) return;

    let isSimulating = false;
    let updateTimer = null;
    
    // Sequence storage for dynamic calculations
    let prices = [];
    const basePrice = 100.0;
    
    // Chart details configuration
    let ctxChart = null;
    if (chartCanvas) {
        ctxChart = chartCanvas.getContext('2d');
    }

    // Setup basic price history sequence (20 entries) to start MA rendering immediately
    function preseedHistory() {
        prices = [];
        let curr = basePrice;
        for (let i = 0; i < 40; i++) {
            // Simple random drift walks
            const pct = (Math.random() - 0.49) * 0.015; // slightly positive drift
            curr = curr * (1 + pct);
            prices.push(curr);
        }
        updateDisplay();
    }

    function calculateMA(period) {
        if (prices.length < period) return null;
        const slice = prices.slice(-period);
        const sum = slice.reduce((acc, val) => acc + val, 0);
        return sum / period;
    }

    function drawChart() {
        if (!ctxChart || !chartCanvas) return;
        
        // Match canvas dimensions to container layout bounding box
        chartCanvas.width = chartCanvas.offsetWidth;
        chartCanvas.height = chartCanvas.offsetHeight;

        const w = chartCanvas.width;
        const h = chartCanvas.height;
        ctxChart.clearRect(0, 0, w, h);

        const dataPoints = prices.slice(-30); // Draw the last 30 data periods
        if (dataPoints.length === 0) return;

        const maxPrice = Math.max(...dataPoints) * 1.002;
        const minPrice = Math.min(...dataPoints) * 0.998;
        const range = maxPrice - minPrice;

        const padding = 15;
        const chartH = h - padding * 2;
        const stepX = w / (dataPoints.length - 1);

        // Helper: Convert price to canvas coordinates
        function getY(p) {
            return h - padding - ((p - minPrice) / range) * chartH;
        }

        // Draw background grid lines (2 horizontal thresholds)
        ctxChart.strokeStyle = 'rgba(0, 0, 0, 0.03)';
        ctxChart.lineWidth = 1;
        ctxChart.beginPath();
        ctxChart.moveTo(0, getY(minPrice + range * 0.33));
        ctxChart.lineTo(w, getY(minPrice + range * 0.33));
        ctxChart.moveTo(0, getY(minPrice + range * 0.66));
        ctxChart.lineTo(w, getY(minPrice + range * 0.66));
        ctxChart.stroke();

        // 1. Draw MA20 Line (calculated from history stack)
        const ma20Line = [];
        for (let i = 0; i < dataPoints.length; i++) {
            // Find global index in prices array
            const globalIndex = prices.length - dataPoints.length + i;
            const slice = prices.slice(0, globalIndex + 1);
            if (slice.length >= 20) {
                const sum = slice.slice(-20).reduce((acc, v) => acc + v, 0) / 20;
                ma20Line.push({ x: i * stepX, y: getY(sum) });
            }
        }

        if (ma20Line.length > 1) {
            ctxChart.strokeStyle = 'rgba(210, 195, 170, 0.8)'; // Beige Accent Line
            ctxChart.lineWidth = 1.5;
            ctxChart.beginPath();
            ctxChart.moveTo(ma20Line[0].x, ma20Line[0].y);
            for (let i = 1; i < ma20Line.length; i++) {
                ctxChart.lineTo(ma20Line[i].x, ma20Line[i].y);
            }
            ctxChart.stroke();
        }

        // 2. Draw MA5 Line
        const ma5Line = [];
        for (let i = 0; i < dataPoints.length; i++) {
            const globalIndex = prices.length - dataPoints.length + i;
            const slice = prices.slice(0, globalIndex + 1);
            if (slice.length >= 5) {
                const sum = slice.slice(-5).reduce((acc, v) => acc + v, 0) / 5;
                ma5Line.push({ x: i * stepX, y: getY(sum) });
            }
        }

        if (ma5Line.length > 1) {
            ctxChart.strokeStyle = 'rgba(0, 0, 0, 0.25)'; // Dark Grey Line
            ctxChart.lineWidth = 1.5;
            ctxChart.beginPath();
            ctxChart.moveTo(ma5Line[0].x, ma5Line[0].y);
            for (let i = 1; i < ma5Line.length; i++) {
                ctxChart.lineTo(ma5Line[i].x, ma5Line[i].y);
            }
            ctxChart.stroke();
        }

        // 3. Draw Price Line
        ctxChart.strokeStyle = 'rgba(0, 0, 0, 0.85)';
        ctxChart.lineWidth = 2.2;
        ctxChart.beginPath();
        ctxChart.moveTo(0, getY(dataPoints[0]));
        for (let i = 1; i < dataPoints.length; i++) {
            ctxChart.lineTo(i * stepX, getY(dataPoints[i]));
        }
        ctxChart.stroke();

        // 4. Highlight current price node dot
        const finalX = w;
        const finalY = getY(dataPoints[dataPoints.length - 1]);
        ctxChart.fillStyle = '#000000';
        ctxChart.beginPath();
        ctxChart.arc(finalX - 3, finalY, 4, 0, Math.PI * 2);
        ctxChart.fill();
    }

    function updateDisplay() {
        const currentPrice = prices[prices.length - 1];
        const ma5 = calculateMA(5);
        const ma20 = calculateMA(20);

        valPrice.textContent = `$${currentPrice.toFixed(2)}`;
        valMa5.textContent = ma5 ? `$${ma5.toFixed(2)}` : '--';
        valMa20.textContent = ma20 ? `$${ma20.toFixed(2)}` : '--';

        // Update Signals and Blinking Visual States
        if (ma5 && ma20) {
            if (ma5 > ma20) {
                valSignal.textContent = 'BUY';
                valSignal.className = 'metric-value font-tech signal-display signal-buy';
            } else if (ma5 < ma20) {
                valSignal.textContent = 'SELL';
                valSignal.className = 'metric-value font-tech signal-display signal-sell';
            } else {
                valSignal.textContent = 'HOLD';
                valSignal.className = 'metric-value font-tech signal-display';
            }
        } else {
            valSignal.textContent = 'WAIT';
            valSignal.className = 'metric-value font-tech signal-display';
        }

        // Re-render chart vector canvas
        drawChart();
    }

    function startSimulation() {
        if (isSimulating) return;
        isSimulating = true;

        // Toggle buttons state
        btnStart.disabled = true;
        btnStop.disabled = false;
        
        // Toggle system label diagnostics
        statusDot.classList.add('active');
        statusText.textContent = 'SYSTEM RUNNING';

        // Set interval price fluctuations loop
        updateTimer = setInterval(() => {
            let lastPrice = prices[prices.length - 1];
            // Random walk: percentage shifts (-1.8% to +1.8%)
            const deltaPercent = (Math.random() - 0.495) * 0.035; 
            const newPrice = lastPrice * (1 + deltaPercent);
            
            prices.push(newPrice);
            if (prices.length > 100) prices.shift(); // Keep storage bounded

            updateDisplay();
        }, 1000);
    }

    function stopSimulation() {
        if (!isSimulating) return;
        isSimulating = false;

        // Toggle buttons state
        btnStart.disabled = false;
        btnStop.disabled = true;
        
        // Toggle system label diagnostics
        statusDot.classList.remove('active');
        statusText.textContent = 'SYSTEM STOPPED';

        // Clear interval
        clearInterval(updateTimer);
    }

    // Attach listeners
    btnStart.addEventListener('click', startSimulation);
    btnStop.addEventListener('click', stopSimulation);

    // Seed chart and populate stats on page load
    preseedHistory();
    
    // Re-draw grid when screen dimensions are resized
    window.addEventListener('resize', drawChart);
}
