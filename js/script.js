document.addEventListener('DOMContentLoaded', () => {
    // --- Global Elements & Navigation ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Set active class for current page in navigation
    const currentPath = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('active');
        } else if (currentPath === '' && item.getAttribute('href') === 'index.html') {
             // Handle root path / for index.html
            item.classList.add('active');
        }
    });

    // --- Home Page Specific (index.html) ---
    // Testimonial Carousel
    const testimonials = document.querySelectorAll('.testimonial-item');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    let currentTestimonial = 0;
    let testimonialInterval;

    function showTestimonial(index) {
        testimonials.forEach((item, i) => {
            item.classList.remove('active');
            dots[i].classList.remove('active');
        });
        if (testimonials[index]) { // Check if element exists
            testimonials[index].classList.add('active');
            dots[index].classList.add('active');
        }
    }

    function nextTestimonial() {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }

    function startCarousel() {
        if (testimonials.length > 1) { // Only start if more than one testimonial
            testimonialInterval = setInterval(nextTestimonial, 5000); // Change every 5 seconds
        }
    }

    function stopCarousel() {
        clearInterval(testimonialInterval);
    }

    if (testimonials.length > 0) {
        showTestimonial(0);
        startCarousel();

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                stopCarousel();
                showTestimonial(index);
                currentTestimonial = index;
                startCarousel();
            });
        });

        const testimonialSection = document.querySelector('.testimonials-section');
        if (testimonialSection) {
            testimonialSection.addEventListener('mouseenter', stopCarousel);
            testimonialSection.addEventListener('mouseleave', startCarousel);
        }
    }

    // --- Eco-store Filters (redeem.html) ---
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const productSearch = document.getElementById('productSearch');
    const productGrid = document.querySelector('.product-grid');

    if (categoryFilter && priceFilter && productSearch && productGrid) {
        const productCards = Array.from(productGrid.querySelectorAll('.product-card'));

        function filterAndSortProducts() {
            let filteredProducts = productCards;

            const selectedCategory = categoryFilter.value;
            if (selectedCategory !== 'all') {
                filteredProducts = filteredProducts.filter(card => 
                    card.dataset.category === selectedCategory
                );
            }

            const searchTerm = productSearch.value.toLowerCase().trim();
            if (searchTerm) {
                filteredProducts = filteredProducts.filter(card => 
                    card.querySelector('h3').textContent.toLowerCase().includes(searchTerm) ||
                    card.querySelector('.description').textContent.toLowerCase().includes(searchTerm)
                );
            }

            const sortOrder = priceFilter.value;
            if (sortOrder !== 'default') {
                filteredProducts.sort((a, b) => {
                    const priceA = parseInt(a.dataset.price);
                    const priceB = parseInt(b.dataset.price);
                    return sortOrder === 'low-to-high' ? priceA - priceB : priceB - priceA;
                });
            }

            productGrid.innerHTML = '';
            if (filteredProducts.length > 0) {
                filteredProducts.forEach(card => productGrid.appendChild(card));
            } else {
                productGrid.innerHTML = '<p class="no-results">No products found matching your criteria.</p>';
            }
        }

        categoryFilter.addEventListener('change', filterAndSortProducts);
        priceFilter.addEventListener('change', filterAndSortProducts);
        productSearch.addEventListener('keyup', filterAndSortProducts);
        filterAndSortProducts(); // Initial filter/sort
    }

    // Redeem button alert (example)
    const redeemButtons = document.querySelectorAll('.product-card .btn-small');
    redeemButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productName = event.target.closest('.product-card').querySelector('h3').textContent;
            const credits = event.target.closest('.product-card').querySelector('.credits').textContent;
            alert(`You clicked to redeem "${productName}" for ${credits}. (This would open a modal for confirmation)`);
        });
    });


    // --- Form Submissions (sell.html & contact.html) ---
    const pickupForm = document.querySelector('.pickup-form');
    if (pickupForm) {
        pickupForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // Basic form validation (can be expanded)
            const requiredFields = ['materialType', 'approxWeight', 'pickupDate', 'pickupTime', 'address', 'city', 'pincode'];
            let allFieldsFilled = true;
            requiredFields.forEach(id => {
                const input = document.getElementById(id);
                if (input && !input.value) {
                    allFieldsFilled = false;
                    input.style.borderColor = 'red'; // Simple visual feedback
                } else if (input) {
                    input.style.borderColor = ''; // Reset border
                }
            });

            if (!allFieldsFilled) {
                alert('Please fill in all required fields.');
                return;
            }

            console.log('Pickup Details Submitted:', {
                materialType: document.getElementById('materialType').value,
                approxWeight: document.getElementById('approxWeight').value,
                pickupDate: document.getElementById('pickupDate').value,
                pickupTime: document.getElementById('pickupTime').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                pincode: document.getElementById('pincode').value,
                notes: document.getElementById('notes').value
            });

            alert('Pickup request submitted successfully! We will contact you shortly.');
            pickupForm.reset();
        });
    }

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            if (!name || !email || !subject || !message) {
                alert('Please fill in all required fields.');
                return;
            }

            console.log('Contact Form Submitted:', { name, email, subject, message });
            alert('Your message has been sent successfully! We will get back to you soon.');
            contactForm.reset();
        });
    }


    // --- Animated Stats (impact.html) ---
    const statNumbers = document.querySelectorAll('.stat-number');

    const animateNumber = (obj, start, end, duration) => {
        let startTime = null;
        const step = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            obj.textContent = Math.floor(progress * (end - start) + start).toLocaleString('en-IN'); // Indian locale for commas
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    // Intersection Observer to trigger animations when elements are in view
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.3 // Trigger when 30% of item is visible
    };

    const generalObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate'); // Add a class to trigger CSS animation
                // For stat numbers, start the counting animation
                if (entry.target.classList.contains('stat-card')) {
                    const numberElement = entry.target.querySelector('.stat-number');
                    if (numberElement && !numberElement.classList.contains('animated')) {
                        const targetNumber = parseInt(numberElement.dataset.target);
                        animateNumber(numberElement, 0, targetNumber, 2000); // 2 seconds duration
                        numberElement.classList.add('animated'); // Mark as animated to prevent re-triggering
                    }
                }
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);

    // Apply observer to all elements that should animate on scroll
    document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right, .stat-card, .feature-item, .info-card, .mission-item, .team-member').forEach(el => {
        generalObserver.observe(el);
    });

});
