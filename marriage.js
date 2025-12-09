// Marriage form validation and submission
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("marriageForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const btnLoader = submitBtn.querySelector(".btn-loader");
  
  // Set minimum date to today
  const functionDateInput = document.getElementById("functionDate");
  const today = new Date().toISOString().split("T")[0];
  functionDateInput.setAttribute("min", today);

  // Ensure service type is always "Marriage"
  const serviceTypeInput = document.getElementById("serviceType");
  serviceTypeInput.value = "Marriage";

  // Mobile number input - only allow digits
  const mobileInput = document.getElementById("mobile");
  mobileInput.addEventListener("input", function (e) {
    this.value = this.value.replace(/[^0-9]/g, "");
    validateField(this);
  });

  // Real-time validation on blur
  const inputs = form.querySelectorAll("input[required], textarea");
  inputs.forEach((input) => {
    if (input.id !== "serviceType") {
      input.addEventListener("blur", () => validateField(input));
      input.addEventListener("input", () => {
        if (input.classList.contains("error")) {
          validateField(input);
        }
      });
    }
  });

  function validateField(field) {
    const errorElement = document.getElementById(`${field.id}Error`);
    let isValid = true;
    let errorMessage = "";

    field.classList.remove("error");

    if (field.hasAttribute("required") && !field.value.trim()) {
      isValid = false;
      errorMessage = "This field is required";
    } else {
      switch (field.id) {
        case "name":
          if (field.value.trim().length < 2) {
            isValid = false;
            errorMessage = "Name must be at least 2 characters";
          }
          break;

        case "mobile":
          if (field.value.length !== 10) {
            isValid = false;
            errorMessage = "Mobile number must be 10 digits";
          }
          break;

        case "functionDate":
          const selectedDate = new Date(field.value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            isValid = false;
            errorMessage = "Marriage date cannot be in the past";
          }
          break;

        case "city":
        case "state":
          if (field.value.trim().length < 2) {
            isValid = false;
            errorMessage = "Please enter a valid " + field.id;
          }
          break;
      }
    }

    if (isValid) {
      errorElement.textContent = "";
      errorElement.classList.remove("show");
      field.classList.remove("error");
    } else {
      errorElement.textContent = errorMessage;
      errorElement.classList.add("show");
      field.classList.add("error");
    }

    return isValid;
  }

  function validateForm() {
    let isFormValid = true;
    inputs.forEach((input) => {
      if (input.id !== "serviceType" && !validateField(input)) {
        isFormValid = false;
      }
    });
    return isFormValid;
  }

  // Form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = form.querySelector(".error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        firstError.focus();
      }
      return;
    }

    submitBtn.disabled = true;
    btnText.style.display = "none";
    btnLoader.style.display = "flex";

    const formData = {
      serviceType: "Marriage",
      name: document.getElementById("name").value.trim(),
      city: document.getElementById("city").value.trim(),
      state: document.getElementById("state").value.trim(),
      functionDate: document.getElementById("functionDate").value,
      mobile: document.getElementById("mobile").value,
      specialRequest: document.getElementById("specialRequest").value.trim(),
      submittedAt: new Date().toISOString(),
    };

    try {
      // Save booking to localStorage for admin panel
      if (typeof saveBookingToAdmin === 'function') {
        saveBookingToAdmin(formData);
      } else {
        const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
        formData.id = Date.now();
        bookings.push(formData);
        localStorage.setItem("bookings", JSON.stringify(bookings));
      }
      
      await new Promise((resolve) => setTimeout(resolve, 1000));

      window.location.href = 'thank-you.html';
      
      form.reset();
      serviceTypeInput.value = "Marriage";
      
      submitBtn.disabled = false;
      btnText.style.display = "flex";
      btnLoader.style.display = "none";

      console.log("Marriage booking submitted:", formData);
      
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your booking. Please try again.");
      
      submitBtn.disabled = false;
      btnText.style.display = "flex";
      btnLoader.style.display = "none";
    }
  });

  function showSuccessMessage() {
    const existingMessage = form.querySelector(".success-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    const modal = document.createElement("div");
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem";
    const content = document.createElement("div");
    content.style.cssText = "background:#fff;color:#111;border-radius:12px;max-width:420px;width:100%;padding:1.25rem;box-shadow:0 10px 30px rgba(0,0,0,.2);text-align:center";
    const text = document.createElement("p");
    text.textContent = "We have submitted your request and will call you back soon.";
    const btn = document.createElement("button");
    btn.textContent = "OK";
    btn.style.cssText = "margin-top:1rem;padding:.6rem 1.2rem;border:none;border-radius:8px;background:#4caf50;color:#fff;cursor:pointer;font-weight:600";
    btn.addEventListener("click", () => { document.body.removeChild(modal); });
    modal.addEventListener("click", (e) => { if (e.target === modal) document.body.removeChild(modal); });
    content.appendChild(text);
    content.appendChild(btn);
    modal.appendChild(content);
    document.body.appendChild(modal);

    const successMsg = document.createElement("div");
    successMsg.className = "success-message show";
    successMsg.textContent = "We have submitted your request and will call you back soon.";
    form.appendChild(successMsg);

    successMsg.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(() => {
      successMsg.classList.remove("show");
      setTimeout(() => successMsg.remove(), 400);
    }, 5000);
  }

  const formGroups = form.querySelectorAll(".form-group");
  formGroups.forEach((group) => {
    const input = group.querySelector("input, textarea");
    if (input && input.id !== "serviceType") {
      input.addEventListener("focus", function () {
        group.classList.add("focused");
      });
      input.addEventListener("blur", function () {
        group.classList.remove("focused");
      });
    }
  });
});
