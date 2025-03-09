# SpiritX Cricket Fantasy League

Welcome to the SpiritX Cricket Fantasy League, a full-featured fantasy cricket platform where users can build teams, track player performance, and compete on the leaderboard.

## Live Demo

**Live deployment**: [https://spirit-x-xtruders-02.vercel.app/](https://spirit-x-xtruders-02.vercel.app/)

**Test user credentials**:
- **Email**: testuser@gmail.com
- **Password**: testpassword123

**Admin portal access**:
- **URL**: [https://spirit-x-xtruders-02.vercel.app/admin/login](https://spirit-x-xtruders-02.vercel.app/admin/login)
- **Username**: adminuser
- **Password**: securePassword123

You can also create your own account through the signup page.

## Features Overview

### User Interface
- **Authentication**: Complete signup and login system
- **Players Tab**: Browse all available players and view detailed profiles
- **Team Selection**: Build your dream team of 11 players across different categories
- **Budget Management**: Track your spending with an initial budget of Rs.9,000,000
- **Team Tab**: View your selected players with removal options and team completion status
- **Leaderboard**: See how you rank against other users
- **Responsive Design**: Fully responsive UI that works on all devices

### Admin Panel
- **Admin Authentication**: Secure login for administrative functions
- **Player Management**: Complete CRUD operations for player data
- **Player Statistics**: Detailed view of individual player performance
- **Tournament Summary**: Overall analysis of tournament statistics including:
  - Total runs scored by all players
  - Total wickets taken
  - Highest run scorer
  - Highest wicket taker
- **Real-time Updates**: Instant reflection of changes without page refreshes

### AI Chatbot - Spiriter
- **Query Handling**: Answers questions about player details and statistics
- **Team Suggestions**: Recommends the optimal team based on player performance
- **Smart Responses**: Handles unknown questions appropriately

## Running Locally

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB account

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SpiritX_Xtruders_02
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   MONGO_DB_URI=mongodb+srv://adeepashashintha:TrCljNU7ZDbodQZw@cluster0.7adqy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   GOOGLE_GEMINI_API_KEY=AIzaSyA5qcgWRSj9sVwNgl_pDjIziEy-zOJru2c
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Key Features in Detail

### User Journey
1. Sign up with email and password
2. Browse available players in the Players Tab
3. View detailed player profiles and statistics
4. Select your team within the given budget constraints
5. Track your team's completion status and remaining budget
6. View your ranking on the leaderboard
7. Consult the AI chatbot for player information and team suggestions

### Admin Capabilities
1. Log in to the admin panel
2. Manage players (add, update, delete)
3. View comprehensive player statistics
4. Monitor tournament-wide performance metrics
5. Make real-time updates that reflect immediately for users

### Spiriter AI Chatbot
- Access by clicking the "Spiriter" button in the UI
- Ask questions about player statistics and performance
- Request suggestions for the best possible team composition
- Get intelligent responses based on available data

## Technology Stack
- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: Custom JWT-based auth
- **AI Integration**: Google Gemini API
- **Deployment**: Vercel

## Data Security
- User passwords are securely hashed
- Player points are hidden from regular users
- Admin-only protected routes
- Secure API endpoints

Enjoy building your dream cricket team and competing with other fantasy cricket enthusiasts!
