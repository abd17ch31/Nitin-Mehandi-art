// Services page interactions
document.addEventListener("DOMContentLoaded", () => {
  const bookButtons = document.querySelectorAll(".book-btn");
  const serviceCards = document.querySelectorAll(".service-card");

  // Add click handlers for book buttons
  bookButtons.forEach((btn, index) => {
    btn.addEventListener("click", function (e) {
      const card = this.closest(".service-card");
      const serviceName = card.dataset.service || "service";
      
      // Check if it's an anchor tag with href
      const isLink = this.tagName === "A" && this.hasAttribute("href");
      
      // Add ripple effect
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        animation: ripple 0.6s ease-out;
        z-index: 2;
      `;
      
      this.style.position = "relative";
      this.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
      
      // If it's a link, allow navigation (don't prevent default)
      if (isLink) {
        // Link will navigate naturally
        console.log(`Navigating to ${this.getAttribute("href")} for ${serviceName} service`);
        return; // Allow default link behavior
      }
      
      // Only prevent default for non-link buttons
      e.preventDefault();
      
      // Here you can add your booking logic for non-link buttons
      console.log(`Booking ${serviceName} service`);
      
      // Optional: Show a temporary feedback
      const originalText = this.textContent;
      this.textContent = "Booking...";
      this.style.opacity = "0.7";
      
      setTimeout(() => {
        this.textContent = originalText;
        this.style.opacity = "1";
      }, 1000);
    });
  });

  // Add intersection observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  serviceCards.forEach((card) => {
    observer.observe(card);
  });
});

// Add ripple animation CSS dynamically
const style = document.createElement("style");
style.textContent = `
  @keyframes ripple {
    from {
      transform: scale(0);
      opacity: 1;
    }
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

