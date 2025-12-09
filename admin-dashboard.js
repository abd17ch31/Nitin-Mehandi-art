// Admin Dashboard
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
  if (!isLoggedIn || isLoggedIn !== "true") {
    window.location.href = "admin.html";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const filterService = document.getElementById("filterService");
  const searchInput = document.getElementById("searchInput");
  const bookingsTableBody = document.getElementById("bookingsTableBody");
  const bookingModal = document.getElementById("bookingModal");
  const closeModal = document.getElementById("closeModal");

  // Logout functionality
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminUsername");
    window.location.href = "admin.html";
  });

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("BookingsDB", 2);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("bookings")) {
          const store = db.createObjectStore("bookings", { keyPath: "id" });
          store.createIndex("submittedAt", "submittedAt", { unique: false });
          store.createIndex("serviceType", "serviceType", { unique: false });
        }
        if (!db.objectStoreNames.contains("photos")) {
          const photoStore = db.createObjectStore("photos", { keyPath: "id" });
          photoStore.createIndex("category", "category", { unique: false });
          photoStore.createIndex("createdAt", "createdAt", { unique: false });
          photoStore.createIndex("title", "title", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function fetchBookings() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("bookings", "readwrite");
      const store = tx.objectStore("bookings");
      const req = store.getAll();
      req.onsuccess = () => {
        const now = Date.now();
        const retentionMs = 30 * 24 * 60 * 60 * 1000;
        const all = (req.result || []);
        // Ensure every booking has an id
        all.forEach((b, i) => {
          if (b.id == null) {
            b.id = Date.now() + i;
            store.put(b);
          }
        });
        // Prune >30 days and sort
        const keep = all.filter((b) => {
          const submitted = new Date(b.submittedAt).getTime();
          return !Number.isNaN(submitted) && (now - submitted) <= retentionMs;
        });
        all.forEach((b) => {
          const submitted = new Date(b.submittedAt).getTime();
          if (Number.isNaN(submitted) || (now - submitted) > retentionMs) {
            if (b && b.id != null) store.delete(b.id);
          }
        });
        keep.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        resolve(keep);
      };
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  }

  async function deleteBooking(bookingId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("bookings", "readwrite");
      const store = tx.objectStore("bookings");
      const listReq = store.getAll();
      listReq.onsuccess = () => {
        const list = listReq.result || [];
        const match = list.find(b => String(b.id) === String(bookingId));
        if (match) {
          store.delete(match.id);
        }
      };
      listReq.onerror = () => reject(listReq.error);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    }).then(() => displayBookings());
  }

  // Display bookings in table
  async function displayBookings(bookings = null) {
    const allBookings = bookings || await fetchBookings();
    const serviceFilter = filterService.value;
    const searchTerm = searchInput.value.toLowerCase().trim();

    // Filter bookings
    let filteredBookings = allBookings;
    
    if (serviceFilter !== "all") {
      filteredBookings = filteredBookings.filter(b => b.serviceType === serviceFilter);
    }

    if (searchTerm) {
      filteredBookings = filteredBookings.filter(b => 
        b.name.toLowerCase().includes(searchTerm) ||
        b.mobile.includes(searchTerm)
      );
    }

    // Update statistics
    updateStatistics(allBookings);

    // Clear table
    bookingsTableBody.innerHTML = "";

    if (filteredBookings.length === 0) {
      bookingsTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="no-data">No bookings found matching your criteria.</td>
        </tr>
      `;
      return;
    }

    filteredBookings.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Display bookings
    filteredBookings.forEach((booking, index) => {
      const row = document.createElement("tr");
      const submittedDate = new Date(booking.submittedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const functionDate = new Date(booking.functionDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      row.innerHTML = `
        <td>${submittedDate}</td>
        <td><span class="service-badge">${booking.serviceType || "General Booking"}</span></td>
        <td>${booking.name}</td>
        <td><a href="tel:${booking.mobile}">${booking.mobile}</a></td>
        <td>${booking.city}</td>
        <td>${booking.state}</td>
        <td>${functionDate}</td>
        <td>
          <button class="action-btn view-btn" data-index="${index}" data-id="${booking.id}">View</button>
          <button class="action-btn delete-btn" data-index="${index}" data-id="${booking.id}">Delete</button>
        </td>
      `;
      bookingsTableBody.appendChild(row);
    });

    // Add event listeners
    document.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const bookingId = e.target.dataset.id;
        const booking = filteredBookings.find(b => String(b.id) === String(bookingId));
        if (booking) {
          showBookingDetails(booking);
        }
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const bookingId = e.target.dataset.id;
        const rowEl = e.target.closest("tr");
        if (confirm("Are you sure you want to delete this booking?")) {
          if (rowEl) {
            rowEl.remove();
          }
          await deleteBooking(bookingId);
        }
      });
    });
  }

  // Update statistics
  function updateStatistics(bookings) {
    document.getElementById("totalBookings").textContent = bookings.length;
    document.getElementById("bridalBookings").textContent = 
      bookings.filter(b => b.serviceType === "Bridal").length;
    document.getElementById("festivalBookings").textContent = 
      bookings.filter(b => b.serviceType === "Festival").length;
    document.getElementById("marriageBookings").textContent = 
      bookings.filter(b => b.serviceType === "Marriage").length;
  }

  // Show booking details in modal
  function showBookingDetails(booking) {
    const modalBody = document.getElementById("modalBody");
    const functionDate = new Date(booking.functionDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const submittedDate = new Date(booking.submittedAt).toLocaleString('en-IN');

    modalBody.innerHTML = `
      <div class="detail-item">
        <label>Service Type</label>
        <p>${booking.serviceType || "General Booking"}</p>
      </div>
      <div class="detail-item">
        <label>Name</label>
        <p>${booking.name}</p>
      </div>
      <div class="detail-item">
        <label>Mobile Number</label>
        <p><a href="tel:${booking.mobile}">${booking.mobile}</a></p>
      </div>
      <div class="detail-item">
        <label>City</label>
        <p>${booking.city}</p>
      </div>
      <div class="detail-item">
        <label>State</label>
        <p>${booking.state}</p>
      </div>
      <div class="detail-item">
        <label>Function Date</label>
        <p>${functionDate}</p>
      </div>
      ${booking.specialRequest ? `
      <div class="detail-item">
        <label>Special Request</label>
        <p>${booking.specialRequest}</p>
      </div>
      ` : ''}
      <div class="detail-item">
        <label>Submitted On</label>
        <p>${submittedDate}</p>
      </div>
    `;

    bookingModal.classList.add("show");
  }

  

  // Close modal
  closeModal.addEventListener("click", () => {
    bookingModal.classList.remove("show");
  });

  bookingModal.addEventListener("click", (e) => {
    if (e.target === bookingModal) {
      bookingModal.classList.remove("show");
    }
  });

  // Filter and search
  filterService.addEventListener("change", () => displayBookings());
  searchInput.addEventListener("input", () => displayBookings());
  refreshBtn.addEventListener("click", () => {
    searchInput.value = "";
    filterService.value = "all";
    displayBookings();
  });

  // Initial load
  displayBookings();

  // Listen for custom event when forms add bookings
  window.addEventListener("bookings-updated", () => {
    displayBookings();
  });
});

// Function to save booking (can be called from form submission scripts)
function saveBookingToAdmin(bookingData) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("BookingsDB", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("bookings")) {
        const store = db.createObjectStore("bookings", { keyPath: "id" });
        store.createIndex("submittedAt", "submittedAt", { unique: false });
        store.createIndex("serviceType", "serviceType", { unique: false });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("bookings", "readwrite");
      const store = tx.objectStore("bookings");
      bookingData.id = bookingData.id || Date.now();
      store.add(bookingData);
      tx.oncomplete = () => {
        db.close();
        window.dispatchEvent(new Event("bookings-updated"));
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    };
    request.onerror = () => reject(request.error);
  });
}




