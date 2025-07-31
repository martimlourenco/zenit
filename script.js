// COPY EMAIL FUNCTIONALITY
function copyEmail(email) {
  navigator.clipboard.writeText(email).then(() => {
    // Visual feedback
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.background = 'var(--color-primary)';
    btn.style.color = 'white';
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.style.color = '';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy email: ', err);
    // Fallback for browsers that don't support clipboard API
    alert(`Email: ${email}`);
  });
}

// MOBILE MENU TOGGLE
document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS with public key
    console.log('EmailJS available:', typeof emailjs !== 'undefined');
    if (typeof emailjs !== 'undefined') {
        emailjs.init('ujpapLBfUibynr7RK');
        console.log('EmailJS initialized with public key');
    } else {
        console.error('EmailJS not loaded!');
    }

    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            console.log('Hamburger clicked!');
            hamburger.classList.toggle('active');
            
            // Toggle the mobile menu visibility
            if (navMenu.style.transform === 'translateX(0px)' || navMenu.classList.contains('show')) {
                navMenu.style.transform = 'translateX(-100%)';
                navMenu.classList.remove('show');
            } else {
                navMenu.style.transform = 'translateX(0px)';
                navMenu.classList.add('show');
            }
        });

        // CLOSE MENU WHEN CLICKING ON A LINK
        document.querySelectorAll('#nav-menu a').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.style.transform = 'translateX(-100%)';
                navMenu.classList.remove('show');
            });
        });

        // CLOSE MENU WHEN CLICKING OUTSIDE
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('show')) {
                hamburger.classList.remove('active');
                navMenu.style.transform = 'translateX(-100%)';
                navMenu.classList.remove('show');
            }
        });
    }

    // SMOOTH SCROLLING FOR NAVIGATION LINKS
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // NAVBAR BACKGROUND ON SCROLL
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // INTERSECTION OBSERVER FOR ANIMATIONS
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // OBSERVE FEATURE CARDS AND DOWNLOAD ELEMENTS
    document.querySelectorAll('.feature-card, .download-btn, .stat, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // ACTIVE NAVIGATION LINK HIGHLIGHTING
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // PREVENT HORIZONTAL SCROLL ON MOBILE
    function preventHorizontalScroll() {
        const body = document.body;
        const html = document.documentElement;
        const maxWidth = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
        
        if (maxWidth > window.innerWidth) {
            body.style.overflowX = 'hidden';
            html.style.overflowX = 'hidden';
        }
    }

    preventHorizontalScroll();
    window.addEventListener('resize', preventHorizontalScroll);

    // ENHANCED MOBILE EXPERIENCE
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // ADD TOUCH FEEDBACK TO CARDS
        document.querySelectorAll('.feature-card, .download-btn, .stat, .contact-item').forEach(card => {
            card.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            card.addEventListener('touchend', function() {
                this.style.transform = '';
            });
        });
    }

    // CONTACT FORM FUNCTIONALITY
    const contactForm = document.getElementById('contact-form');
    console.log('Contact form found:', contactForm);
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted!');
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            console.log('Form data:', { name, email, message });
            
            // BASIC VALIDATION
            if (!name || !email || !message) {
                alert('POR FAVOR, PREENCHE TODOS OS CAMPOS!');
                return;
            }
            
            // EMAIL VALIDATION
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('POR FAVOR, INTRODUZ UM EMAIL VÁLIDO!');
                return;
            }
            
            // SIMULATE FORM SUBMISSION
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            console.log('Submit button found:', submitBtn);
            
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'A ENVIAR...';
            submitBtn.disabled = true;
            
            // REAL EMAIL SENDING WITH EMAILJS
            // Service ID + Public Key initialized above
            console.log('Attempting to send email via EmailJS...');
            
            // Using correct Template ID with comprehensive data
            emailjs.send('service_yf5cne7', 'template_aldtlsa', {
                from_name: name,
                from_email: email,
                user_name: name,
                user_email: email,
                user_message: message,
                contact_time: new Date().toLocaleString('pt-PT'),
                message: `Nome: ${name}\nEmail: ${email}\nData/Hora: ${new Date().toLocaleString('pt-PT')}\n\nMensagem:\n${message}`,
                reply_to: email
            })
            .then((response) => {
                console.log('Email sent successfully!', response);
                alert('MENSAGEM ENVIADA COM SUCESSO!\nIREMOS RESPONDER EM BREVE.');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            })
            .catch((error) => {
                console.error('Email sending failed - Full error:', error);
                console.error('Error status:', error.status);
                console.error('Error text:', error.text);
                alert('ERRO AO ENVIAR MENSAGEM. TENTA NOVAMENTE.\nErro: ' + (error.text || error.message || 'Unknown error'));
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
            
            
            // SIMULATION DISABLED FOR TESTING
            /*
            setTimeout(() => {
                alert('MENSAGEM ENVIADA COM SUCESSO!\nIREMOS RESPONDER EM BREVE.');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
            */
        });
    }

    // EMAIL CLICK TO COPY
    document.querySelectorAll('.contact-item').forEach(item => {
        const emailText = item.querySelector('p');
        if (emailText && emailText.textContent.includes('@')) {
            item.style.cursor = 'pointer';
            item.addEventListener('click', function() {
                const email = emailText.textContent.trim();
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(email).then(() => {
                        // SHOW TOOLTIP OR FEEDBACK
                        const originalText = emailText.textContent;
                        emailText.textContent = 'EMAIL COPIADO!';
                        setTimeout(() => {
                            emailText.textContent = originalText;
                        }, 2000);
                    });
                }
            });
        }
    });

    console.log('ZENIT - WEBSITE LOADED SUCCESSFULLY');
});
