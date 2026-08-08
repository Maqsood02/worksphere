/* Animations and UI Script: AlexDev Platform */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Interactive Cursor Glow
    initCursorGlow();

    // 2. Initialize Sticky Navbar scroll triggers
    initStickyNavbar();

    // 3. Initialize Scroll Reveal observers
    initScrollReveal();

    // 4. Initialize Odometer statistics counters
    initCounterAnimations();
});

// Cursor Glow implementation
function initCursorGlow() {
    const glow = document.createElement("div");
    glow.className = "cursor-glow hidden sm:block";
    document.body.appendChild(glow);

    document.addEventListener("mousemove", (e) => {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
    });
}

// Sticky Navbar transition on scroll
function initStickyNavbar() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("glass-navbar", "border-slate-100", "shadow-sm");
            navbar.classList.remove("border-transparent");
            navbar.querySelector("div").classList.remove("py-4");
            navbar.querySelector("div").classList.add("py-2.5");
        } else {
            navbar.classList.remove("glass-navbar", "border-slate-100", "shadow-sm");
            navbar.classList.add("border-transparent");
            navbar.querySelector("div").classList.remove("py-2.5");
            navbar.querySelector("div").classList.add("py-4");
        }
    });
}

// Toggle mobile menu drawer
function toggleMobileMenu() {
    const menu = document.getElementById("mobile-menu");
    const icon = document.getElementById("mobile-menu-icon");
    if (!menu) return;

    const isHidden = menu.classList.contains("hidden");
    if (isHidden) {
        menu.classList.remove("hidden");
        icon.setAttribute("data-lucide", "x");
    } else {
        menu.classList.add("hidden");
        icon.setAttribute("data-lucide", "menu");
    }
    lucide.createIcons();
}

// Scroll Reveal trigger checks
function initScrollReveal() {
    const revealElements = document.querySelectorAll(".scroll-reveal");
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target); // Reveal once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => observer.observe(el));
}

// Counter statistics incrementation
function initCounterAnimations() {
    const counters = document.querySelectorAll(".font-counter");
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const limit = parseInt(target.getAttribute("data-target"), 10);
                let current = 0;
                const increment = Math.ceil(limit / 50); // complete in 50 steps
                const speed = 30; // 30ms intervals

                const countTimer = setInterval(() => {
                    current += increment;
                    if (current >= limit) {
                        target.innerText = limit;
                        clearInterval(countTimer);
                    } else {
                        target.innerText = current;
                    }
                }, speed);

                observer.unobserve(target);
            }
        });
    }, { threshold: 0.8 });

    counters.forEach(c => observer.observe(c));
}

// Floating Toast Notification system
function showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    // Create toast card element
    const toast = document.createElement("div");
    toast.className = "bg-white/95 border border-slate-200 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center space-x-3 pointer-events-auto transform translate-y-8 opacity-0 transition-all duration-300 max-w-sm";
    
    // Add lucide bell icon
    toast.innerHTML = `
        <div class="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
            <i data-lucide="bell" class="w-4 h-4"></i>
        </div>
        <div class="text-xs text-text-dark font-semibold leading-relaxed">${message}</div>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    // Fade and slide in
    setTimeout(() => {
        toast.classList.remove("translate-y-8", "opacity-0");
    }, 50);

    // Fade and slide out
    setTimeout(() => {
        toast.classList.add("translate-y-8", "opacity-0");
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

// Back to top scroll tracking
window.addEventListener("scroll", () => {
    const btn = document.getElementById("back-to-top");
    if(!btn) return;
    
    if(window.scrollY > 300) {
        btn.classList.remove("opacity-0", "translate-y-8", "pointer-events-none");
    } else {
        btn.classList.add("opacity-0", "translate-y-8", "pointer-events-none");
    }
});
