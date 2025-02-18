# Prodigy Growth Plan - Backend

## 🚀 Project Overview
Prodigy Growth Plan is a comprehensive challenge tracking and personal development application designed to help users set, track, and achieve their personal and professional goals through a gamified experience.

## 📂 Project Structure
```
backend/
├── config/
│   └── database.js             # MongoDB connection configuration
├── controllers/                # Business logic for handling requests
│   └── userController.js
├── middlewares/                # Express middleware for authentication, validation
│   ├── auth.js
│   └── validation.js
├── models/                     # Mongoose data models
│   ├── Achievement.js          # Achievement tracking model
│   ├── Challenge.js            # Challenge management model
│   ├── Log.js                  # Activity logging model
│   └── User.js                 # User authentication and profile model
├── routes/                     # API route definitions
│   └── userRoutes.js
├── services/                   # External service integrations
├── utils/                      # Utility functions and helpers
│   ├── jwt.js
│   └── password.js
└── seed.js                     # Database seeding script
```

## 🔧 Key Features

### 1. User Management
- User registration and authentication
- Profile creation and management
- Role-based access control (user, editor, moderator, admin)
- JWT authentication and authorization
- Permission management system

### 2. Challenge System
- Create, update, and delete challenges
- Challenge categories and difficulty levels
- Challenge submission and evaluation
- Real-time progress tracking
- Daily and Weekly challenges
- Challenge leaderboards
- Personalized challenge recommendations

### 3. Gamification System
#### Points & Ranking
- Point accumulation system
- Global/Weekly/Monthly leaderboards
- Dynamic user rankings
- Season-based competitions

#### Achievement System
- Multiple achievement categories
- Progressive achievement unlocking
- Achievement tracking and rewards
- Special event achievements
- Achievement sharing

#### Badge System
- Tiered badge progression
- Category-specific badges
- Special event badges
- Badge progress tracking
- Badge showcase features

#### Streak System
- Daily streak tracking
- Streak milestone rewards
- Streak multipliers
- Streak recovery mechanics
- Streak leaderboards

### 4. Social Features
#### Follow System
- Follow/Unfollow functionality
- Follower/Following management
- Privacy settings
- User discovery

#### Activity Feed
- Real-time activity updates
- Achievement sharing
- Challenge completion posts
- Social interactions (likes, comments)
- Custom activity filtering

#### Notifications
- Real-time notification system
- Achievement notifications
- Social interaction alerts
- Challenge reminders
- Custom notification preferences

### 5. Core Models
#### User Model
- Authentication and profile data
- Statistics and progress tracking
- Achievement and badge collection
- Social settings and preferences
- Activity history

#### Challenge Model
- Challenge specifications
- Participation tracking
- Submission history
- Performance metrics
- Leaderboard integration

#### Achievement/Badge Models
- Unlock conditions
- Progress tracking
- Reward distribution
- Collection management

#### Activity/Notification Models
- Social interaction tracking
- User activity logging
- Notification management
- Privacy controls

### 6. API Structure
#### User Routes (/api/users)
- Authentication endpoints
- Profile management
- User settings
- Progress tracking

#### Challenge Routes (/api/challenges)
- Challenge CRUD operations
- Submission handling
- Leaderboard access
- Daily/Weekly challenge management

#### Social Routes (/api/social)
- Follow system management
- Activity feed operations
- Notification handling
- Social interaction endpoints

#### Achievement Routes (/api/achievements)
- Achievement tracking
- Badge management
- Progress monitoring
- Reward distribution

### 7. Planned Features
- Learning Path System
- Analytics & Reporting System
- AI Integration for:
  * Performance analysis
  * Challenge recommendations
  * Learning path optimization
  * Personalized insights

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