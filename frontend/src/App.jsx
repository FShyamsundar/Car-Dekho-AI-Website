import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import heroArt from "./assets/hero.png";
import { featurePillars, popularBrands, workflowSteps } from "./data/cars.js";
import { useCars, CarsProvider } from "./context/CarsContext.jsx";
import "./App.css";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Explore", to: "/explore" },
  { label: "Quiz", to: "/quiz" },
  { label: "Compare", to: "/compare" },
  { label: "Shortlist", to: "/shortlist" },
];

const bodyTypeOptions = [
  "All",
  "Hatchback",
  "Compact SUV",
  "Mid-size SUV",
  "Sedan",
  "MPV",
  "SUV",
  "EV",
];

const fuelTypeOptions = ["All", "Petrol", "Diesel", "Hybrid", "Electric"];
const transmissionOptions = ["All", "Manual", "Automatic"];
const seatingOptions = ["All", "5", "7"];
const sortOptions = [
  { label: "Best recommendation", value: "recommendation_desc" },
  { label: "Price low to high", value: "price_asc" },
  { label: "Price high to low", value: "price_desc" },
  { label: "Best mileage", value: "mileage_desc" },
  { label: "Best safety", value: "safety_desc" },
  { label: "Best review score", value: "review_desc" },
];

const PAGE_SIZE = 6;

const quizSteps = [
  {
    key: "budget",
    title: "Budget range",
    subtitle: "Pick the lane that keeps your shortlist realistic.",
    options: [
      { label: "Under 10 lakh", value: { max: 1000000 } },
      { label: "10 to 15 lakh", value: { min: 1000000, max: 1500000 } },
      { label: "15 to 20 lakh", value: { min: 1500000, max: 2000000 } },
      { label: "20 lakh and above", value: { min: 2000000 } },
    ],
  },
  {
    key: "usage",
    title: "How will you use it?",
    subtitle: "This helps us balance comfort, efficiency, and space.",
    options: [
      { label: "Mostly city", value: "city" },
      { label: "Mostly highway", value: "highway" },
      { label: "Mixed usage", value: "mixed" },
      { label: "Family trips", value: "family" },
    ],
  },
  {
    key: "fuel",
    title: "Fuel preference",
    subtitle: "Choose a fuel type that fits your driving pattern.",
    options: [
      { label: "Petrol", value: "Petrol" },
      { label: "Diesel", value: "Diesel" },
      { label: "Hybrid", value: "Hybrid" },
      { label: "Electric", value: "Electric" },
    ],
  },
  {
    key: "seating",
    title: "Seating need",
    subtitle: "This narrows the list down to the right cabin size.",
    options: [
      { label: "5 seater", value: "5" },
      { label: "7 seater", value: "7" },
      { label: "No preference", value: "any" },
    ],
  },
  {
    key: "priority",
    title: "Top priority",
    subtitle: "The final ranking leans into what matters most to you.",
    options: [
      { label: "Safety", value: "safety" },
      { label: "Mileage", value: "mileage" },
      { label: "Comfort", value: "comfort" },
      { label: "Performance", value: "performance" },
    ],
  },
];

const comparisonRows = [
  {
    label: "Price",
    highlight: "min",
    format: (car) => formatPrice(car.priceExShowroom),
  },
  {
    label: "Mileage",
    highlight: "max",
    format: (car) => formatMileage(car),
  },
  {
    label: "Engine",
    format: (car) => formatEngine(car),
  },
  {
    label: "Power",
    highlight: "max",
    format: (car) => `${car.powerBhp.toFixed(0)} bhp`,
  },
  {
    label: "Torque",
    highlight: "max",
    format: (car) => `${car.torqueNm.toFixed(0)} Nm`,
  },
  {
    label: "Fuel",
    format: (car) => car.fuelType,
  },
  {
    label: "Transmission",
    format: (car) => car.transmission,
  },
  {
    label: "Safety",
    highlight: "max",
    format: (car) => `${car.safetyRating.toFixed(1)} / 5`,
  },
  {
    label: "Review score",
    highlight: "max",
    format: (car) => `${car.reviewScore.toFixed(1)} / 5`,
  },
  {
    label: "Airbags",
    highlight: "max",
    format: (car) => `${car.airbags}`,
  },
  {
    label: "ADAS",
    highlight: "max",
    format: (car) => `Level ${car.adasLevel}`,
  },
  {
    label: "Ground clearance",
    highlight: "max",
    format: (car) => `${car.groundClearanceMm} mm`,
  },
  {
    label: "Boot space",
    highlight: "max",
    format: (car) => `${car.bootSpaceLitres} L`,
  },
  {
    label: "Reliability",
    highlight: "max",
    format: (car) => `${car.reliabilityRating.toFixed(1)} / 5`,
  },
  {
    label: "Resale",
    highlight: "max",
    format: (car) => `${car.resaleRating.toFixed(1)} / 5`,
  },
  {
    label: "Service cost",
    highlight: "max",
    format: (car) => `${car.serviceCostRating.toFixed(1)} / 5`,
  },
  {
    label: "Recommendation",
    highlight: "max",
    format: (car) => `${car.recommendationScore}`,
  },
];

const SelectionContext = createContext(null);

function useLocalStorageState(key, fallback) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") {
      return fallback;
    }

    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage failures and keep the UI usable.
    }
  }, [key, value]);

  return [value, setValue];
}

function SelectionProvider({ children }) {
  const { cars } = useCars();
  const [shortlistIds, setShortlistIds] = useLocalStorageState(
    "drivewise-shortlist",
    [],
  );
  const [compareIds, setCompareIds] = useLocalStorageState(
    "drivewise-compare",
    [],
  );

  const toggleShortlist = useCallback((carId) => {
    setShortlistIds((current) =>
      current.includes(carId)
        ? current.filter((id) => id !== carId)
        : [...current, carId],
    );
  }, []);

  const toggleCompare = useCallback((carId) => {
    setCompareIds((current) => {
      if (current.includes(carId)) {
        return current.filter((id) => id !== carId);
      }

      const next = [...current, carId];
      return next.slice(Math.max(0, next.length - 3));
    });
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);

  const shortlist = useMemo(
    () => cars.filter((car) => shortlistIds.includes(car.id)),
    [shortlistIds, cars],
  );

  const compare = useMemo(
    () => cars.filter((car) => compareIds.includes(car.id)),
    [compareIds, cars],
  );

  const value = useMemo(
    () => ({
      shortlistIds,
      compareIds,
      shortlist,
      compare,
      toggleShortlist,
      toggleCompare,
      clearCompare,
    }),
    [
      shortlistIds,
      compareIds,
      shortlist,
      compare,
      toggleShortlist,
      toggleCompare,
      clearCompare,
    ],
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

function useSelections() {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error("useSelections must be used inside SelectionProvider");
  }

  return context;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatPrice(value) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} crore`;
  }

  return `₹${(value / 100000).toFixed(2)} lakh`;
}

function formatMileage(car) {
  return car.fuelType === "Electric"
    ? `${car.mileage} km range`
    : `${car.mileage} km/l`;
}

function formatEngine(car) {
  return car.engineCC === 0
    ? "Battery EV"
    : `${(car.engineCC / 1000).toFixed(1)}L`;
}

function buildSearchableText(car) {
  return [
    car.make,
    car.model,
    car.variant,
    car.bodyType,
    car.fuelType,
    car.transmission,
    car.features.join(" "),
    car.pros.join(" "),
    car.cons.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function parseNumericParam(params, key) {
  const value = params.get(key);

  if (value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getBestIndex(values, highlight) {
  if (!highlight || values.length === 0) {
    return -1;
  }

  if (highlight === "min") {
    return values.indexOf(Math.min(...values));
  }

  return values.indexOf(Math.max(...values));
}

function scoreQuizCar(car, answers) {
  let score = car.recommendationScore;

  if (answers.budget) {
    const { min, max } = answers.budget;

    if (typeof min === "number" && car.priceExShowroom < min) {
      score -= 4;
    }

    if (typeof max === "number" && car.priceExShowroom > max) {
      const overshoot = (car.priceExShowroom - max) / 100000;
      score -= clamp(overshoot * 2, 2, 16);
    } else if (typeof max === "number") {
      score += 8;
    }
  }

  if (answers.usage === "city" && car.cityDriving) {
    score += 6;
  }

  if (answers.usage === "highway" && car.highwayDriving) {
    score += 7;
  }

  if (answers.usage === "mixed" && car.cityDriving && car.highwayDriving) {
    score += 7;
  }

  if (answers.usage === "family" && car.familyFriendly) {
    score += 8;
  }

  if (answers.fuel && car.fuelType === answers.fuel) {
    score += 8;
  }

  if (answers.seating === "7" && car.seatingCapacity >= 7) {
    score += 10;
  }

  if (answers.seating === "5" && car.seatingCapacity <= 5) {
    score += 4;
  }

  if (answers.priority === "safety") {
    score += car.safetyRating * 3;
  } else if (answers.priority === "mileage") {
    score += car.fuelType === "Electric" ? 12 : car.mileage / 3;
  } else if (answers.priority === "comfort") {
    score += car.bootSpaceLitres / 120;
  } else if (answers.priority === "performance") {
    score += car.powerBhp / 20;
  }

  return Math.round(clamp(score, 0, 100));
}

function explainRecommendation(car, answers) {
  const reasons = [];

  if (answers.budget?.max && car.priceExShowroom <= answers.budget.max) {
    reasons.push("fits your budget");
  }

  if (answers.usage === "family" && car.familyFriendly) {
    reasons.push("works for family trips");
  }

  if (answers.usage === "city" && car.cityDriving) {
    reasons.push("feels easy in the city");
  }

  if (answers.usage === "highway" && car.highwayDriving) {
    reasons.push("stays composed on highways");
  }

  if (answers.fuel && car.fuelType === answers.fuel) {
    reasons.push(`${car.fuelType.toLowerCase()} match`);
  }

  if (answers.seating === "7" && car.seatingCapacity >= 7) {
    reasons.push("offers seven-seat flexibility");
  }

  if (answers.priority === "safety" && car.safetyRating >= 4) {
    reasons.push("brings strong safety credentials");
  }

  if (answers.priority === "mileage" && car.mileage >= 18) {
    reasons.push("keeps running costs calmer");
  }

  if (reasons.length === 0) {
    reasons.push("matches the overall ownership profile");
  }

  return reasons.slice(0, 3);
}

function App() {
  return (
    <BrowserRouter>
      <CarsProvider>
        <SelectionProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/car/:id" element={<CarDetailsPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/shortlist" element={<ShortlistPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </SelectionProvider>
      </CarsProvider>
    </BrowserRouter>
  );
}

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { shortlistIds, compareIds } = useSelections();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container nav-inner">
          <Link to="/" className="brand" aria-label="DriveWise home">
            <span className="brand__mark">DW</span>
            <span className="brand__copy">
              <strong>DriveWise</strong>
              <small>Car buying platform</small>
            </span>
          </Link>

          <nav className="nav-links" aria-label="Primary">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `nav-link${isActive ? " is-active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <Link to="/compare" className="nav-badge">
              Compare
              <span className="count-pill">{compareIds.length}</span>
            </Link>
            <Link to="/shortlist" className="nav-badge nav-badge--accent">
              Shortlist
              <span className="count-pill">{shortlistIds.length}</span>
            </Link>
            <button
              type="button"
              className="menu-button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu${menuOpen ? " is-open" : ""}`}>
        <div
          className="mobile-menu__backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
        <aside className="mobile-menu__panel" aria-label="Mobile menu">
          <div className="mobile-menu__top">
            <span className="mobile-menu__title">Navigate</span>
            <button
              type="button"
              className="menu-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
          <nav className="mobile-menu__links">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `mobile-menu__link${isActive ? " is-active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mobile-menu__chips">
            <Link to="/compare" className="nav-badge">
              Compare
              <span className="count-pill">{compareIds.length}</span>
            </Link>
            <Link to="/shortlist" className="nav-badge nav-badge--accent">
              Shortlist
              <span className="count-pill">{shortlistIds.length}</span>
            </Link>
          </div>
        </aside>
      </div>

      <main className="page-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <span className="brand__mark">DW</span>
            <div>
              <strong>DriveWise</strong>
              <p>
                A calmer way to compare Indian-market cars, shortlist the best
                fit, and move forward with confidence.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4>Explore</h4>
          <a href="/explore">Browse cars</a>
          <a href="/quiz">Take the quiz</a>
          <a href="/compare">Compare picks</a>
        </div>

        <div>
          <h4>Quick help</h4>
          <span>Filters work on mobile and desktop.</span>
          <span>Shortlist picks stay saved locally.</span>
          <span>Compare up to three cars side by side.</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>Built for a responsive car-buying journey.</span>
        <span>DriveWise UI</span>
      </div>
    </footer>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="section-heading__action">{action}</div> : null}
    </div>
  );
}

function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) =>
        index === items.length - 1 ? (
          <span key={item.label} aria-current="page">
            {item.label}
          </span>
        ) : (
          <Link key={item.label} to={item.to}>
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}

function EmptyState({ title, text, action, to }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">DW</div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && to ? (
        <Link to={to} className="btn btn--primary">
          {action}
        </Link>
      ) : null}
    </div>
  );
}

function StatPill({ value, label }) {
  return (
    <div className="stat-pill">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function CarCard({ car }) {
  const { shortlistIds, compareIds, toggleShortlist, toggleCompare } =
    useSelections();
  const shortlisted = shortlistIds.includes(car.id);
  const compared = compareIds.includes(car.id);

  return (
    <article
      className="car-card"
      style={{
        "--card-from": car.accentFrom,
        "--card-to": car.accentTo,
      }}
    >
      <div className="car-card__art">
        <span className="car-card__tag">{car.spotlight}</span>
        <div className="car-card__art-copy">
          <p>{car.make}</p>
          <h3>
            {car.model}
            <span>{car.variant}</span>
          </h3>
          <small>{car.bodyType}</small>
        </div>
        <div className="car-card__score">
          <strong>{car.recommendationScore}</strong>
          <span>Reco</span>
        </div>
      </div>

      <div className="car-card__body">
        <div className="car-card__header">
          <div>
            <h3>{car.model}</h3>
            <p>
              {car.variant} · {car.make}
            </p>
          </div>
          <div className="car-card__price">
            {formatPrice(car.priceExShowroom)}
          </div>
        </div>

        <div className="car-card__badges">
          <span className="pill">Safety {car.safetyRating.toFixed(1)}</span>
          <span className="pill">{car.reviewScore.toFixed(1)} reviews</span>
          <span className="pill">{formatMileage(car)}</span>
        </div>

        <div className="car-card__meta">
          <div>
            <span>Fuel</span>
            <strong>{car.fuelType}</strong>
          </div>
          <div>
            <span>Transmission</span>
            <strong>{car.transmission}</strong>
          </div>
          <div>
            <span>Seats</span>
            <strong>{car.seatingCapacity}</strong>
          </div>
        </div>

        <ul className="car-card__pros">
          {car.pros.slice(0, 2).map((pro) => (
            <li key={pro}>{pro}</li>
          ))}
        </ul>

        <div className="car-card__actions">
          <Link to={`/car/${car.id}`} className="btn btn--primary btn--small">
            View details
          </Link>
          <button
            type="button"
            className={`btn btn--secondary btn--small${
              compared ? " is-active" : ""
            }`}
            onClick={() => toggleCompare(car.id)}
          >
            {compared ? "Compared" : "Compare"}
          </button>
          <button
            type="button"
            className={`btn btn--ghost btn--small${
              shortlisted ? " is-active" : ""
            }`}
            onClick={() => toggleShortlist(car.id)}
          >
            {shortlisted ? "Saved" : "Shortlist"}
          </button>
        </div>
      </div>
    </article>
  );
}

function HeroSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form className="hero-search" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="hero-search-input">
        Search cars
      </label>
      <input
        id="hero-search-input"
        type="search"
        placeholder="Search Swift, Creta, EVs, family SUVs..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button type="submit" className="btn btn--primary">
        Explore cars
      </button>
      <Link to="/quiz" className="btn btn--secondary">
        Take the quiz
      </Link>
    </form>
  );
}

function HomePage() {
  const { cars } = useCars();
  const featuredCars = useMemo(
    () =>
      [...cars]
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 4),
    [cars],
  );

  return (
    <div className="page page--home">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Car buying, made calmer</span>
            <h1>Find the right car without drowning in tabs.</h1>
            <p>
              Search, compare, shortlist, and make decisions with a cleaner
              workflow that stays readable on desktop and mobile.
            </p>
            <HeroSearch />
            <div className="hero-chips">
              <Link to="/explore?bodyType=SUV" className="filter-chip">
                SUV
              </Link>
              <Link to="/explore?bodyType=EV" className="filter-chip">
                EV
              </Link>
              <Link to="/explore?minSafety=4.5" className="filter-chip">
                4.5+ safety
              </Link>
              <Link to="/explore?fuelType=Hybrid" className="filter-chip">
                Hybrid
              </Link>
            </div>
            <div className="hero-stats">
              <StatPill value="8" label="cars benchmarked" />
              <StatPill value="95" label="best recommendation" />
              <StatPill value="3" label="compare limit" />
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-panel">
              <img src={heroArt} alt="" className="hero-image" />
              <div className="hero-floating hero-floating--top">
                <strong>Top pick</strong>
                <span>Tata Nexon for safety</span>
              </div>
              <div className="hero-floating hero-floating--left">
                <strong>7-seat comfort</strong>
                <span>Innova Hycross & Carens</span>
              </div>
              <div className="hero-floating hero-floating--right">
                <strong>Quick compare</strong>
                <span>Build a shortlist in seconds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section container">
        <SectionHeading
          eyebrow="Why it works"
          title="A cleaner path from browsing to confidence"
          description="The layout keeps the important decisions visible, even when the screen gets small."
        />
        <div className="feature-grid">
          {featurePillars.map((pillar) => (
            <article key={pillar.title} className="feature-card">
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section container">
        <SectionHeading
          eyebrow="Featured cars"
          title="Top rated picks"
          description="A compact set of the strongest value, safety, and family-friendly options."
          action={
            <Link to="/explore" className="btn btn--secondary">
              View all cars
            </Link>
          }
        />
        <div className="car-grid">
          {featuredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      <section className="section container split-section">
        <div className="split-section__panel">
          <SectionHeading
            eyebrow="Popular brands"
            title="The market leaders in one place"
            description="A quick scan across the manufacturers that matter most to Indian buyers."
          />
          <div className="brand-cloud">
            {popularBrands.map((brand) => (
              <span key={brand}>{brand}</span>
            ))}
          </div>
        </div>

        <div className="split-section__panel">
          <SectionHeading
            eyebrow="How it works"
            title="Move through the decision in three steps"
            description="Browse, compare, and shortlist without getting lost in a cluttered interface."
          />
          <div className="workflow-grid">
            {workflowSteps.map((step) => (
              <article key={step.step} className="workflow-card">
                <span>{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="cta-banner">
          <div>
            <span className="eyebrow">Ready to shortlist?</span>
            <h2>Stay focused on the cars worth your time.</h2>
          </div>
          <Link to="/quiz" className="btn btn--primary">
            Start recommendation quiz
          </Link>
        </div>
      </section>
    </div>
  );
}

function getFilteredCars(carsData, params) {
  const query = (params.get("q") ?? "").trim().toLowerCase();
  const bodyType = params.get("bodyType") ?? "All";
  const fuelType = params.get("fuelType") ?? "All";
  const transmission = params.get("transmission") ?? "All";
  const seating = params.get("seating") ?? "All";
  const minPrice = parseNumericParam(params, "minPrice");
  const maxPrice = parseNumericParam(params, "maxPrice");
  const minSafety = parseNumericParam(params, "minSafety");
  const minReview = parseNumericParam(params, "minReview");
  const sort = params.get("sort") ?? "recommendation_desc";

  const filtered = carsData.filter((car) => {
    const text = buildSearchableText(car);
    const matchesQuery = query ? text.includes(query) : true;
    const matchesBody = bodyType === "All" || car.bodyType === bodyType;
    const matchesFuel = fuelType === "All" || car.fuelType === fuelType;
    const matchesTransmission =
      transmission === "All" || car.transmission === transmission;
    const matchesSeating =
      seating === "All" || car.seatingCapacity === Number(seating);
    const matchesMinPrice = Number.isFinite(minPrice)
      ? car.priceExShowroom >= minPrice
      : true;
    const matchesMaxPrice = Number.isFinite(maxPrice)
      ? car.priceExShowroom <= maxPrice
      : true;
    const matchesSafety = Number.isFinite(minSafety)
      ? car.safetyRating >= minSafety
      : true;
    const matchesReview = Number.isFinite(minReview)
      ? car.reviewScore >= minReview
      : true;

    return (
      matchesQuery &&
      matchesBody &&
      matchesFuel &&
      matchesTransmission &&
      matchesSeating &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesSafety &&
      matchesReview
    );
  });

  filtered.sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return a.priceExShowroom - b.priceExShowroom;
      case "price_desc":
        return b.priceExShowroom - a.priceExShowroom;
      case "mileage_desc":
        return b.mileage - a.mileage;
      case "safety_desc":
        return b.safetyRating - a.safetyRating;
      case "review_desc":
        return b.reviewScore - a.reviewScore;
      case "recommendation_desc":
      default:
        return b.recommendationScore - a.recommendationScore;
    }
  });

  return filtered;
}

function ExplorePage() {
  const { cars } = useCars();
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const query = searchParams.get("q") ?? "";
  const bodyType = searchParams.get("bodyType") ?? "All";
  const fuelType = searchParams.get("fuelType") ?? "All";
  const transmission = searchParams.get("transmission") ?? "All";
  const seating = searchParams.get("seating") ?? "All";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const minSafety = searchParams.get("minSafety") ?? "";
  const minReview = searchParams.get("minReview") ?? "";
  const sort = searchParams.get("sort") ?? "recommendation_desc";
  const requestedPage = Number(searchParams.get("page") ?? "1");
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const filteredCars = useMemo(
    () => getFilteredCars(cars, searchParams),
    [searchParams, cars],
  );

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageCars = filteredCars.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const updateParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === "" ||
          value === null ||
          value === undefined ||
          value === "All" ||
          value === "Any"
        ) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });

      if (!Object.prototype.hasOwnProperty.call(updates, "page")) {
        next.set("page", "1");
      }

      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const activeFilterCount = [
    query,
    bodyType !== "All" && bodyType,
    fuelType !== "All" && fuelType,
    transmission !== "All" && transmission,
    seating !== "All" && seating,
    minPrice,
    maxPrice,
    minSafety,
    minReview,
  ].filter(Boolean).length;

  return (
    <div className="page page--explore container">
      <PageIntro
        eyebrow="Explore"
        title="Research the market with less friction"
        description="Use search, filters, and sorting together to narrow the field without losing context."
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Explore cars", to: "/explore" },
        ]}
        actions={
          <button
            type="button"
            className="btn btn--secondary explore-filters-toggle"
            onClick={() => setDrawerOpen(true)}
          >
            Filters
          </button>
        }
      />

      <div className="filters-toolbar">
        <label className="search-field">
          <span className="sr-only">Search cars</span>
          <input
            type="search"
            value={query}
            onChange={(event) => updateParams({ q: event.target.value })}
            placeholder="Search make, model, features, pros, or cons"
          />
        </label>
        <label className="sort-field">
          <span className="sr-only">Sort cars</span>
          <select
            value={sort}
            onChange={(event) => updateParams({ sort: event.target.value })}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filters-layout">
        <aside className="filters-sidebar">
          <FiltersPanel
            query={query}
            bodyType={bodyType}
            fuelType={fuelType}
            transmission={transmission}
            seating={seating}
            minPrice={minPrice}
            maxPrice={maxPrice}
            minSafety={minSafety}
            minReview={minReview}
            sort={sort}
            onChange={updateParams}
            onReset={clearFilters}
          />
        </aside>

        <section className="results-panel">
          <div className="results-header">
            <div>
              <strong>{filteredCars.length} cars found</strong>
              <span>
                Showing {pageCars.length} of {filteredCars.length} results
              </span>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--small explore-filters-toggle"
              onClick={() => setDrawerOpen(true)}
            >
              Open filters
            </button>
          </div>

          {activeFilterCount > 0 ? (
            <div className="active-chip-row">
              {query ? <span className="filter-chip">Q: {query}</span> : null}
              {bodyType !== "All" ? (
                <span className="filter-chip">{bodyType}</span>
              ) : null}
              {fuelType !== "All" ? (
                <span className="filter-chip">{fuelType}</span>
              ) : null}
              {transmission !== "All" ? (
                <span className="filter-chip">{transmission}</span>
              ) : null}
              {seating !== "All" ? (
                <span className="filter-chip">{seating} seater</span>
              ) : null}
            </div>
          ) : null}

          {pageCars.length > 0 ? (
            <div className="car-grid car-grid--results">
              {pageCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No cars matched the current filters"
              text="Try widening the budget, switching fuel type, or clearing the current filters."
              action="Clear filters"
              to="/explore"
            />
          )}

          {filteredCars.length > PAGE_SIZE ? (
            <div className="pagination">
              <button
                type="button"
                className="btn btn--secondary btn--small"
                onClick={() =>
                  updateParams({ page: Math.max(1, currentPage - 1) })
                }
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn--secondary btn--small"
                onClick={() =>
                  updateParams({ page: Math.min(totalPages, currentPage + 1) })
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          ) : null}
        </section>
      </div>

      <div className={`drawer${drawerOpen ? " is-open" : ""}`}>
        <div
          className="drawer__backdrop"
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
        />
        <aside className="drawer__panel" aria-label="Mobile filters">
          <FiltersPanel
            query={query}
            bodyType={bodyType}
            fuelType={fuelType}
            transmission={transmission}
            seating={seating}
            minPrice={minPrice}
            maxPrice={maxPrice}
            minSafety={minSafety}
            minReview={minReview}
            sort={sort}
            onChange={updateParams}
            onReset={clearFilters}
            onClose={() => setDrawerOpen(false)}
          />
        </aside>
      </div>
    </div>
  );
}

function FiltersPanel({
  query,
  bodyType,
  fuelType,
  transmission,
  seating,
  minPrice,
  maxPrice,
  minSafety,
  minReview,
  sort,
  onChange,
  onReset,
  onClose,
}) {
  const update = (key, value) => onChange({ [key]: value });

  return (
    <div className="filters-panel">
      <div className="filters-panel__header">
        <div>
          <span className="eyebrow">Filters</span>
          <h3>Refine the shortlist</h3>
        </div>
        {onClose ? (
          <button type="button" className="menu-close" onClick={onClose}>
            ×
          </button>
        ) : null}
      </div>

      <div className="filter-group">
        <label htmlFor="filter-search">Search</label>
        <input
          id="filter-search"
          type="search"
          value={query}
          onChange={(event) => update("q", event.target.value)}
          placeholder="Model, feature, or use case"
        />
      </div>

      <div className="filter-group">
        <label>Body type</label>
        <div className="segmented">
          {bodyTypeOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`segmented__item${bodyType === option ? " is-active" : ""}`}
              onClick={() => update("bodyType", option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Fuel type</label>
        <div className="segmented">
          {fuelTypeOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`segmented__item${fuelType === option ? " is-active" : ""}`}
              onClick={() => update("fuelType", option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Transmission</label>
        <div className="segmented">
          {transmissionOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`segmented__item${
                transmission === option ? " is-active" : ""
              }`}
              onClick={() => update("transmission", option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-grid">
        <div className="filter-group">
          <label htmlFor="min-price">Min price</label>
          <input
            id="min-price"
            type="number"
            min="0"
            inputMode="numeric"
            value={minPrice}
            onChange={(event) => update("minPrice", event.target.value)}
            placeholder="0"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="max-price">Max price</label>
          <input
            id="max-price"
            type="number"
            min="0"
            inputMode="numeric"
            value={maxPrice}
            onChange={(event) => update("maxPrice", event.target.value)}
            placeholder="2500000"
          />
        </div>
      </div>

      <div className="filter-grid">
        <div className="filter-group">
          <label htmlFor="min-safety">Min safety</label>
          <input
            id="min-safety"
            type="number"
            min="0"
            max="5"
            step="0.5"
            value={minSafety}
            onChange={(event) => update("minSafety", event.target.value)}
            placeholder="4"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="min-review">Min review</label>
          <input
            id="min-review"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={minReview}
            onChange={(event) => update("minReview", event.target.value)}
            placeholder="4"
          />
        </div>
      </div>

      <div className="filter-group">
        <label>Seating</label>
        <div className="segmented">
          {seatingOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`segmented__item${seating === option ? " is-active" : ""}`}
              onClick={() => update("seating", option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="sort">Sort</label>
        <select
          id="sort"
          value={sort}
          onChange={(event) => update("sort", event.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="btn btn--ghost" onClick={onReset}>
        Clear filters
      </button>
    </div>
  );
}

function QuizPage() {
  const { cars } = useCars();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentStep = quizSteps[stepIndex];
  const isComplete = stepIndex >= quizSteps.length;

  const recommendations = useMemo(() => {
    if (!isComplete) {
      return [];
    }

    return [...cars]
      .map((car) => ({
        car,
        score: scoreQuizCar(car, answers),
        reason: explainRecommendation(car, answers),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [answers, isComplete, cars]);

  const selectOption = (value) => {
    setAnswers((current) => ({
      ...current,
      [currentStep.key]: value,
    }));

    if (stepIndex < quizSteps.length - 1) {
      setStepIndex((current) => current + 1);
    } else {
      setStepIndex(quizSteps.length);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setStepIndex(0);
  };

  return (
    <div className="page page--quiz container">
      <PageIntro
        eyebrow="Quiz"
        title="A short wizard that narrows the field fast"
        description="Answer a few practical questions and get ranked matches with clear reasons behind each pick."
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Quiz", to: "/quiz" },
        ]}
      />

      <div className="quiz-layout">
        <section className="quiz-panel">
          <div className="quiz-progress">
            <span>
              Step {Math.min(stepIndex + 1, quizSteps.length)} of{" "}
              {quizSteps.length}
            </span>
            <div className="quiz-progress__bar">
              <span
                style={{
                  width: `${(Math.min(stepIndex, quizSteps.length - 1) / quizSteps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {!isComplete ? (
            <>
              <span className="eyebrow">Recommendation wizard</span>
              <h2>{currentStep.title}</h2>
              <p>{currentStep.subtitle}</p>

              <div className="quiz-options">
                {currentStep.options.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    className="quiz-option"
                    onClick={() => selectOption(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="quiz-actions">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() =>
                    setStepIndex((value) => Math.max(0, value - 1))
                  }
                  disabled={stepIndex === 0}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={resetQuiz}
                >
                  Reset
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="eyebrow">Top matches</span>
              <h2>Your strongest matches are ready</h2>
              <p>
                The ranking blends budget fit, usage pattern, fuel preference,
                and your stated priorities.
              </p>

              <div className="recommendation-grid">
                {recommendations.map((entry) => (
                  <div key={entry.car.id} className="recommendation-card">
                    <div className="recommendation-card__top">
                      <div>
                        <span className="recommendation-score">
                          {entry.score}% match
                        </span>
                        <h3>
                          {entry.car.make} {entry.car.model}
                        </h3>
                        <p>{entry.car.variant}</p>
                      </div>
                      <Link
                        to={`/car/${entry.car.id}`}
                        className="btn btn--secondary btn--small"
                      >
                        View
                      </Link>
                    </div>

                    <p className="recommendation-reason">
                      Why it fits: {entry.reason.join(", ")}.
                    </p>

                    <CarCard car={entry.car} />
                  </div>
                ))}
              </div>

              <div className="quiz-actions">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={resetQuiz}
                >
                  Start over
                </button>
                <Link to="/compare" className="btn btn--primary">
                  Compare shortlisted cars
                </Link>
              </div>
            </>
          )}
        </section>

        <aside className="quiz-side">
          <div className="quiz-summary-card">
            <span className="eyebrow">What we weigh</span>
            <ul>
              <li>Budget fit</li>
              <li>Usage pattern</li>
              <li>Fuel preference</li>
              <li>Seating need</li>
              <li>Top priority</li>
            </ul>
          </div>
          <div className="quiz-summary-card">
            <span className="eyebrow">Responsive by design</span>
            <p>
              The wizard stacks cleanly on smaller screens and keeps the next
              action visible at every step.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CarDetailsPage() {
  const { cars } = useCars();
  const { id } = useParams();
  const car = cars.find((item) => item.id === id);
  const relatedCars = useMemo(
    () =>
      cars
        .filter(
          (item) =>
            item.id !== car?.id &&
            (item.bodyType === car?.bodyType || item.make === car?.make),
        )
        .slice(0, 3),
    [car, cars],
  );

  if (!car) {
    return (
      <div className="page container">
        <EmptyState
          title="That car is not in the current catalog"
          text="Head back to Explore and pick a car from the current selection."
          action="Browse cars"
          to="/explore"
        />
      </div>
    );
  }

  return (
    <div className="page page--detail container">
      <PageIntro
        eyebrow="Car details"
        title={`${car.make} ${car.model}`}
        description={`${car.variant} · ${car.bodyType} · ${car.fuelType}`}
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Explore cars", to: "/explore" },
          { label: `${car.make} ${car.model}`, to: `/car/${car.id}` },
        ]}
      />

      <section
        className="detail-hero"
        style={{
          "--card-from": car.accentFrom,
          "--card-to": car.accentTo,
        }}
      >
        <div className="detail-hero__copy">
          <span className="eyebrow">{car.spotlight}</span>
          <h2>
            {car.make} {car.model}
          </h2>
          <p>
            A quick snapshot of the price, specs, review signal, and ownership
            traits that shape the shortlist.
          </p>
          <div className="detail-hero__stats">
            <StatPill
              value={formatPrice(car.priceExShowroom)}
              label="Ex-showroom"
            />
            <StatPill
              value={`${car.safetyRating.toFixed(1)}★`}
              label="Safety"
            />
            <StatPill
              value={`${car.reviewScore.toFixed(1)}`}
              label="Review score"
            />
            <StatPill value={`${car.recommendationScore}`} label="Reco score" />
          </div>
          <div className="detail-actions">
            <Link to="/explore" className="btn btn--secondary">
              Back to explore
            </Link>
            <Link to="/compare" className="btn btn--primary">
              Compare cars
            </Link>
          </div>
        </div>

        <div className="detail-hero__visual">
          <div className="detail-art">
            <span>{car.spotlight}</span>
            <strong>{car.make}</strong>
            <small>
              {car.bodyType} · {car.transmission}
            </small>
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Spec sheet"
          title="What it brings to the table"
          description="The essentials laid out in a responsive grid so the important bits stay visible."
        />
        <div className="spec-grid">
          {[
            ["Price", formatPrice(car.priceExShowroom)],
            ["Mileage", formatMileage(car)],
            ["Engine", formatEngine(car)],
            ["Power", `${car.powerBhp.toFixed(0)} bhp`],
            ["Torque", `${car.torqueNm.toFixed(0)} Nm`],
            ["Seats", `${car.seatingCapacity}`],
            ["Boot space", `${car.bootSpaceLitres} L`],
            ["Ground clearance", `${car.groundClearanceMm} mm`],
          ].map(([label, value]) => (
            <article key={label} className="spec-card">
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section pros-cons-grid">
        <article className="pros-card">
          <SectionHeading eyebrow="Pros" title="What stands out" />
          <ul>
            {(car.pros || []).map((pro) => (
              <li key={pro}>{pro}</li>
            ))}
          </ul>
        </article>
        <article className="cons-card">
          <SectionHeading eyebrow="Cons" title="Trade-offs to keep in mind" />
          <ul>
            {(car.cons || []).map((con) => (
              <li key={con}>{con}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Ownership lens"
          title="Ratings that shape the final score"
        />
        <div className="rating-bars">
          {[
            ["Safety", car.safetyRating],
            ["Review score", car.reviewScore],
            ["Reliability", car.reliabilityRating],
            ["Resale", car.resaleRating],
            ["Service cost", car.serviceCostRating],
          ].map(([label, value]) => (
            <div key={label} className="rating-bar">
              <div className="rating-bar__top">
                <span>{label}</span>
                <strong>{Number(value).toFixed(1)} / 5</strong>
              </div>
              <div className="rating-bar__track">
                <span style={{ width: `${(Number(value) / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="User reviews"
          title="What other shoppers are saying"
          description="A small but useful sample of the tone and ownership feedback."
        />
        <div className="review-grid">
          {(car.reviews || []).map((review) => (
            <article key={review.title} className="review-card">
              <div className="review-card__top">
                <strong>{review.name}</strong>
                <span>{review.rating.toFixed(1)} ★</span>
              </div>
              <h3>{review.title}</h3>
              <p>{review.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Similar cars"
          title="A few nearby alternatives"
          description="Useful when you want another option in the same space."
        />
        <div className="car-grid">
          {relatedCars.map((item) => (
            <CarCard key={item.id} car={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ComparePage() {
  const { compare, compareIds, clearCompare, toggleCompare } = useSelections();

  if (compare.length === 0) {
    return (
      <div className="page container">
        <PageIntro
          eyebrow="Compare"
          title="Pick up to three cars to compare"
          description="Use the compare buttons across the site, then line them up here."
          breadcrumbs={[
            { label: "Home", to: "/" },
            { label: "Compare", to: "/compare" },
          ]}
        />
        <EmptyState
          title="No comparison yet"
          text="Add a few cars from Explore, Details, or the Quiz results and they will appear here."
          action="Browse cars"
          to="/explore"
        />
      </div>
    );
  }

  const rows = comparisonRows.map((row) => {
    const values = compare.map((car) => {
      const raw =
        row.label === "Price"
          ? car.priceExShowroom
          : row.label === "Mileage"
            ? car.mileage
            : row.label === "Power"
              ? car.powerBhp
              : row.label === "Torque"
                ? car.torqueNm
                : row.label === "Safety"
                  ? car.safetyRating
                  : row.label === "Review score"
                    ? car.reviewScore
                    : row.label === "Airbags"
                      ? car.airbags
                      : row.label === "ADAS"
                        ? car.adasLevel
                        : row.label === "Ground clearance"
                          ? car.groundClearanceMm
                          : row.label === "Boot space"
                            ? car.bootSpaceLitres
                            : row.label === "Reliability"
                              ? car.reliabilityRating
                              : row.label === "Resale"
                                ? car.resaleRating
                                : row.label === "Service cost"
                                  ? car.serviceCostRating
                                  : row.label === "Recommendation"
                                    ? car.recommendationScore
                                    : null;

      return raw;
    });

    const bestIndex = getBestIndex(values, row.highlight);

    return {
      ...row,
      values,
      bestIndex,
    };
  });

  return (
    <div className="page page--compare container">
      <PageIntro
        eyebrow="Compare"
        title="Side-by-side view for the final call"
        description="The table stays readable on mobile through horizontal scrolling and compact cells."
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Compare", to: "/compare" },
        ]}
        actions={
          <button
            type="button"
            className="btn btn--ghost"
            onClick={clearCompare}
          >
            Clear compare
          </button>
        }
      />

      <div className="comparison-shell">
        <div className="comparison-scroll">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Metric</th>
                {compare.map((car) => (
                  <th key={car.id}>
                    <div className="comparison-head">
                      <span>{car.make}</span>
                      <strong>
                        {car.model} {car.variant}
                      </strong>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => toggleCompare(car.id)}
                        aria-label={`Remove ${car.model} from comparison`}
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th>{row.label}</th>
                  {row.values.map((value, index) => (
                    <td
                      key={`${row.label}-${compare[index].id}`}
                      className={
                        row.bestIndex === index && row.bestIndex !== -1
                          ? "cell--best"
                          : ""
                      }
                    >
                      {row.format(compare[index])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="comparison-actions">
          <span>{compareIds.length} car(s) selected</span>
          <Link to="/explore" className="btn btn--secondary">
            Add more
          </Link>
        </div>
      </div>
    </div>
  );
}

function ShortlistPage() {
  const { shortlist } = useSelections();

  return (
    <div className="page page--shortlist container">
      <PageIntro
        eyebrow="Shortlist"
        title="The saved cars that matter right now"
        description="Keep the list focused, compare the strongest options, and remove anything that falls away."
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Shortlist", to: "/shortlist" },
        ]}
      />

      {shortlist.length > 0 ? (
        <div className="car-grid">
          {shortlist.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your shortlist is empty"
          text="Save cars from Explore, Details, or Quiz results to keep a tighter set of options."
          action="Start exploring"
          to="/explore"
        />
      )}
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="page container">
      <EmptyState
        title="Page not found"
        text="The route you tried is not part of this UI. Head back to the homepage or open Explore."
        action="Go home"
        to="/"
      />
    </div>
  );
}

export default App;

const PageIntro = memo(function PageIntroInner(props) {
  return <PageIntroView {...props} />;
});

function PageIntroView({ eyebrow, title, description, breadcrumbs, actions }) {
  return (
    <div className="page-intro">
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="page-intro__row">
        <div>
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="page-intro__actions">{actions}</div> : null}
      </div>
    </div>
  );
}
