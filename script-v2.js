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
    const interactiveElements = document.querySelectorAll("a, button, input, textarea, .btn, .compact-experience-item, .project-card, .strength-tag");
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

    gsap.from("#hero-current-work", {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: "power3.out",
        delay: 0.75
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
       GSAP ANIMATIONS: COMPACT EXPERIENCE LIST
       ========================================================================== */
    const experienceItems = document.querySelectorAll(".compact-experience-item");
    if (experienceItems.length > 0) {
        experienceItems.forEach(item => {
            const date = item.querySelector(".experience-date");
            const role = item.querySelector(".experience-role");
            const company = item.querySelector(".experience-company");

            if (role) splitElementIntoWords(role);
            if (company) splitElementIntoWords(company);

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });

            tl.from(item, {
                opacity: 0,
                x: -30,
                duration: 0.8,
                ease: "power3.out"
            });

            if (date) {
                tl.from(date, {
                    opacity: 0,
                    x: -15,
                    duration: 0.4
                }, 0.2);
            }

            if (role) {
                tl.from(role.querySelectorAll(".anim-word"), {
                    yPercent: 100,
                    duration: 0.5,
                    stagger: 0.05
                }, 0.2);
            }

            if (company) {
                tl.from(company.querySelectorAll(".anim-word"), {
                    yPercent: 100,
                    duration: 0.5,
                    stagger: 0.05
                }, 0.3);
            }
        });
    }

    /* ==========================================================================
       GSAP ANIMATIONS: PROJECTS STACKED CARDS
       ========================================================================== */
    const projectsTrack = document.getElementById("projects-track");

    if (projectsTrack) {
        const slides = document.querySelectorAll(".project-slide");

        slides.forEach((slide, i) => {
            const card = slide.querySelector(".project-card");
            if (!card) return;

            const num = card.querySelector(".project-num");
            const name = card.querySelector(".project-name");
            const tags = card.querySelector(".project-tags");
            const features = card.querySelectorAll(".project-features li");

            if (name) splitElementIntoWords(name);

            gsap.from(card, {
                opacity: 0.2,
                y: 150,
                scale: 0.85,
                duration: 1,
                scrollTrigger: {
                    trigger: slide,
                    start: "top 95%",
                    end: "top 30%",
                    scrub: true
                }
            });

            // Text animations within project card (trigger when card enters view)
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: slide,
                    start: "top 60%",
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

    // Technical Skills Section has been removed, so no animations are needed here.

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

    // GSAP-powered Loop Reviews Carousel (No user interaction allowed)
    const reviewsContainer = document.querySelector(".reviews-carousel-container");

    if (reviewsContainer) {
        const originalCards = Array.from(reviewsContainer.querySelectorAll(".review-card"));
        const N = originalCards.length;

        if (N > 0) {
            const track = document.createElement("div");
            track.classList.add("reviews-track");

            // Clear container and append track
            reviewsContainer.innerHTML = "";
            reviewsContainer.appendChild(track);

            // Build loop elements
            // 1. Prepend clone of last item
            const lastClone = originalCards[N - 1].cloneNode(true);
            track.appendChild(lastClone);

            // 2. Append original items
            const cardsInTrack = [lastClone];
            originalCards.forEach((card) => {
                const newCard = card.cloneNode(true);
                track.appendChild(newCard);
                cardsInTrack.push(newCard);
            });

            // 3. Append clone of first 2 items (to ensure seamless wrapping)
            const numClones = Math.min(2, N);
            for (let i = 0; i < numClones; i++) {
                const clone = originalCards[i].cloneNode(true);
                track.appendChild(clone);
                cardsInTrack.push(clone);
            }

            const cards = cardsInTrack;
            let currentIndex = 1; // start at the first original card
            let autoplayInterval;

            function centerCard(index, animate = true) {
                const card = cards[index];
                if (!card) return;

                const containerWidth = reviewsContainer.offsetWidth;
                const cardWidth = card.offsetWidth;
                const cardOffsetLeft = card.offsetLeft;

                // Calculate translation needed to center the card
                const targetX = (containerWidth / 2) - (cardOffsetLeft + cardWidth / 2);

                // Update active class
                cards.forEach((c, idx) => {
                    if (idx === index) {
                        c.classList.add("active-card");
                    } else {
                        c.classList.remove("active-card");
                    }
                });

                if (animate) {
                    gsap.to(track, {
                        x: targetX,
                        duration: 0.64,
                        ease: "power2.inOut",
                        onComplete: () => {
                            // Jump seamlessly from clone at index N+1 to original at index 1
                            if (index === N + 1) {
                                currentIndex = 1;
                                centerCard(1, false);
                            }
                        }
                    });
                } else {
                    gsap.set(track, { x: targetX });
                }
            }

            function playNext() {
                currentIndex++;
                centerCard(currentIndex, true);
            }

            // Initial placement
            setTimeout(() => {
                centerCard(1, false);
                // Start auto play
                autoplayInterval = setInterval(playNext, 4000);
            }, 100);

            // Handle Resize
            window.addEventListener("resize", () => {
                centerCard(currentIndex, false);
            });
        }
    }

    // Scroll reveal wrapper for the reviews section
    if (reviewsContainer) {
        gsap.from([reviewsContainer, ".reviews-bullets"], {
            opacity: 0,
            y: 40,
            duration: 1.2,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#reviews",
                start: "top 75%",
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

    const navLinks = document.querySelectorAll(".nav-link, .logo, #btn-header-cta");
    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href");
            lenis.scrollTo(targetId);
        });
    });


    /* ==========================================================================
       PROJECT EMBEDDED CAROUSEL
       ========================================================================== */
    const projectCards = document.querySelectorAll(".project-card");
    projectCards.forEach(card => {
        const track = card.querySelector(".carousel-track");

        if (track) {
            const carouselImages = track.querySelectorAll(".carousel-img");
            if (carouselImages.length > 1) {
                let currentIndex = 0;
                let startX = 0;
                let isDragging = false;
                let slideWidth = track.clientWidth;

                // Update slide width on window resize
                window.addEventListener('resize', () => {
                    slideWidth = track.clientWidth;
                    setSliderPosition();
                });

                // Prevent dragging images
                carouselImages.forEach(img => {
                    img.style.userSelect = "none";
                    img.addEventListener('dragstart', (e) => e.preventDefault());
                });

                // Start Autoplay
                let autoplayInterval;
                function startAutoplay() {
                    stopAutoplay();
                    autoplayInterval = setInterval(() => {
                        currentIndex = (currentIndex + 1) % carouselImages.length;
                        setPositionByIndex();
                    }, 3500);
                }

                function stopAutoplay() {
                    if (autoplayInterval) {
                        clearInterval(autoplayInterval);
                    }
                }

                // Touch events
                track.addEventListener('touchstart', touchStart, { passive: true });
                track.addEventListener('touchend', touchEnd);
                track.addEventListener('touchmove', touchMove, { passive: true });

                // Mouse events
                track.addEventListener('mousedown', dragStart);
                track.addEventListener('mouseup', dragEnd);
                track.addEventListener('mousemove', dragMove);
                track.addEventListener('mouseleave', dragEnd);

                function dragStart(event) {
                    isDragging = true;
                    startX = event.clientX;
                    stopAutoplay();
                    track.style.transition = 'none'; // disable CSS transition during dragging for immediate feedback
                }

                function dragMove(event) {
                    if (!isDragging) return;
                    const currentX = event.clientX;
                    const diffX = currentX - startX;

                    // Allow dragging past limits but with a resistance/friction factor
                    let currentPosition = -currentIndex * slideWidth + diffX;

                    // Friction at edges
                    if (currentIndex === 0 && diffX > 0) {
                        currentPosition = diffX * 0.3;
                    } else if (currentIndex === carouselImages.length - 1 && diffX < 0) {
                        currentPosition = -currentIndex * slideWidth + diffX * 0.3;
                    }

                    track.style.transform = `translateX(${currentPosition}px)`;
                }

                function dragEnd(event) {
                    if (!isDragging) return;
                    isDragging = false;

                    const endX = event.clientX || startX;
                    const diffX = endX - startX;

                    // transition back (increased speed)
                    track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';

                    // Threshold to swipe: 20% of track width
                    const threshold = slideWidth * 0.2;

                    if (diffX < -threshold && currentIndex < carouselImages.length - 1) {
                        currentIndex++;
                    } else if (diffX > threshold && currentIndex > 0) {
                        currentIndex--;
                    }

                    setPositionByIndex();
                    startAutoplay();
                }

                // Touch handling wrappers for clientX compatibility
                function touchStart(event) {
                    isDragging = true;
                    startX = event.touches[0].clientX;
                    stopAutoplay();
                    track.style.transition = 'none';
                    slideWidth = track.clientWidth;
                }

                function touchMove(event) {
                    if (!isDragging) return;
                    const currentX = event.touches[0].clientX;
                    const diffX = currentX - startX;

                    let currentPosition = -currentIndex * slideWidth + diffX;

                    if (currentIndex === 0 && diffX > 0) {
                        currentPosition = diffX * 0.3;
                    } else if (currentIndex === carouselImages.length - 1 && diffX < 0) {
                        currentPosition = -currentIndex * slideWidth + diffX * 0.3;
                    }

                    track.style.transform = `translateX(${currentPosition}px)`;
                }

                function touchEnd(event) {
                    if (!isDragging) return;
                    isDragging = false;

                    const endX = event.changedTouches[0].clientX;
                    const diffX = endX - startX;

                    track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
                    const threshold = slideWidth * 0.2;

                    if (diffX < -threshold && currentIndex < carouselImages.length - 1) {
                        currentIndex++;
                    } else if (diffX > threshold && currentIndex > 0) {
                        currentIndex--;
                    }

                    setPositionByIndex();
                    startAutoplay();
                }

                function setPositionByIndex() {
                    track.style.transform = `translateX(-${currentIndex * 100}%)`;
                }

                function setSliderPosition() {
                    track.style.transform = `translateX(-${currentIndex * 100}%)`;
                }

                // Initial start
                startAutoplay();
            }
        }
    });

    /* ==========================================================================
       RESUME MODAL HANDLERS
       ========================================================================== */
    const resumeBtn = document.getElementById("btn-download-resume");
    const resumeModal = document.getElementById("resume-modal");
    const closeResumeBtn = document.getElementById("btn-close-resume");
    const modalBackdrop = document.getElementById("resume-modal-backdrop");

    if (resumeBtn && resumeModal) {
        const modalContent = resumeModal.querySelector(".resume-modal-content");

        const openResume = (e) => {
            if (e) e.preventDefault();
            resumeModal.classList.add("active");

            // Pause page scrolling
            if (typeof lenis !== "undefined" && lenis) {
                lenis.stop();
            }

            // GSAP Entrance animation
            if (modalContent) {
                gsap.fromTo(modalContent,
                    { scale: 0.9, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.45, ease: "power4.out", clearProps: "transform" }
                );
            }
        };

        const closeResume = () => {
            // GSAP Exit animation
            if (modalContent) {
                gsap.to(modalContent, {
                    scale: 0.9,
                    opacity: 0,
                    duration: 0.3,
                    ease: "power3.in",
                    onComplete: () => {
                        resumeModal.classList.remove("active");
                        // Return page scrolling
                        if (typeof lenis !== "undefined" && lenis) {
                            lenis.start();
                        }
                    }
                });
            } else {
                resumeModal.classList.remove("active");
                if (typeof lenis !== "undefined" && lenis) {
                    lenis.start();
                }
            }
        };

        resumeBtn.addEventListener("click", openResume);
        if (closeResumeBtn) closeResumeBtn.addEventListener("click", closeResume);
        if (modalBackdrop) modalBackdrop.addEventListener("click", closeResume);

        // Escape key to close modal
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && resumeModal.classList.contains("active")) {
                closeResume();
            }
        });
    }

    /* ==========================================================================
       TOAST NOTIFICATION SYSTEM
       ========================================================================== */
    function showNotification(title, message, type = "success") {
        let container = document.getElementById("toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            container.className = "toast-container";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        let iconEmoji = "✓";
        if (type === "error") {
            iconEmoji = "✕";
        }

        toast.innerHTML = `
            <div class="toast-indicator"></div>
            <div class="toast-icon">${iconEmoji}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;

        container.appendChild(toast);

        // Force reflow
        toast.offsetHeight;
        toast.classList.add("show");

        // Close button handler
        const closeBtn = toast.querySelector(".toast-close");
        const dismissToast = () => {
            toast.classList.remove("show");
            setTimeout(() => {
                toast.remove();
            }, 600);
        };

        if (closeBtn) {
            closeBtn.addEventListener("click", dismissToast);
        }

        // Auto dismiss after 5 seconds
        const autoDismissTimeout = setTimeout(dismissToast, 5000);

        toast.addEventListener("mouseenter", () => clearTimeout(autoDismissTimeout));
    }

    /* ==========================================================================
       FIREBASE FORM SUBMISSION
       ========================================================================== */
    const firebaseConfig = {
        apiKey: "AIzaSyAIkkF0FGH3OuxqwYjl-o98EMwKz-T7EwI",
        authDomain: "protfolio-83962.firebaseapp.com",
        projectId: "protfolio-83962",
        storageBucket: "protfolio-83962.firebasestorage.app",
        messagingSenderId: "281358441641",
        appId: "1:281358441641:web:18fb3351e67a02825b9db8",
        measurementId: "G-NKWRP7PW2S"
    };

    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();

        const contactForm = document.getElementById("contact-form");
        if (contactForm) {
            contactForm.addEventListener("submit", (e) => {
                e.preventDefault();

                const nameInput = document.getElementById("form-name");
                const emailInput = document.getElementById("form-email");
                const messageInput = document.getElementById("form-message");
                const submitBtn = document.getElementById("btn-submit-message");

                if (!nameInput || !emailInput || !messageInput) return;

                const name = nameInput.value.trim();
                const email = emailInput.value.trim();
                const message = messageInput.value.trim();

                if (!name || !email || !message) {
                    showNotification("Error", "Please fill in all required fields.", "error");
                    return;
                }

                // Visual loading state
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = "0.7";
                    const btnTextNode = submitBtn.childNodes[0];
                    if (btnTextNode) btnTextNode.textContent = "Sending message... ";
                }

                db.collection("messages").add({
                    name: name,
                    email: email,
                    message: message,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
                    .then(() => {
                        showNotification("Success", "Your message has been sent successfully!", "success");
                        contactForm.reset();
                    })
                    .catch((error) => {
                        console.error("Firestore submission error: ", error);
                        showNotification("Failure", "Could not submit. Ensure Firestore database is created in Firebase Console.", "error");
                    })
                    .finally(() => {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.style.opacity = "";
                            const btnTextNode = submitBtn.childNodes[0];
                            if (btnTextNode) btnTextNode.textContent = "Send Message ";
                        }
                    });
            });
        }
    } else {
        console.warn("Firebase SDK is not loaded. Form will use default submission.");
    }

});
