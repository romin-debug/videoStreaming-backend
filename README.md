# Video Streaming Backend 🎥

This is a **backend-only** Node.js application for a video streaming platform. It includes **user authentication** and management but does not yet have a frontend or deployment.

## 🚀 Features
- User authentication (Register, Login)
- JWT-based authentication system
- Secure password storage (without `bcrypt`)
- User profile management
- Watch history tracking

## 🛠 Tech Stack
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JSON Web Tokens (JWT)** for authentication


## ⚡ Installation & Usage
### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/romin-debug/videoStreaming-backend.git
cd videoStreaming-backend

### **2️⃣ Install Dependencies**
npm install

### **3️⃣ Set Up Environment Variables**
ACCESS_TOKEN_SECRET=your_secret_key
REFRESH_TOKEN_SECRET=your_refresh_key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
MONGO_URI=mongodb+srv://your_db_connection


###**4️⃣ Start the Server**
npm run dev