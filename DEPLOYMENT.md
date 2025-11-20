# Deployment Guide

Follow these steps to host your Chat App for **free** so anyone can access it from anywhere.

## Prerequisites
1.  **GitHub Account**: [Sign up here](https://github.com/signup) if you don't have one.
2.  **Render Account**: [Sign up here](https://dashboard.render.com/register) for the Server (Backend).
3.  **Vercel Account**: [Sign up here](https://vercel.com/signup) for the Client (Frontend).

---

## Step 1: Push Code to GitHub
1.  Create a new repository on GitHub (name it `chat-app` or similar).
2.  In your terminal, navigate to `C:\Users\CS\Desktop\Hello\chat-app`.
3.  Run these commands:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```
    *(Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name)*

---

## Step 2: Deploy Server (Render)
1.  Go to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** → **Web Service**.
3.  Connect your GitHub repository.
4.  **Settings**:
    *   **Name**: `chat-app-server` (or any name you like)
    *   **Root Directory**: `server`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm start`
5.  Click **Create Web Service**.
6.  Wait for it to deploy (2-3 minutes). Copy the **Service URL** (e.g., `https://chat-app-server-abc123.onrender.com`).

---

## Step 3: Deploy Client (Vercel)
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** → **Project**.
3.  Import your GitHub repository.
4.  **Project Settings**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Click "Edit" → Select `client`
5.  **Environment Variables** (IMPORTANT):
    *   Click "Add" under Environment Variables
    *   **Key**: `VITE_SERVER_URL`
    *   **Value**: Paste your **Render Service URL** from Step 2 (e.g., `https://chat-app-server-abc123.onrender.com`)
6.  Click **Deploy**.

---

## Step 4: Share Your App!
1.  Once Vercel finishes deploying, you'll get a **live URL** (e.g., `https://chat-app-xyz.vercel.app`).
2.  **Share this link** with anyone! They can access it from their phone, laptop, or any device.
3.  **Note**: The first time someone connects, the Render server might take 30-60 seconds to "wake up" (free tier limitation).

---

## Troubleshooting
*   **Can't connect?** Make sure you set the `VITE_SERVER_URL` environment variable correctly in Vercel.
*   **Server not responding?** Check Render logs to see if the server started successfully.
*   **Need help?** Check the Render and Vercel documentation or ask for assistance.

**Congratulations! Your chat app is now live! 🎉**
