// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!hamburger.contains(event.target) && !navLinks.contains(event.target)) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // Handle emergency type selection
    const typeCards = document.querySelectorAll('.type-card');
    typeCards.forEach(card => {
        card.addEventListener('click', function() {
            typeCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Handle file upload preview
    const fileInput = document.getElementById('media-files');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const label = this.previousElementSibling;
            const fileCount = this.files.length;
            if (fileCount > 0) {
                label.querySelector('span').textContent = `${fileCount} file(s) selected`;
            } else {
                label.querySelector('span').textContent = 'Upload Photos/Videos';
            }
        });
    }

    // Handle location button
    const locationBtn = document.querySelector('.location-btn');
    if (locationBtn) {
        locationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        document.getElementById('manual-address').value = `Lat: ${lat}, Lng: ${lng}`;
                    },
                    error => {
                        console.error('Error getting location:', error);
                        alert('Unable to get your location. Please enter it manually.');
                    }
                );
            } else {
                alert('Geolocation is not supported by your browser. Please enter location manually.');
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });

    // Handle form submission
    const emergencyForm = document.querySelector('.emergency-report-form');
    if (emergencyForm) {
        emergencyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add your form submission logic here
            alert('Emergency report submitted successfully!');
        });
    }

    // Handle newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput.value) {
                alert('Thank you for subscribing to our newsletter!');
                emailInput.value = '';
            }
        });
    }

    // Responsive image loading
    function handleResponsiveImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            if (window.innerWidth <= 768) {
                img.src = img.getAttribute('data-src-mobile') || img.getAttribute('data-src');
            } else {
                img.src = img.getAttribute('data-src');
            }
        });
    }

    window.addEventListener('resize', handleResponsiveImages);
    handleResponsiveImages();
});

// Add touch device detection
function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}

// Add touch-specific classes if needed
if (isTouchDevice()) {
    document.body.classList.add('touch-device');
}

document.addEventListener('DOMContentLoaded', () => {
  // Statistics Counter Animation
  function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
      const target = parseFloat(stat.textContent);
      let current = 0;
      const increment = target / 50; // Divide animation into 50 steps
      const duration = 2000; // 2 seconds
      const stepTime = duration / 50;

      const counter = setInterval(() => {
        current += increment;
        if (current >= target) {
          stat.textContent = target + (stat.textContent.includes('%') ? '%' : '');
          clearInterval(counter);
        } else {
          stat.textContent = Math.round(current) + (stat.textContent.includes('%') ? '%' : '');
        }
      }, stepTime);
    });
  }

  // Intersection Observer for Statistics Animation
  const statsSection = document.querySelector('.emergency-stats');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStats();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
  }

  // Feature Cards Animation
  const features = document.querySelectorAll('.feature');
  features.forEach(feature => {
    feature.addEventListener('mouseenter', () => {
      feature.querySelector('.feature-icon').style.transform = 'scale(1.1) rotate(5deg)';
    });

    feature.addEventListener('mouseleave', () => {
      feature.querySelector('.feature-icon').style.transform = 'scale(1) rotate(0)';
    });
  });

  // Testimonials Slider
  let currentTestimonial = 0;
  const testimonials = document.querySelectorAll('.testimonial');
  const testimonialCount = testimonials.length;

  function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
      testimonial.style.display = i === index ? 'block' : 'none';
      testimonial.style.opacity = i === index ? '1' : '0';
    });
  }

  function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonialCount;
    showTestimonial(currentTestimonial);
  }

  // Initialize testimonials
  if (testimonials.length > 0) {
    showTestimonial(0);
    setInterval(nextTestimonial, 5000); // Change testimonial every 5 seconds
  }

  // FAQ Functionality
  const categoryButtons = document.querySelectorAll('.category-btn');
  const faqCategories = document.querySelectorAll('.faq-category');

  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Show selected category
      const selectedCategory = button.getAttribute('data-category');
      faqCategories.forEach(category => {
        if (category.id === selectedCategory) {
          category.style.display = 'block';
        } else {
          category.style.display = 'none';
        }
      });
    });
  });

  // FAQ accordion
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      // Toggle current item
      item.classList.toggle('active');
    });
  });

  // Timeline Animation
  const timelineItems = document.querySelectorAll('.timeline-item');
  let currentStep = 1;

  function activateStep(step) {
    timelineItems.forEach(item => {
      const itemStep = parseInt(item.getAttribute('data-step'));
      if (itemStep === step) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Auto-advance timeline every 3 seconds
  if (timelineItems.length > 0) {
    setInterval(() => {
      currentStep = currentStep >= timelineItems.length ? 1 : currentStep + 1;
      activateStep(currentStep);
    }, 3000);

    // Click handling for timeline items
    timelineItems.forEach(item => {
      item.addEventListener('click', () => {
        const step = parseInt(item.getAttribute('data-step'));
        currentStep = step;
        activateStep(step);
      });
    });
  }

  // Demo video button handling
  const demoBtn = document.querySelector('.demo-btn');
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      // Here you would typically launch a video modal
      alert('Demo video feature coming soon!');
    });
  }
});

// Live Chat Functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatToggle = document.getElementById('chatToggle');
    const chatContainer = document.getElementById('chatContainer');
    const minimizeChat = document.getElementById('minimizeChat');
    const closeChat = document.getElementById('closeChat');
    const chatInput = document.getElementById('chatInput');
    const sendMessage = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');
    const notificationBadge = document.querySelector('.notification-badge');

    // Toggle chat window
    chatToggle.addEventListener('click', () => {
        chatContainer.classList.toggle('active');
        notificationBadge.style.display = 'none';
    });

    // Minimize chat
    minimizeChat.addEventListener('click', () => {
        chatContainer.classList.remove('active');
    });

    // Close chat
    closeChat.addEventListener('click', () => {
        chatContainer.classList.remove('active');
    });

    // Send message function
    function sendUserMessage(message) {
        if (!message.trim()) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'message user';
        userMessage.innerHTML = `
            <p>${message}</p>
            <span class="message-time">${time}</span>
        `;
        chatMessages.appendChild(userMessage);

        // Clear input
        chatInput.value = '';

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simulate agent response after 1 second
        setTimeout(() => {
            const responses = [
                "I understand your concern. Let me help you with that.",
                "Thank you for reaching out. An emergency responder will be with you shortly.",
                "Your safety is our priority. Please stay on the line.",
                "I'm connecting you with the appropriate emergency service.",
                "Could you please provide more details about the situation?"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            const agentMessage = document.createElement('div');
            agentMessage.className = 'message agent';
            agentMessage.innerHTML = `
                <p>${randomResponse}</p>
                <span class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            `;
            chatMessages.appendChild(agentMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }

    // Send message on button click
    sendMessage.addEventListener('click', () => {
        sendUserMessage(chatInput.value);
    });

    // Send message on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendUserMessage(chatInput.value);
        }
    });

    // Handle file attachment
    const attachBtn = document.querySelector('.attach-btn');
    attachBtn.addEventListener('click', () => {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.click();

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const fileName = fileInput.files[0].name;
                sendUserMessage(`📎 Attached: ${fileName}`);
            }
        });
    });

    // Auto-response after 3 seconds of page load
    setTimeout(() => {
        if (!chatContainer.classList.contains('active')) {
            notificationBadge.style.display = 'flex';
        }
    }, 3000);
});

// Authentication Page Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Form switching
  const authSwitches = document.querySelectorAll('.auth-switch');
  const authForms = document.querySelectorAll('.auth-form');

  authSwitches.forEach(switch_ => {
    switch_.addEventListener('click', () => {
      const formType = switch_.dataset.form;
      
      // Update active switch
      authSwitches.forEach(s => s.classList.remove('active'));
      switch_.classList.add('active');
      
      // Show corresponding form
      authForms.forEach(form => {
        if (form.id === `${formType}Form`) {
          form.classList.add('active');
        } else {
          form.classList.remove('active');
        }
      });
    });
  });

  // Password visibility toggle
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');
  
  togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
      const input = this.parentElement.querySelector('input');
      const icon = this.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });

  // Form validation and submission
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');

  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm-password').value;
      
      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      
      // Here you would typically send the data to your backend
      const formData = {
        fullName: document.getElementById('signup-fullname').value,
        email: document.getElementById('signup-email').value,
        phone: document.getElementById('signup-phone').value,
        password: password
      };
      
      console.log('Signup form data:', formData);
      // Add your API call here
      alert('Account created successfully!');
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Here you would typically send the data to your backend
      const formData = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value,
        rememberMe: this.querySelector('input[type="checkbox"]').checked
      };
      
      console.log('Login form data:', formData);
      // Add your API call here
      alert('Logged in successfully!');
    });
  }

  // Social authentication
  const socialAuthButtons = document.querySelectorAll('.social-auth-btn');
  
  socialAuthButtons.forEach(button => {
    button.addEventListener('click', function() {
      const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
      // Here you would implement the social authentication logic
      console.log(`Authenticating with ${provider}...`);
    });
  });
});

// Handle sign-up button clicks
document.addEventListener('DOMContentLoaded', function() {
  const signupButtons = document.querySelectorAll('.signup-btn');
  signupButtons.forEach(button => {
    button.addEventListener('click', () => {
      window.location.href = 'auth.html';
    });
  });
}); 