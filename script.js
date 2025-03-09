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