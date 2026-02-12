// ========================================
// Mobile Menu Toggle
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

    // Toggle mobile menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            const icon = this.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when clicking a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileNav.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
});

// ========================================
// Smooth Scrolling for Navigation Links
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 64; // Height of fixed header
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// Header Background on Scroll
// ========================================
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.8)';
        header.style.boxShadow = 'none';
    }
});

// ========================================
// Animate Skills Bars on Scroll
// ========================================
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const skillsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const skillBars = entry.target.querySelectorAll('.skill-progress');
            skillBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
            skillsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

const skillsSection = document.getElementById('skills');
if (skillsSection) {
    skillsObserver.observe(skillsSection);
}

// ========================================
// Fade In Elements on Scroll
// ========================================
const fadeObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            fadeObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe all cards and major sections
const observeElements = [
    '.project-card',
    '.experience-card',
    '.org-card',
    '.gallery-item',
    '.skill-category'
];

observeElements.forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
        fadeObserver.observe(element);
    });
});

// ========================================
// Contact Form Handling
// ========================================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        // Form will be submitted to Formspree, but we can add additional handling here
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Re-enable button after submission (Formspree will handle the redirect)
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 3000);
    });
}

// ========================================
// Active Navigation Link on Scroll
// ========================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');

function setActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', setActiveNav);

// ========================================
// Gallery Lightbox Modal
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item a');
    const galleryModal = document.querySelector('.gallery .modal');
    const galleryModalImg = galleryModal ? galleryModal.querySelector('img') : null;

    galleryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const href = this.getAttribute('href');

            // Check if it's an image
            if (!href.match(/\.(jpg|gif|png|mp4)$/i)) {
                return;
            }

            // Prevent if modal is locked
            if (galleryModal._locked) {
                return;
            }

            // Lock modal
            galleryModal._locked = true;

            // Set image source
            galleryModalImg.src = href;
            galleryModalImg.alt = this.querySelector('img').alt;

            // Show modal
            galleryModal.classList.add('visible');

            // Focus modal
            galleryModal.focus();

            // Unlock after delay
            setTimeout(() => {
                galleryModal._locked = false;
            }, 600);
        });
    });

    // Modal click to close
    if (galleryModal) {
        galleryModal.addEventListener('click', function(e) {
            // Prevent if modal is locked
            if (this._locked) {
                return;
            }

            // Already hidden? Bail
            if (!this.classList.contains('visible')) {
                return;
            }

            // Lock modal
            this._locked = true;

            // Remove loaded and visible classes
            this.classList.remove('loaded');
            this.classList.remove('visible');

            // Delay for animation
            setTimeout(() => {
                // Clear image source
                galleryModalImg.src = '';
                galleryModalImg.alt = '';

                // Unlock
                this._locked = false;

                // Focus back to body
                document.body.focus();
            }, 475);
        });

        // ESC key to close modal
        galleryModal.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.click();
            }
        });
    }

    // Image load handler
    if (galleryModalImg) {
        galleryModalImg.addEventListener('load', function() {
            const modal = this.closest('.modal');

            setTimeout(() => {
                // No longer visible? Bail
                if (!modal.classList.contains('visible')) {
                    return;
                }

                // Add loaded class
                modal.classList.add('loaded');
            }, 275);
        });
    }
});

// ========================================
// Scroll to Top Button (Optional)
// ========================================
function createScrollToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.className = 'scroll-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        border: none;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        z-index: 999;
    `;

    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    document.body.appendChild(button);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            button.style.display = 'flex';
        } else {
            button.style.display = 'none';
        }
    });

    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
}

// Initialize scroll to top button
createScrollToTopButton();

// ========================================
// Console Easter Egg
// ========================================
console.log('%c👋 Hello there!', 'font-size: 20px; font-weight: bold; color: #2563eb;');
console.log('%cThanks for checking out my portfolio!', 'font-size: 14px; color: #6b7280;');
console.log('%cFeel free to reach out: nathanwongshihhao@gmail.com', 'font-size: 14px; color: #2563eb;');

// ========================================
// Loading Animation (Optional)
// ========================================
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Trigger animations for elements in viewport on load
    const elementsInView = document.querySelectorAll('.hero-content, .hero-image');
    elementsInView.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Set initial styles for load animation
document.querySelectorAll('.hero-content, .hero-image').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});
