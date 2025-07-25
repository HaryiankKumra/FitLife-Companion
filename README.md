# 💪 FitLife Companion - AI-Powered Fitness App

A comprehensive full-stack fitness application with AI-powered workout recommendations, meal analysis, and progress tracking.

## 🌟 Features

### 🤖 AI-Powered Intelligence
- **Smart Workout Assistant**: AI analyzes your workout history and suggests personalized routines
- **Meal Plan Analysis**: NLP-powered analysis of your meal plans with goal-specific recommendations
- **Progress Insights**: Intelligent tracking and motivational feedback

### 🏋️ Fitness Tracking
- **Gym Tracker**: Log workouts with detailed exercise tracking (sets, reps, weights)
- **Progress Dashboard**: 3D visualizations and comprehensive progress analytics
- **Workout History**: Complete history with filtering and search capabilities

### 📋 Daily Management
- **Smart Todo List**: Priority-based task management with completion tracking
- **Medicine Reminders**: Scheduled medication tracking with notifications
- **Goal Setting**: Customizable fitness goals (bulking, cutting, maintenance)

### 🔒 Security & Data
- **Secure Authentication**: JWT-based auth with bcrypt password hashing
- **User Data Isolation**: Each user's data is completely separate and secure
- **Persistent Storage**: PostgreSQL database with Neon for reliable data storage

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes, PostgreSQL (Neon)
- **AI**: OpenAI GPT-4 for workout suggestions and meal analysis
- **UI**: Tailwind CSS, shadcn/ui components, React Three Fiber for 3D
- **Authentication**: JWT tokens, bcrypt hashing
- **Database**: Neon PostgreSQL with optimized queries and indexes

## 🛠️ Setup & Deployment

### Environment Variables
\`\`\`env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
\`\`\`

### Local Development
\`\`\`bash
npm install
npm run db:setup
npm run dev
\`\`\`

### Demo Account
- Email: demo@fitlife.com
- Password: demo123

## 📱 Key Features

### AI Workout Recommendations
- Analyzes your workout patterns and muscle group balance
- Suggests personalized exercises with optimal sets, reps, and weights
- Considers your fitness goals and provides form tips

### Intelligent Meal Analysis
- Upload or paste meal plans for AI analysis
- Get scored recommendations based on your fitness goals
- Macro balance assessment and improvement suggestions

### Comprehensive Progress Tracking
- Interactive 3D dashboard with animated progress indicators
- Weekly and monthly analytics
- Motivational messages and achievement tracking

### Smart Task Management
- Priority-based todo system with completion tracking
- Integration with fitness goals and daily routines
- Progress celebration and motivation

## 🔐 Security Features

- Secure user authentication with JWT tokens
- Password hashing with bcrypt
- HTTP-only cookies for session management
- User data isolation and protection
- Parameterized database queries to prevent SQL injection

## 📊 Database Schema

- **Users**: Profile information and fitness goals
- **Workouts**: Exercise sessions with detailed tracking
- **Exercises**: Individual exercise records with sets/reps/weights
- **Todos**: Task management with priorities
- **Medicines**: Medication tracking and reminders
- **AI Analyses**: Stored AI recommendations and meal analyses

## 🎯 Future Enhancements

- Social features and community challenges
- Workout video integration
- Nutrition tracking with barcode scanning
- Wearable device integration
- Advanced analytics and reporting

---

Built with ❤️ for fitness enthusiasts who want intelligent, personalized workout and nutrition guidance.
#   F i t L i f e - C o m p a n i o n  
 