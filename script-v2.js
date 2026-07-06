// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    /* ==========================================================================
       LENIS SMOOTH SCROLL
       ========================================================================== */
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom ease
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Keep ScrollTrigger in sync with Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    /* ==========================================================================
       CUSTOM CURSOR
       ========================================================================== */
    const cursor = document.getElementById("custom-cursor");
    const follower = document.getElementById("custom-cursor-follower");

    let mouseX = 0, mouseY = 0;
    let followX = 0, followY = 0;

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant cursor position
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
    });

    // Follower cursor lag effect
    function animateFollower() {
        // Linear interpolation: delay/lag effect
        followX += (mouseX - followX) * 0.1;
        followY += (mouseY - followY) * 0.1;

        follower.style.left = `${followX}px`;
        follower.style.top = `${followY}px`;

        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Hover states for cursor
    const interactiveElements = document.querySelectorAll("a, button, input, textarea, .btn, .timeline-content-box, .project-card, .skill-category-card, .strength-tag");
    interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", () => {
            document.body.classList.add("hovering");
        });
        el.addEventListener("mouseleave", () => {
            document.body.classList.remove("hovering");
        });
    });

    /* ==========================================================================
       HEADER SCROLL CLASS
       ========================================================================== */
    const header = document.querySelector(".header");

    // Header gets dark/blur background after 50px scroll on all screen sizes
    ScrollTrigger.create({
        start: "top -50px",
        onUpdate: (self) => {
            if (self.direction === 1) {
                header.classList.add("scrolled");
            } else if (self.scroll() === 0) {
                header.classList.remove("scrolled");
            }
        }
    });

    /* ==========================================================================
       HERO PARTICLES CANVAS
       ========================================================================== */
    const canvas = document.getElementById("hero-particles");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        // Mouse Move inside Hero
        window.addEventListener("mousemove", (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener("mouseleave", () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.baseX = this.x;
                this.baseY = this.y;
                
                // Color configuration: Orange, Gray, White
                const randColor = Math.random();
                if (randColor < 0.4) {
                    this.color = "rgba(255, 102, 0, " + (Math.random() * 0.4 + 0.2) + ")"; // Orange shade
                } else if (randColor < 0.8) {
                    this.color = "rgba(255, 255, 255, " + (Math.random() * 0.3 + 0.1) + ")"; // White shade
                } else {
                    this.color = "rgba(85, 85, 85, " + (Math.random() * 0.4 + 0.1) + ")"; // Muted gray shade
                }

                this.density = (Math.random() * 30) + 10;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                // Natural movement
                this.x += this.vx;
                this.y += this.vy;

                // Bounce boundaries
                if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
                if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

                // Mouse interactive force fields
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        let directionX = forceDirectionX * force * this.density * 0.6;
                        let directionY = forceDirectionY * force * this.density * 0.6;
                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }
            }
        }

        function initParticles() {
            particles = [];
            const numberOfParticles = Math.floor((canvas.width * canvas.height) / 15000);
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        }

        // Handle Resize & Init
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        }
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
        animateParticles();
    }

    /* ==========================================================================
       TEXT SPLITTING HELPER FUNCTIONS
       ========================================================================== */
    function splitElementIntoWords(element) {
        if (!element) return;
        const nodes = Array.from(element.childNodes);
        element.innerHTML = "";
        
        nodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                const words = text.split(/(\s+)/);
                words.forEach(word => {
                    if (word.trim() === "") {
                        element.appendChild(document.createTextNode(word));
                    } else {
                        const spanWrapper = document.createElement("span");
                        spanWrapper.className = "word-wrapper";
                        
                        const spanAnim = document.createElement("span");
                        spanAnim.className = "anim-word";
                        spanAnim.textContent = word;
                        
                        spanWrapper.appendChild(spanAnim);
                        element.appendChild(spanWrapper);
                    }
                });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === "BR") {
                    element.appendChild(document.createElement("br"));
                } else if (node.classList.contains("highlight")) {
                    const highlightText = node.textContent;
                    const spanHighlight = document.createElement("span");
                    spanHighlight.className = "highlight word-wrapper";
                    
                    const spanAnim = document.createElement("span");
                    spanAnim.className = "anim-word";
                    spanAnim.textContent = highlightText;
                    
                    spanHighlight.appendChild(spanAnim);
                    element.appendChild(spanHighlight);
                } else {
                    element.appendChild(node.cloneNode(true));
                }
            }
        });
    }

    function splitElementIntoChars(element) {
        if (!element) return;
        const text = element.textContent.trim();
        element.innerHTML = "";
        
        [...text].forEach(char => {
            const charSpan = document.createElement("span");
            if (char === " ") {
                charSpan.innerHTML = "&nbsp;";
                charSpan.style.display = "inline-block";
            } else {
                charSpan.className = "anim-char";
                charSpan.textContent = char;
            }
            element.appendChild(charSpan);
        });
    }

    /* ==========================================================================
       GSAP ANIMATIONS: TEXT & SECTION REVEALS
       ========================================================================== */
    
    // Page load transition
    const heroTitle = document.querySelector(".hero-title");
    const heroSubtitle = document.querySelector(".hero-subtitle");
    
    if (heroTitle) splitElementIntoWords(heroTitle);
    if (heroSubtitle) splitElementIntoChars(heroSubtitle);

    gsap.fromTo(".logo, .nav-link, .nav-cta .btn", 
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: "power3.out" }
    );

    if (heroSubtitle) {
        gsap.from(".hero-subtitle .anim-char", {
            opacity: 0,
            scale: 0.5,
            filter: "blur(4px)",
            duration: 0.8,
            stagger: 0.03,
            ease: "back.out(1.5)",
            delay: 0.2
        });
    }

    if (heroTitle) {
        gsap.from(".hero-title .anim-word", {
            yPercent: 100,
            duration: 1.2,
            stagger: 0.06,
            ease: "power4.out",
            delay: 0.3
        });
    }

    gsap.from(".hero-roles .role-tag, .hero-roles .role-separator", {
        opacity: 0,
        y: 20,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.6
    });

    gsap.from(".hero-image-wrapper", {
        opacity: 0,
        scale: 0.95,
        duration: 1.8,
        ease: "power3.out",
        delay: 0.4
    });

    gsap.from(".scroll-down-indicator", {
        opacity: 0,
        y: -20,
        duration: 1,
        delay: 1
    });

    // Splitting text animations on scroll (About Pitch)
    const pitch = document.getElementById("about-pitch");
    if (pitch) {
        const text = pitch.textContent.trim();
        const words = text.split(" ");
        pitch.innerHTML = words.map(word => `<span class="reveal-word">${word}</span>`).join(" ");

        gsap.fromTo(".reveal-word", 
            { opacity: 0.2 },
            {
                opacity: 1,
                stagger: 0.05,
                scrollTrigger: {
                    trigger: "#about",
                    start: "top 75%",
                    end: "top 25%",
                    scrub: true,
                }
            }
        );
    }

    // Scroll triggered section labels & titles
    document.querySelectorAll(".section-label").forEach(label => {
        splitElementIntoChars(label);
        gsap.from(label.querySelectorAll(".anim-char"), {
            opacity: 0,
            scale: 1.5,
            filter: "blur(4px)",
            duration: 0.6,
            stagger: 0.02,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: label,
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        });
    });

    document.querySelectorAll(".section-title").forEach(title => {
        splitElementIntoWords(title);
        gsap.from(title.querySelectorAll(".anim-word"), {
            yPercent: 100,
            duration: 1.2,
            stagger: 0.05,
            ease: "power4.out",
            scrollTrigger: {
                trigger: title,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Paragraph descriptions word-by-word fade-in reveal
    document.querySelectorAll(".about-description, #about-objective, .slide-desc, .project-desc").forEach(p => {
        splitElementIntoWords(p);
        gsap.from(p.querySelectorAll(".anim-word"), {
            opacity: 0.2,
            duration: 0.8,
            stagger: 0.02,
            ease: "power2.out",
            scrollTrigger: {
                trigger: p,
                start: "top 85%",
                end: "top 60%",
                scrub: true
            }
        });
    });

    // Extra About info & block animations
    gsap.from(".info-block", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".about-extra-info",
            start: "top 85%",
            toggleActions: "play none none reverse"
        }
    });

    gsap.from(".career-objective-box", {
        opacity: 0,
        x: 40,
        duration: 1.2,
        scrollTrigger: {
            trigger: ".career-objective-box",
            start: "top 85%",
            toggleActions: "play none none reverse"
        }
    });

    gsap.from(".strengths-box h4, .strength-tag", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".strengths-box",
            start: "top 85%",
            toggleActions: "play none none reverse"
        }
    });

    /* ==========================================================================
       GSAP ANIMATIONS: EXPERIENCE TIMELINE
       ========================================================================== */
    const timelineItems = document.querySelectorAll(".timeline-item");
    if (timelineItems.length > 0) {
        
        // Progress bar line animation
        gsap.fromTo(".timeline-progress", 
            { height: "0%" },
            { 
                height: "100%",
                ease: "none",
                scrollTrigger: {
                    trigger: ".timeline-container",
                    start: "top 25%",
                    end: "bottom 75%",
                    scrub: true
                }
            }
        );

        // Highlight items as you scroll
        timelineItems.forEach((item) => {
            const contentBox = item.querySelector(".timeline-content-box");
            const role = item.querySelector(".timeline-role");
            const company = item.querySelector(".timeline-company");
            const details = contentBox.querySelectorAll("h5, li");
            
            if (role) splitElementIntoWords(role);
            if (company) splitElementIntoWords(company);
            
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: item,
                    start: "top 75%",
                    toggleActions: "play none none reverse",
                    onEnter: () => item.classList.add("active"),
                    onLeaveBack: () => item.classList.remove("active")
                }
            });
            
            tl.from(contentBox, {
                opacity: 0.3,
                y: 30,
                duration: 0.8
            });
            
            if (role) {
                tl.from(role.querySelectorAll(".anim-word"), {
                    yPercent: 100,
                    duration: 0.6,
                    stagger: 0.05
                }, 0.2);
            }
            
            if (company) {
                tl.from(company.querySelectorAll(".anim-word"), {
                    yPercent: 100,
                    duration: 0.6,
                    stagger: 0.05
                }, 0.3);
            }
            
            if (details.length > 0) {
                tl.from(details, {
                    opacity: 0,
                    y: 15,
                    duration: 0.6,
                    stagger: 0.03,
                    ease: "power2.out"
                }, 0.4);
            }
        });
    }

    /* ==========================================================================
       GSAP ANIMATIONS: PROJECTS HORIZONTAL SCROLL
       ========================================================================== */
    const projectsTrack = document.getElementById("projects-track");

    if (projectsTrack) {
        const slides = document.querySelectorAll(".project-slide");
        const totalSlides = slides.length;

        const projectsTween = gsap.to(projectsTrack, {
            xPercent: -80, // 5 slides total. Moving left by 80% shows slides 1, 2, 3, 4 sequentially.
            ease: "none",
            scrollTrigger: {
                trigger: ".projects-pin-section",
                pin: true,
                scrub: 1,
                start: "top top",
                // Scroll length equal to 3.5 times the viewport height for comfortable horizontal scrolling speed
                end: () => "+=" + (window.innerHeight * 3.5),
                invalidateOnRefresh: true
            }
        });

        // Add subtle slide element scale and shift triggers
        slides.forEach((slide, i) => {
            const card = slide.querySelector(".project-card");
            if (!card) return;
            
            const num = card.querySelector(".project-num");
            const name = card.querySelector(".project-name");
            const tags = card.querySelector(".project-tags");
            const features = card.querySelectorAll(".project-features li");
            
            if (name) splitElementIntoWords(name);
            
            gsap.from(card, {
                opacity: 0.6,
                scale: 0.95,
                duration: 1,
                scrollTrigger: {
                    trigger: slide,
                    containerAnimation: projectsTween,
                    start: "left 80%",
                    end: "left 20%",
                    scrub: true
                }
            });

            // Text animations within project card (trigger when card enters view)
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: slide,
                    containerAnimation: projectsTween,
                    start: "left 75%",
                    toggleActions: "play none none reverse"
                }
            });
            
            if (num) {
                tl.from(num, {
                    opacity: 0,
                    x: -20,
                    duration: 0.6
                }, 0.1);
            }
            
            if (name) {
                tl.from(name.querySelectorAll(".anim-word"), {
                    yPercent: 100,
                    duration: 0.8,
                    stagger: 0.05
                }, 0.2);
            }
            
            if (tags) {
                tl.from(tags, {
                    opacity: 0,
                    y: 10,
                    duration: 0.6
                }, 0.3);
            }
            
            if (features.length > 0) {
                tl.from(features, {
                    opacity: 0,
                    y: 15,
                    duration: 0.6,
                    stagger: 0.05,
                    ease: "power2.out"
                }, 0.4);
            }
        });
    }

    /* ==========================================================================
       GSAP ANIMATIONS: TECHNICAL SKILLS PROGRESS BARS
       ========================================================================== */
    const skillCategoryCards = document.querySelectorAll(".skill-category-card");
    if (skillCategoryCards.length > 0) {
        skillCategoryCards.forEach((card) => {
            const techId = card.querySelector(".tech-id");
            const h3 = card.querySelector("h3");
            const tags = card.querySelectorAll(".skill-tag");
            const percents = card.querySelectorAll(".skill-percentage");
            const fills = card.querySelectorAll(".skill-progress-fill");
            
            if (techId) splitElementIntoChars(techId);
            if (h3) splitElementIntoWords(h3);
            
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
            
            if (techId) {
                tl.from(techId.querySelectorAll(".anim-char"), {
                    opacity: 0,
                    scale: 1.5,
                    filter: "blur(2px)",
                    duration: 0.4,
                    stagger: 0.02
                }, 0);
            }
            
            if (h3) {
                tl.from(h3.querySelectorAll(".anim-word"), {
                    yPercent: 100,
                    duration: 0.8,
                    stagger: 0.05
                }, 0.1);
            }
            
            tl.from([tags, percents], {
                opacity: 0,
                y: 15,
                duration: 0.6,
                stagger: 0.03,
                ease: "power2.out"
            }, 0.2);

            tl.fromTo(fills, 
                { scaleX: 0 },
                {
                    scaleX: 1,
                    duration: 1.2,
                    ease: "power3.out",
                    stagger: 0.08
                }, 0.3
            );
        });
    }

    // Contact Title Mask Reveal
    const contactTitle = document.querySelector(".contact-huge-title");
    if (contactTitle) {
        splitElementIntoWords(contactTitle);
        gsap.from(contactTitle.querySelectorAll(".anim-word"), {
            yPercent: 100,
            duration: 1.2,
            stagger: 0.06,
            ease: "power4.out",
            scrollTrigger: {
                trigger: contactTitle,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    }

    // Contact Info Links Fade-in
    const contactDetails = document.querySelectorAll(".contact-detail-link");
    if (contactDetails.length > 0) {
        gsap.from(contactDetails, {
            opacity: 0,
            x: -20,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".contact-info",
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        });
    }

    // Form Groups Staggered Reveal
    const formGroups = document.querySelectorAll(".form-group");
    if (formGroups.length > 0) {
        gsap.from(formGroups, {
            opacity: 0,
            y: 25,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".contact-form",
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    }

    // Footer Copyright and Social Links Fade-in
    const footerBottom = document.querySelector(".footer-bottom");
    if (footerBottom) {
        gsap.from(footerBottom.querySelectorAll(".copyright, .footer-link"), {
            opacity: 0,
            y: 15,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: footerBottom,
                start: "top 95%",
                toggleActions: "play none none reverse"
            }
        });
    }

    // Scroll trigger header anchors highlighting
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => {
        const id = section.getAttribute("id");
        const navAnchor = document.querySelector(`.nav-menu a[href="#${id}"]`);
        
        if (navAnchor) {
            ScrollTrigger.create({
                trigger: section,
                start: "top 50%",
                end: "bottom 50%",
                onEnter: () => navAnchor.classList.add("active"),
                onEnterBack: () => navAnchor.classList.add("active"),
                onLeave: () => navAnchor.classList.remove("active"),
                onLeaveBack: () => navAnchor.classList.remove("active")
            });
        }
    });

    // Logo & Scroll indicator button click scrolling
    const scrollDownBtn = document.getElementById("hero-scroll-btn");
    if (scrollDownBtn) {
        scrollDownBtn.addEventListener("click", () => {
            lenis.scrollTo("#about");
        });
    }

    const navLinks = document.querySelectorAll(".nav-link, .logo");
    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href");
            lenis.scrollTo(targetId);
        });
    });

    /* ==========================================================================
       PROJECT HOVER CAROUSEL
       ========================================================================== */
    const projectCards = document.querySelectorAll(".project-card");
    projectCards.forEach(card => {
        const carousel = card.querySelector(".project-hover-carousel");
        
        if (carousel) {
            // Move carousel to body to escape transform clipping
            document.body.appendChild(carousel);
            
            const carouselImages = carousel.querySelectorAll(".carousel-img");
            if (carouselImages.length > 0) {
                let currentIndex = 0;
                let intervalId = null;

                card.addEventListener("mouseenter", () => {
                    carousel.classList.add("show");
                    intervalId = setInterval(() => {
                        carouselImages[currentIndex].classList.remove("active");
                        currentIndex = (currentIndex + 1) % carouselImages.length;
                        carouselImages[currentIndex].classList.add("active");
                    }, 600); // Swipe every 0.6s
                });

                card.addEventListener("mousemove", (e) => {
                    // Slight offset so the cursor doesn't cover the popup
                    const offsetX = 20;
                    const offsetY = 20;
                    
                    carousel.style.left = `${e.clientX + offsetX}px`;
                    carousel.style.top = `${e.clientY + offsetY}px`;
                });

                card.addEventListener("mouseleave", () => {
                    carousel.classList.remove("show");
                    clearInterval(intervalId);
                    carouselImages[currentIndex].classList.remove("active");
                    currentIndex = 0;
                    carouselImages[currentIndex].classList.add("active");
                });
            }
        }
    });

});
