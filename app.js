// Saare 6 providers ka data aur unke respective reviews
const providersData = {
  1: {
    name: "Ali Khan",
    category: "Electrician",
    rating: "4.9",
    exp: "6+ Years Exp.",
    location: "Karachi, Pakistan",
    price: "Rs. 1,500",
    img: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80",
    desc: "Expert in home wiring, appliance installation & breaker repairs.",
    badges: ["Home Wiring", "Appliance Installation", "Breaker Repairs"],
    review: {
      name: "Ayesha Malik",
      time: "2 days ago",
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      text: "Extremely professional and punctual. Fixed our house wiring issue very cleanly in no time. Highly recommended!"
    }
  },
  2: {
    name: "Usman Ahmed",
    category: "Plumber",
    rating: "4.8",
    exp: "5+ Years Exp.",
    location: "Karachi, Pakistan",
    price: "Rs. 1,200",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    desc: "Pipeline leakages, sanitary fittings, and water tank cleaning.",
    badges: ["Pipeline Leakages", "Sanitary Fittings", "Water Tank Cleaning"],
    review: {
      name: "Zainab Khan",
      time: "1 week ago",
      img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
      text: "Great plumber! Fixed the kitchen leakage efficiently and charged a very reasonable price."
    }
  },
  3: {
    name: "Tariq Mahmood",
    category: "Carpenter",
    rating: "4.7",
    exp: "8+ Years Exp.",
    location: "Karachi, Pakistan",
    price: "Rs. 2,000",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    desc: "Custom furniture repair, door fixing, and lock installation.",
    badges: ["Furniture Repair", "Door Fixing", "Lock Installation"],
    review: {
      name: "Bilal Ahmed",
      time: "3 days ago",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
      text: "Very skilled carpenter. Fixed our wooden main door lock smoothly. Excellent work."
    }
  },
  4: {
    name: "Bilal Raza",
    category: "AC Technician",
    rating: "4.9",
    exp: "7+ Years Exp.",
    location: "Karachi, Pakistan",
    price: "Rs. 2,500",
    img: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
    desc: "AC servicing, gas refilling, and inverter board repair.",
    badges: ["AC Servicing", "Gas Refilling", "Inverter Repair"],
    review: {
      name: "Farhan Ali",
      time: "Yesterday",
      img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
      text: "AC cooling was very low, he refilled the gas and serviced it properly. Now it works like brand new."
    }
  },
  5: {
    name: "Hamza Sheikh",
    category: "Painter",
    rating: "4.6",
    exp: "4+ Years Exp.",
    location: "Karachi, Pakistan",
    price: "Rs. 3,000",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    desc: "Interior & exterior wall painting, damp treatment & polishing.",
    badges: ["Wall Painting", "Damp Treatment", "Polishing"],
    review: {
      name: "Sobia Rehman",
      time: "5 days ago",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
      text: "Did a fantastic job with our living room accent wall. Clean and neat work!"
    }
  },
  6: {
    name: "Shahid Iqbal",
    category: "Cleaner",
    rating: "4.8",
    exp: "5+ Years Exp.",
    location: "Karachi, Pakistan",
    price: "Rs. 1,800",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    desc: "Deep home cleaning, sofa wash, and carpet vacuuming services.",
    badges: ["Deep Cleaning", "Sofa Wash", "Carpet Vacuuming"],
    review: {
      name: "Sadia Noor",
      time: "4 days ago",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      text: "Very thorough cleaning service. The sofas look spotless after the wash."
    }
  }
};

// Render Function
function renderProviderDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const providerId = urlParams.get("id") || "1";

  const data = providersData[providerId] || providersData[1];

  if (data) {
    // Basic Details
    document.getElementById("p-img").src = data.img;
    document.getElementById("p-name").textContent = data.name;
    document.getElementById("p-category").textContent = data.category;
    document.getElementById("p-rating").textContent = data.rating;
    document.getElementById("p-exp").textContent = data.exp;
    document.getElementById("p-location").textContent = data.location;
    document.getElementById("p-price").textContent = data.price;
    document.getElementById("p-desc").textContent = data.desc;

    // Review Section Dynamic Inject
    const reviewImg = document.getElementById("review-img");
    const reviewName = document.getElementById("review-name");
    const reviewTime = document.getElementById("review-time");
    const reviewText = document.getElementById("review-text");

    if (reviewImg) reviewImg.src = data.review.img;
    if (reviewName) reviewName.textContent = data.review.name;
    if (reviewTime) reviewTime.textContent = data.review.time;
    if (reviewText) reviewText.textContent = `"${data.review.text}"`;

    // Badges Dynamic Render
    const badgesContainer = document.getElementById("p-badges");
    if (badgesContainer) {
      badgesContainer.innerHTML = data.badges
        .map(badge => `<span class="badge bg-slate text-warning border border-warning border-opacity-50 px-3 py-2 rounded-pill fs-7">${badge}</span>`)
        .join("");
    }
  }
}

// Run on load
document.addEventListener("DOMContentLoaded", renderProviderDetails);