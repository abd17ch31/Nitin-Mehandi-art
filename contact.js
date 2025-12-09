// Contact/Location page interactions
document.addEventListener("DOMContentLoaded", () => {
  const mapWrapper = document.querySelector(".map-wrapper");
  const directionsBtn = document.querySelector(".directions-btn");

  // Add smooth scroll behavior if needed
  if (directionsBtn) {
    directionsBtn.addEventListener("click", function (e) {
      // Optional: Add click animation
      this.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.style.transform = "";
      }, 150);
    });
  }

  // Add intersection observer for animations
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

  const animatedElements = document.querySelectorAll(".map-wrapper, .info-card");
  animatedElements.forEach((el) => {
    observer.observe(el);
  });
});

