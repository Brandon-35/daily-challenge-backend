# Prodigy Growth Plan - Backend

## 🚀 Project Overview
Prodigy Growth Plan is a comprehensive challenge tracking and personal development application designed to help users set, track, and achieve their personal and professional goals through a gamified experience.

## 📂 Project Structure
```
backend/
├── config/
│   └── database.js             # MongoDB connection configuration
├── controllers/                # Business logic for handling requests
├── middlewares/                # Express middleware for authentication, validation
├── models/                     # Mongoose data models
│   ├── Achievement.js          # Achievement tracking model
│   ├── Challenge.js            # Challenge management model
│   ├── Log.js                  # Activity logging model
│   └── User.js                 # User authentication and profile model
├── routes/                     # API route definitions
├── services/                   # External service integrations
├── utils/                      # Utility functions and helpers
└── seed.js                     # Database seeding script
```

## 🔧 Key Features

### 1. User Management
- User registration and authentication
- Profile creation and management
- Role-based access control

### 2. Challenge Tracking
- Create, update, and delete personal challenges
- Track progress in real-time
- Set difficulty levels and categories
- Recurrence and frequency management

### 3. Logging System
- Daily activity logging
- Mood and effort tracking
- Detailed progress documentation
- AI-powered insights generation

### 4. Achievement System
- Milestone tracking
- Gamification elements
- Dynamic achievement unlocking
- Motivation through reward mechanisms

### 5. AI-Powered Analytics
- Performance analysis
- Personalized recommendations
- Trend identification
- Predictive insights

## 🛠 Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcrypt
- Joi (Validation)

## 📦 Core Models

### User Model
- Authentication details
- Profile information
- Personal settings
- Challenge progress tracking

### Challenge Model
- Detailed challenge specifications
- Progress tracking
- Category and difficulty management
- AI-enhanced metadata

### Log Model
- Detailed activity logging
- Mood and effort tracking
- Challenge association
- AI-generated insights

### Achievement Model
- Milestone tracking
- Reward system
- Dynamic unlocking mechanism

## 🔐 Security Features
- Password hashing
- JWT authentication
- Role-based access control
- Input validation
- CORS configuration
- Rate limiting

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with required configurations
4. Run database seed: `npm run seed`
5. Start the server: `npm run dev`

## 🧪 Testing
- Unit tests for models
- Integration tests for API endpoints
- Performance and security testing

## 🔮 Future Roadmap
- Enhanced AI recommendations
- More granular achievement tracking
- External service integrations
- Advanced analytics dashboard

## 📄 License
[Your License Here]

## 👥 Contributors
[List of Contributors]
```