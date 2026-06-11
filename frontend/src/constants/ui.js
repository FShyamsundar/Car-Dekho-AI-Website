export const navLinks = [
  { label: "Home", to: "/" },
  { label: "Explore", to: "/explore" },
  { label: "Quiz", to: "/quiz" },
  { label: "Compare", to: "/compare" },
  { label: "Shortlist", to: "/shortlist" },
];

export const bodyTypeOptions = [
  "All",
  "Hatchback",
  "Compact SUV",
  "Micro SUV",
  "Coupe SUV",
  "Mid-size SUV",
  "SUV",
  "Sedan",
  "MPV",
  "EV",
];

export const fuelTypeOptions = ["All", "Petrol", "Diesel", "Hybrid", "Electric"];

export const transmissionOptions = ["All", "Manual", "Automatic"];

export const seatingOptions = ["All", "5", "6", "7"];

export const sortOptions = [
  { label: "Best recommendation", value: "recommendation_desc" },
  { label: "Price low to high", value: "price_asc" },
  { label: "Price high to low", value: "price_desc" },
  { label: "Best mileage", value: "mileage_desc" },
  { label: "Best safety", value: "safety_desc" },
  { label: "Best review score", value: "review_desc" },
  { label: "Newest", value: "newest_desc" },
];

export const quizSteps = [
  {
    key: "budget",
    title: "Budget range",
    description: "This keeps the shortlist realistic from the start.",
    type: "range",
    options: [
      { label: "Under Rs. 10 lakh", value: { maxPrice: 1000000 } },
      { label: "Rs. 10 to 15 lakh", value: { minPrice: 1000000, maxPrice: 1500000 } },
      { label: "Rs. 15 to 20 lakh", value: { minPrice: 1500000, maxPrice: 2000000 } },
      { label: "Rs. 20 lakh and above", value: { minPrice: 2000000 } },
    ],
  },
  {
    key: "usage",
    title: "How will you use it?",
    description: "Pick the usage pattern that matters most in your life.",
    type: "single",
    options: [
      { label: "Mostly city", value: "city" },
      { label: "Mostly highway", value: "highway" },
      { label: "Mixed use", value: "mixed" },
      { label: "Family trips", value: "family" },
    ],
  },
  {
    key: "fuel",
    title: "Fuel preference",
    description: "Choose the fuel type you are most comfortable living with.",
    type: "single",
    options: [
      { label: "Petrol", value: "Petrol" },
      { label: "Diesel", value: "Diesel" },
      { label: "Hybrid", value: "Hybrid" },
      { label: "Electric", value: "Electric" },
      { label: "No preference", value: "Any" },
    ],
  },
  {
    key: "transmission",
    title: "Transmission preference",
    description: "Manual, automatic, or either works.",
    type: "single",
    options: [
      { label: "Manual", value: "Manual" },
      { label: "Automatic", value: "Automatic" },
      { label: "Any", value: "Any" },
    ],
  },
  {
    key: "seating",
    title: "Seating need",
    description: "This helps us surface the right cabin size.",
    type: "single",
    options: [
      { label: "5 seater", value: "5" },
      { label: "6 seater", value: "6" },
      { label: "7 seater", value: "7" },
      { label: "No preference", value: "Any" },
    ],
  },
  {
    key: "priorities",
    title: "What matters most?",
    description: "Pick one or more priority signals to shape the ranking.",
    type: "multi",
    options: [
      { label: "Safety", value: "safety" },
      { label: "Mileage", value: "mileage" },
      { label: "Space", value: "space" },
      { label: "Technology", value: "tech" },
      { label: "Performance", value: "performance" },
      { label: "Value", value: "value" },
    ],
  },
];
