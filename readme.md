# DriveWise 🚗

### Car Buying Decision Platform

DriveWise is a full-stack car research and decision-making platform designed to help users move from having too many vehicle choices to building a confident shortlist.

Instead of simply listing cars, DriveWise focuses on **Discovery · Search · Advanced Filtering · Comparison · Recommendations · Shortlisting** to support real-world car purchase decisions.

The application combines a modern React frontend with a scalable Node.js backend and MongoDB database to provide a smooth and data-driven car exploration experience.

---

## Features

### Car Discovery
- Browse available cars in the Indian market
- View detailed specifications
- Explore different variants
- Search cars instantly

### Advanced Filtering

Filter cars by:
- Make, Model, Variant
- Price Range
- Fuel Type
- Transmission
- Mileage
- Safety Rating
- Review Score
- Comfort, Reliability, Resale Value
- Service Cost
- Seating Capacity

### Smart Search

Search across Make, Model, Variant, Features, Pros, and Cons.

### Recommendation System

Get recommendations based on:
- Budget
- Usage Type
- Family Size
- Fuel Preference
- Safety, Comfort, and Performance Importance

### Compare Cars

Compare up to 3 cars side-by-side across Price, Mileage, Engine, Power, Torque, Safety, Airbags, ADAS, Reliability, Review Scores, and Recommendation Scores.

### Shortlisting

- Save cars to your shortlist
- View and remove shortlisted cars
- Compare shortlisted cars

### Detailed Car Information

Each vehicle includes Specifications, Features, Pros & Cons, User Reviews, Ratings, and a Recommendation Score.

---

## Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React.js | Component-based UI |
| Vite | Fast builds and HMR |
| React Router DOM | Client-side routing |
| Redux Toolkit | State management |
| Axios | API integration |
| Tailwind CSS | Styling and responsive layouts |

### Backend
| Tech | Purpose |
|---|---|
| Node.js | Server runtime |
| Express.js | Routing and middleware |
| MongoDB | Flexible document database |
| Mongoose | Schema management and queries |

---

## Project Structure

### Frontend
```
frontend/
├── src/
│   ├── api/
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── public/
└── package.json
```

### Backend
```
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── data/
│   ├── app.js
│   └── server.js
├── .env
└── package.json
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/FShyamsundar/Car-Dekho-AI-Website.git
cd drivewise
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Seed the database:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Available Scripts

### Frontend
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
```

### Backend
```bash
npm run dev       # Start development server
npm start         # Start production server
npm run seed      # Seed database with sample car data
```

---

## API Overview

### Cars

```
GET    /api/cars                 # Get all cars
GET    /api/cars/:id             # Get car details
GET    /api/cars/search?q=suv    # Search cars
```

### Shortlist

```
GET    /api/shortlist            # Get shortlisted cars
POST   /api/shortlist            # Add to shortlist
DELETE /api/shortlist/:carId     # Remove from shortlist
```

---

## What Was Deliberately Cut (MVP Scope)

The following features were intentionally excluded to deliver a focused MVP:

- User authentication and account management
- Persistent user profiles
- Real-time pricing updates
- Dealer and showroom integrations
- AI-powered conversational assistant
- Vehicle image management system
- Admin dashboard and analytics
- Review submission functionality
- Vehicle financing and EMI calculators
- Recommendation learning from user behavior

---

## AI Usage

### Delegated to AI
- Project architecture ideas and boilerplate generation
- Folder structure and API design inspiration
- Component scaffolding and dataset generation
- Documentation drafting and feature brainstorming
- Refactoring suggestions and edge-case discovery

### Done Manually
- Project vision and product scope
- Recommendation flow design
- Data modeling decisions
- API planning and UX decisions
- Filtering, comparison, and shortlist workflow
- Overall architecture direction

> Without AI assistance, the project would have required an estimated **5–8 additional hours** of development work.

---

## Future Improvements

- Authentication and user accounts
- AI-powered car buying assistant
- Saved user preferences
- Vehicle financing and EMI tools
- Dealer integrations
- Admin dashboard and analytics
- Recommendation learning engine
- Real-time pricing updates
- Review submission system

---

## Conclusion

DriveWise was built to simplify car-buying decisions through structured data, intelligent filtering, recommendations, comparisons, and shortlisting.

The platform combines a modern React frontend with a scalable Node.js backend, providing a strong foundation for future growth. AI tools accelerated development while all engineering decisions, product direction, and system design remained manual responsibilities.