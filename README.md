# TouchWithSeniors 🎓

> **Connect with recently placed seniors, ask doubts, access free resources, prepare for placements and explore off-campus opportunities.**

A full-stack student placement guidance and community platform for engineering colleges.

---

## 🚀 Live Features

| Feature | Description |
|---|---|
| 🙋 **Ask Query** | Post questions, upvote/dislike, reply |
| 📚 **Free Resources** | Share links & PDFs by CS / EC / AI-ML |
| 👨‍🏫 **Mentor Sessions** | Book 1-on-1 with placed seniors |
| 💻 **DSA Basics** | 40+ C++ problems with code viewer |
| 🎤 **Mock Interview** | Contact seniors via WhatsApp |
| 💼 **Off Campus Jobs** | Browse & apply to opportunities |
| 📖 **Interview Experiences** | Read & share placement stories |
| 🛒 **Student Marketplace** | Buy/sell items within your college |
| 👑 **Admin Panel** | Full moderation dashboard |

---

## 🏫 College Email Authentication

Students register using their **official college email**:

| College | Email Format |
|---|---|
| RVCE | `name.cs24@rvce.edu.in` |
| BMSCE | `name.cs24@bmsce.ac.in` |
| PESU | `name.cs24@pes.edu` |
| MSRIT | `name.cs24@msrit.edu` |
| + 18 more | ... |

- `24` = joining year → auto-calculates passout year (2028)
- **Each college's data is completely separate**

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **Auth** | JWT (college email-based, no password) |
| **File Upload** | Multer (PDFs + Images) |
| **Styling** | Vanilla CSS (dark glassmorphism) |

---

## 📦 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`)

### 1. Clone the repo
```bash
git clone https://github.com/2468231/TouchWithSeniors.git
cd TouchWithSeniors
```

### 2. Backend setup
```bash
cd server
npm install
cp .env.example .env    # Edit with your values
node seed.js            # Seed admin + sample data
node index.js           # Start backend on :5000
```

### 3. Frontend setup
```bash
cd client
npm install
npm run dev             # Start frontend on :5173
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🔧 Environment Variables

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/touchwithseniors
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173

# Optional: for real email sending (Gmail App Password)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

---

## 🌐 Deploy to Vercel / AWS

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy /dist folder to Vercel
```

Set environment variable in Vercel:
```
VITE_API_URL=https://your-backend-url.com
```

### Backend (Railway / Render / AWS)
- Set all `.env` variables in your hosting dashboard
- Use MongoDB Atlas for cloud database
- Set `CLIENT_URL` to your Vercel frontend URL

---

## 👤 Default Admin Account

After running `node seed.js`:
- **Email**: `admin@touchwithseniors.com`
- **Login**: Go to `/login` → click Admin Login

---

## 📁 Project Structure

```
TouchWithSeniors/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # All page components
│   │   ├── components/     # Layout, shared components
│   │   ├── context/        # AuthContext
│   │   ├── services/       # API calls
│   │   └── index.css       # Global dark design system
│   └── vite.config.js
└── server/                 # Express backend
    ├── config/             # DB + College registry
    ├── middleware/         # Auth middleware
    ├── models/             # Mongoose models
    ├── routes/             # API routes
    ├── uploads/            # File storage
    ├── seed.js             # Database seeder
    └── index.js            # Server entry
```

---

## 🤝 Contributing

Built for real students. Open to contributions — fix bugs, add colleges, improve UI.

---

*Made with ❤️ for engineering students*
