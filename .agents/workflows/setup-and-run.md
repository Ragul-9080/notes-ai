---
description: how to setup and run the Digital Notes Organizer
---

# Setup and Run Workflow

Follow these steps to get the Digital Notes Organizer running locally.

### 1. Prerequisite Check
Ensure you have Node.js and npm installed.

### 2. Configure Environment Variables
// turbo
1. Create a `.env` file in the `server` directory with the following:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
2. Create a `.env` file in the `client` directory with:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Install Dependencies
// turbo
1. Navigate to the `server` directory and run:
   ```powershell
   npm install
   ```
2. Navigate to the `client` directory and run:
   ```powershell
   npm install
   ```

### 4. Start the Application
// turbo
1. In the `server` directory, start the backend:
   ```powershell
   npm start
   ```
2. In the `client` directory, start the frontend:
   ```powershell
   npm run dev
   ```

### 5. Access the App
Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).
