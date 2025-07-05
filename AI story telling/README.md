# AI Story Generator

Welcome to the AI Story Generator! This project lets you create unique stories using AI, with a beautiful web interface and a secure backend proxy for API calls.

---

## 🚀 How to Run This Project (Step-by-Step)

1. **Clone or Download the Project**
   - Download the ZIP or use `git clone` to get the files onto your computer.

2. **Install Backend Dependencies**
   - Open a terminal in the project folder.
   - Run:
     ```powershell
     npm install
     ```
   - This will create a `node_modules` folder (see important note below).

3. **Set Up Your API Key**
   - Create a `.env` file in the project root (if it doesn't exist).
   - Add your Gemini API key like this:
     ```env
     GEMINI_API_KEY=your-api-key-here
     ```

4. **Start the Backend Server**
   - In the terminal, run:
     ```powershell
     npm start
     ```
   - The backend will run on [http://localhost:3001](http://localhost:3001).

5. **Start the Frontend (Web App)**
   - Open `index.html` in your browser.
   - For best results, use a static server like the VS Code Live Server extension, or run:
     ```powershell
     npx serve .
     ```
   - Do **not** just double-click `index.html` (some browsers block API calls from local files).

6. **Generate Stories!**
   - Use the web app to create, copy, and save stories. Enjoy!

---

## ⚠️ Important: About `node_modules`

- **Do NOT upload `node_modules` to GitHub!**
- `node_modules` is huge and is automatically created by `npm install`.
- Only upload your code files (like `.js`, `.html`, `.env.example`, etc.).
- If you see `node_modules` in your project, you can safely delete it before uploading. Anyone can restore it by running `npm install`.

---

## 📁 Project Structure

- `app.js` — Main React app (frontend logic)
- `index.html` — Web app UI
- `server.js` — Node.js backend proxy (handles API key securely)
- `.env` — Your Gemini API key (never share this file)
- `package.json` — Backend dependencies
- `manifest.json`, `service_worker.js` — (Optional) PWA support

---

## 🛠️ Troubleshooting

- **CORS or API errors?**
  - Make sure the backend is running (`npm start`).
  - Make sure you are using a static server for the frontend.
  - Check your `.env` file and API key.
- **Still stuck?**
  - Restart your terminal and try again.
  - Double-check the instructions above.

---

## 💡 Tips

- Keep your `.env` file private.
- Use `npm install` whenever you download or clone the project.
- For deployment, use services that support both Node.js and static files (like Vercel, Netlify, or Render).

---

Made with ❤️ by a human (and a little help from AI). Happy storytelling!
