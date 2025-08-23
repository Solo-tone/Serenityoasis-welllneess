  // Initialize EmailJS (User will need to replace with their actual EmailJS public key)
(function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init("vB58ItxCV1pxVEX8_");
    }
})();

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Form validation and submission
const appointmentForm = document.getElementById('appointmentForm');
const contactForm = document.getElementById('contactForm');

// Set minimum date to today
const dateInput = document.getElementById('date');
if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
}

// Appointment form submission
if (appointmentForm) {
    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const appointmentData = {};
        
        formData.forEach((value, key) => {
            appointmentData[key] = value;
        });
        
        // Validate required fields
        const requiredFields = ['name', 'email', 'phone', 'service', 'date', 'time', 'payment'];
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!appointmentData[field]) {
                isValid = false;
                const input = document.getElementById(field);
                if (input) {
                    input.style.borderColor = '#ef4444';
                    setTimeout(() => {
                        input.style.borderColor = '#e5e7eb';
                    }, 3000);
                }
            }
        });
        
        // Validate payment tag for digital payments
        const digitalPayments = ['paypal', 'venmo', 'zelle', 'cashapp', 'crypto'];
        if (digitalPayments.includes(appointmentData.payment) && !appointmentData['payment-tag']) {
            isValid = false;
            const paymentTagInput = document.getElementById('payment-tag');
            if (paymentTagInput) {
                paymentTagInput.style.borderColor = '#ef4444';
                setTimeout(() => {
                    paymentTagInput.style.borderColor = '#e5e7eb';
                }, 3000);
            }
            showNotification('Payment tag/emailis required for digital payment methods.', 'error');
        }
        
        if (!isValid) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(appointmentData.email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // Validate phone format (basic validation)
        const phoneRegex = /^[\+]?[1-10][\d]{0,15}$/;
        if (!phoneRegex.test(appointmentData.phone.replace(/[\s\-\(\)]/g, ''))) {
            showNotification('Please enter a valid phone number.', 'error');
            return;
        }
        
        // Send booking email
        sendBookingEmail(appointmentData);
        
        // Send payment request if needed
        if (digitalPayments.includes(appointmentData.payment) && appointmentData['payment-tag']) {
            sendPaymentRequest(appointmentData);
        }
        
        // Show success notification
        showNotification('Booking request submitted! We will contact you within few minute to confirm your appointment.', 'success');
        
        // Reset form
        this.reset();
    });
}

// Contact form submission
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const contactData = {};
        
        formData.forEach((value, key) => {
            contactData[key] = value;
        });
        
        // Validate required fields
        const requiredFields = ['name', 'email', 'subject', 'message'];
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!contactData[field]) {
                isValid = false;
                const input = this.querySelector(`[name="${field}"]`);
                if (input) {
                    input.style.borderColor = '#ef4444';
                    setTimeout(() => {
                        input.style.borderColor = '#e5e7eb';
                    }, 3000);
                }
            }
        });
        
        if (!isValid) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactData.email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // Send contact email
        sendContactEmail(contactData);
        
        // Show success notification
        showNotification('Message sent successfully! We will get back to you soon.', 'success');
        
        // Reset form
        this.reset();
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                margin-left: auto;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('appear');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .therapist-card, .therapist-profile');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});

// Service selection auto-pricing
const serviceSelect = document.getElementById('service');
if (serviceSelect) {
    serviceSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
            // You could add logic here to update pricing display or other form elements
            console.log('Selected service:', selectedOption.text);
        }
    });
}

// Therapist specialization matching
const therapistSelect = document.getElementById('therapist');
if (therapistSelect && serviceSelect) {
    serviceSelect.addEventListener('change', function() {
        const service = this.value;
        const therapistOptions = therapistSelect.querySelectorAll('option');
        
        // Reset all therapist options
        therapistOptions.forEach(option => {
            option.style.display = 'block';
        });
        
        // Highlight recommended therapists based on service
        const recommendations = {
            'deep-tissue': ['U.S.A'],
            'sports': ['U.K'],
            'swedish': ['Canada'],
            'aromatherapy': ['europe'],
            'hot-stone': ['U.K'],
            'thai': ['U.S.A'],
            'body-rub': ['U.S.A']
			
        };
        
        if (recommendations[service]) {
            therapistOptions.forEach(option => {
                if (recommendations[service].includes(option.value)) {
                    option.textContent = option.textContent.includes('(Recommended)') 
                        ? option.textContent 
                        : option.textContent + ' (Recommended)';
                } else {
                    option.textContent = option.textContent.replace(' (Recommended)', '');
                }
            });
        }
    });
}

// Real-time form validation
function addRealTimeValidation(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '#10b981';
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.style.borderColor = '#e5e7eb';
            }
        });
    });
}

// Apply real-time validation to forms
addRealTimeValidation('appointmentForm');
addRealTimeValidation('contactForm');

// Loading states for form submissions
function setFormLoading(form, isLoading) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.dataset.originalText || 'Submit';
        }
    }
}

// Store original button text
document.addEventListener('DOMContentLoaded', () => {
    const submitButtons = document.querySelectorAll('button[type="submit"]');
    submitButtons.forEach(btn => {
        btn.dataset.originalText = btn.innerHTML;
    });
});

// Booking time slot availability (mock data)
const unavailableTimes = {
    '2024-12-15': ['10:00', '14:00'],
    '2024-12-16': ['09:00', '15:00', '16:00'],
    // Add more dates as needed
};

// Update time slots based on selected date
if (dateInput && document.getElementById('time')) {
    dateInput.addEventListener('change', function() {
        const selectedDate = this.value;
        const timeSelect = document.getElementById('time');
        const timeOptions = timeSelect.querySelectorAll('option');
        
        timeOptions.forEach(option => {
            if (option.value && unavailableTimes[selectedDate] && unavailableTimes[selectedDate].includes(option.value)) {
                option.disabled = true;
                option.textContent = option.textContent.replace(' (Unavailable)', '') + ' (Unavailable)';
            } else {
                option.disabled = false;
                option.textContent = option.textContent.replace(' (Unavailable)', '');
            }
        });
    });
}

// Email sending functions
function sendBookingEmail(appointmentData) {
    if (typeof emailjs === 'undefined') {
        console.log('EmailJS not loaded. Email data would be:', appointmentData);
        showNotification('Booking confirmed! Email service not configured - please contact us to confirm.', 'warning');
        return;
    }

    const bookingEmailTemplate = formatBookingEmail(appointmentData);
    const customerTemplate = formatCustomerConfirmation(appointmentData);

    // Template parameters for spa booking notification
    const internalTemplateParams = {
        to_email: 'Reservationformassagebooking@gmail.com',
        from_name: appointmentData.name,
        customer_name: appointmentData.name,
        customer_email: appointmentData.email,
        customer_phone: appointmentData.phone,
        service: appointmentData.service,
        therapist: appointmentData.therapist,
        date: appointmentData.date,
        time: appointmentData.time,
        payment_method: appointmentData.payment,
        message: bookingEmailTemplate.text
    };

    // Template parameters for customer confirmation
    const customerTemplateParams = {
        to_email: appointmentData.email,
        customer_name: appointmentData.name,
        service: appointmentData.service,
        therapist: appointmentData.therapist,
        date: appointmentData.date,
        time: appointmentData.time,
        payment_method: appointmentData.payment,
        message: customerTemplate.text
    };

    // Send emails using EmailJS (user needs to configure service and template IDs)
    Promise.all([
        emailjs.send('service_bh6z436', 'template_cl2zowp', internalTemplateParams),
        emailjs.send('service_bh6z436', 'template_cl2zowp', customerTemplateParams)
    ]).then(() => {
        showNotification('Booking confirmed! Confirmation emails sent successfully.', 'success');
    }).catch((error) => {
        console.error('Email error:', error);
        showNotification('Booking confirmed! Please contact us at to confirm.', 'warning');
    });
}

function sendContactEmail(contactData) {
    if (typeof emailjs === 'undefined') {
        console.log('EmailJS not loaded. Contact data would be:', contactData);
        showNotification('Message received! Email service not configured - we will respond soon.', 'warning');
        return;
    }

    const emailTemplate = formatContactEmail(contactData);
    
    const templateParams = {
        to_email: 'Reservationformassagebooking@gmail.com',
        from_name: contactData.name,
        from_email: contactData.email,
        customer_name: contactData.name,
        customer_email: contactData.email,
        subject: contactData.subject,
        message: contactData.message,
        formatted_message: emailTemplate.text
    };
    
    emailjs.send('service_bh6z436', 'template_74x15nm', templateParams)
        .then(() => {
            showNotification('Message sent successfully! We will respond within few minute.', 'success');
        })
        .catch((error) => {
            console.error('Contact email error:', error);
            showNotification('Message received! Please contact us directly at Reservationformassagebooking@gmail.com', 'warning');
        });
}

function sendPaymentRequest(appointmentData) {
    if (typeof emailjs === 'undefined') {
        console.log('EmailJS not loaded. Payment request data would be:', appointmentData);
        showNotification('Payment request will be processed manually.', 'info');
        return;
    }

    const paymentMethodNames = {
        'paypal': 'PayPal',
        'venmo': 'Venmo',
        'zelle': 'Zelle', 
        'cashapp': 'CashApp',
        'crypto': 'Cryptocurrency'
    };

    const serviceNames = {
        'swedish': 'Swedish Massage - $80',
        'deep-tissue': 'Deep Tissue Massage - $95',
        'hot-stone': 'Hot Stone Massage - $110',
        'aromatherapy': 'Aromatherapy Massage - $90',
        'thai': 'Thai Massage - $95',
        'nuru': 'Nuru Massage - $150',
		'body-rub':' Body Rub - $130',
		'meet & fuck':'Meet & FucK',
		'live sex':'LIVE SEX',
		'friend w/ benefit':'FRIEND W/BENEFIT',
		'local hookup':'LOCAL HOOKUP'
    };

    const servicePrices = {
        'swedish $80': 80,
        'deep-tissue': 95,
        'hot-stone': 110,
        'aromatherapy': 90,
        'thai': 85,
        'nuru': 100
    };

    const paymentRequestParams = {
        to_email: 'Reservationformassagebooking@gmail.com',
        customer_name: appointmentData.name,
        customer_email: appointmentData.email,
        service_name: serviceNames[appointmentData.service] || appointmentData.service,
        service_price: servicePrices[appointmentData.service] || '0',
        payment_method: paymentMethodNames[appointmentData.payment] || appointmentData.payment,
        payment_tag: appointmentData['payment-tag'],
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.time,
        therapist: appointmentData.therapist || 'No preference'
    };

    emailjs.send('service_bh6z436','template_cl2zowp', paymentRequestParams)
        .then(() => {
            console.log('Payment request sent successfully');
        })
        .catch((error) => {
            console.error('Payment request error:', error);
        });
}

function formatBookingEmail(data) {
    const serviceNames = {
        'swedish $80': 'Swedish Massage - $80',
        'deep-tissue': 'Deep Tissue Massage - $95',
        'hot-stone': 'Hot Stone Massage - $110',
        'aromatherapy': 'Aromatherapy Massage - $90',
        'thai': 'Thai Massage - $85',
        'nuru': 'nuru Massage - $100',
		'body-rub':' Body Rub - $100',
		'meet & fuck':'Meet & FucK',
		'live sex':'LIVE SEX',
		'friend w/ benefit':'FRIEND W/BENEFIT',
		'local hookup':'LOCAL HOOKUP'
    };
    
    const therapistNames = {
       'U.S.A': 'United States, LMT',
        'U.K': 'United Kingdom, LMT',
        'Canada': 'Canada, LMT',
        'europe': 'Europe, LMT'
    };
    
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const formattedTime = new Date(`2000-01-01T${data.time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    
    const textEmail = `

${data.notes || 'None'}


    `.trim();
    
    const htmlEmail = `
   
                    <tr><td style="padding: 5px 0; font-weight: bold;">Payment Method:</td><td style="padding: 5px 0;">${data.payment ? data.payment.charAt(0).toUpperCase() + data.payment.slice(1) : 'Not specified'}</td></tr>
                    ${data['payment-tag'] ? `<tr><td style="padding: 5px 0; font-weight: bold;">Payment Tag:</td><td style="padding: 5px 0;">${data['payment-tag']}</td></tr>` : ''}
                </table>
            </div>
            
            ${data.notes ? `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #92400e; margin: 0 0 15px 0;">📝 Special Requests/Notes</h3>
                <p style="margin: 0; white-space: pre-wrap;">${data.notes}</p>
            </div>
            ` : ''}
            
            <div style="background: #fce7f3; padding: 20px; border-radius: 8px;">
                <h3 style="color: #be185d; margin: 0 0 15px 0;">✅ Next Steps</h3>
                <ol style="margin: 0; padding-left: 20px;">
                    <li>Confirm therapist availability</li>
                    <li>Contact customer within 24 hours</li>
                    <li>Send payment instructions</li>
                    <li>Add to booking calendar</li>
                </ol>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280;">
                <p style="margin: 0;"><strong>Serenity Spa & Wellness</strong></p>
                <p style="margin: 5px 0;">123 Wellness Boulevard, Peaceful Valley, CA 90210</p>
                <p style="margin: 5px 0;">Phone: <a href="tel:5551237352">(555) 123-RELAX</a> | Email: <a href="mailto:bookings@serenityspa.com">bookings@serenityspa.com</a></p>
            </div>
        </div>
    </div>
    `;
    
    return { text: textEmail, html: htmlEmail };
}

function formatCustomerConfirmation(data) {
    const serviceNames = {
        'swedish': 'Swedish Massage - $80',
        'deep-tissue': 'Deep Tissue Massage - $95',
        'hot-stone': 'Hot Stone Massage - $110',
        'aromatherapy': 'Aromatherapy Massage - $90',
        'thai': 'Thai Massage - $85',
        'nuru': 'Nuru Massage - $100',
		'body-rub':' Body Rub - $100',
		'meet & fuck':'Meet & FucK',
		'live sex':'LIVE SEX',
		'friend w/ benefit':'FRIEND W/BENEFIT',
		'local hookup':'LOCAL HOOKUP'
    };
    
    const therapistNames = {
      'U.S.A': 'United States, LMT',
        'U.K': 'United Kingdom, LMT',
        'Canada': 'Canada, LMT',
        'europe': 'Europe, LMT'
    };
    
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const formattedTime = new Date(`2000-01-01T${data.time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    
    const textEmail = `
Dear ${data.name},

Thank you for your booking request at Serenity Spa & Wellness!

BOOKING SUMMARY:
- Service: ${serviceNames[data.service] || data.service}
- Preferred Therapist: ${therapistNames[data.therapist] || data.therapist || 'No preference'}
- Date: ${formattedDate}
- Time: ${formattedTime}

WHAT'S NEXT:
We will contact you within 24 hours to confirm your appointment and provide payment instructions.

PAYMENT OPTIONS:
We accept Cash, PayPal, Venmo, Zelle, CashApp, and Crypto payments.

CANCELLATION POLICY:
Please provide at least 24 hours notice for cancellations to avoid fees.

If you have any questions, please don't hesitate to contact us at (555) 123-RELAX or bookings@serenityspa.com.

We look forward to providing you with a relaxing and rejuvenating experience!

Best regards,
The Serenity Spa Team

---
Serenity Spa & Wellness
123 Wellness Boulevard, Peaceful Valley, CA 90210
Phone: (555) 123-RELAX | Email: bookings@serenityspa.com
    `.trim();
    
    const htmlEmail = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2c7a7b; margin: 0;">🍃 Serenity Spa & Wellness</h1>
                <h2 style="color: #1f2937; margin: 10px 0;">Booking Confirmation</h2>
            </div>
            
            <p style="font-size: 16px; color: #374151;">Dear ${data.name},</p>
            <p style="font-size: 16px; color: #374151;">Thank you for your booking request at Serenity Spa & Wellness!</p>
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #166534; margin: 0 0 15px 0;">📋 Booking Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; font-weight: bold;">Service:</td><td style="padding: 8px 0;">${serviceNames[data.service] || data.service}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Therapist:</td><td style="padding: 8px 0;">${therapistNames[data.therapist] || data.therapist || 'No preference'}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Date:</td><td style="padding: 8px 0;">${formattedDate}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Time:</td><td style="padding: 8px 0;">${formattedTime}</td></tr>
                </table>
            </div>
            
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0;">🔄 What's Next</h3>
                <p style="margin: 0; color: #374151;">We will contact you within 24 hours to confirm your appointment and provide payment instructions.</p>
            </div>
            
            <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #7c3aed; margin: 0 0 15px 0;">💳 Payment Options</h3>
                <p style="margin: 0; color: #374151;">We accept: Cash, PayPal, Venmo, Zelle, CashApp, and Crypto payments.</p>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #92400e; margin: 0 0 15px 0;">📅 Cancellation Policy</h3>
                <p style="margin: 0; color: #374151;">Please provide at least 24 hours notice for cancellations to avoid fees.</p>
            </div>
            
            <p style="font-size: 16px; color: #374151; margin: 20px 0;">If you have any questions, please don't hesitate to contact us at <a href="tel:5551237352">(555) 123-RELAX</a> or <a href="mailto:bookings@serenityspa.com">bookings@serenityspa.com</a>.</p>
            
            <p style="font-size: 16px; color: #374151; margin: 20px 0;"><strong>We look forward to providing you with a relaxing and rejuvenating experience!</strong></p>
            
            <p style="font-size: 16px; color: #374151;">Best regards,<br>The Serenity Spa Team</p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280;">
                <p style="margin: 0;"><strong>Serenity Spa & Wellness</strong></p>
                <p style="margin: 5px 0;">123 Wellness Boulevard, Peaceful Valley, CA 90210</p>
                <p style="margin: 5px 0;">Phone: <a href="tel:5551237352">(555) 123-RELAX</a> | Email: <a href="mailto:bookings@serenityspa.com">bookings@serenityspa.com</a></p>
            </div>
        </div>
    </div>
    `;
    
    return { text: textEmail, html: htmlEmail };
}

function formatContactEmail(data) {
    const textEmail = `
NEW CONTACT FORM SUBMISSION
===========================

FROM: ${data.name}
EMAIL: ${data.email}
SUBJECT: ${data.subject}

MESSAGE:
${data.message}

---
Respond to: ${data.email}
Serenity Spa & Wellness Contact Form
    `.trim();
    
    const htmlEmail = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2c7a7b; margin: 0;">🍃 Serenity Spa & Wellness</h1>
                <h2 style="color: #1f2937; margin: 10px 0;">Contact Form Submission</h2>
            </div>
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #166534; margin: 0 0 15px 0;">👤 Contact Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 5px 0; font-weight: bold;">Name:</td><td style="padding: 5px 0;">${data.name}</td></tr>
                    <tr><td style="padding: 5px 0; font-weight: bold;">Email:</td><td style="padding: 5px 0;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
                    <tr><td style="padding: 5px 0; font-weight: bold;">Subject:</td><td style="padding: 5px 0;">${data.subject}</td></tr>
                </table>
            </div>
            
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0;">💬 Message</h3>
                <p style="margin: 0; white-space: pre-wrap; color: #374151;">${data.message}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280;">
                <p style="margin: 0;">Respond to: <a href="mailto:${data.email}">${data.email}</a></p>
                <p style="margin: 5px 0;"><strong>Serenity Spa & Wellness</strong> Contact Form</p>
            </div>
        </div>
    </div>
    `;
    
    return { text: textEmail, html: htmlEmail };
}

console.log('Serenity Spa website loaded successfully!');