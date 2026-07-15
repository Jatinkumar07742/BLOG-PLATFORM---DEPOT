# BlogSpace — A Medium-like Blogging Platform

A full-stack blogging platform built with **Node.js**, **Express**, **MongoDB (Mongoose)**, and **EJS**. Users can register, log in, write/edit/delete their own blog posts, and interact with other users through **comments** and **likes**.

## Features

- **Authentication & Authorization**
  - Secure registration and login with hashed passwords (bcrypt)
  - Session-based auth, persisted in MongoDB (survives server restarts)
  - Only logged-in users can create, edit, or delete posts
  - Only the post's owner can edit/delete it; only a comment's owner can delete it
- **Create & Manage Blogs**
  - Create posts with a title, content, and optional cover image
  - Edit and delete your own posts
  - Personal dashboard showing all your posts with stats
- **Comments System**
  - Any logged-in user can comment on a post
  - Comment owners can delete their own comments
- **Like System**
  - Logged-in users can like/unlike a post (toggle)
- **Search**
  - Search posts by title from the home page

## Tech Stack

| Layer     | Technology                          |
|-----------|--------------------------------------|
| Runtime   | Node.js                              |
| Framework | Express.js                           |
| Database  | MongoDB + Mongoose ODM               |
| Views     | EJS (server-rendered templates)      |
| Auth      | express-session + connect-mongo + bcryptjs |
| Styling   | Plain CSS (no framework)             |

## Project Structure

```
blog-platform/
├── config/
│   └── db.js              # MongoDB connection
├── middleware/
│   └── auth.js            # isLoggedIn, isLoggedOut, isPostOwner guards
├── models/
│   ├── User.js
│   ├── Post.js
│   └── Comment.js
├── routes/
│   ├── auth.js             # register/login/logout
│   └── posts.js            # CRUD, likes, comments
├── views/
│   ├── auth/                (login.ejs, register.ejs)
│   ├── posts/                (index, show, new, edit, dashboard)
│   ├── partials/             (header.ejs, footer.ejs)
│   └── error.ejs
├── public/
│   └── css/style.css
├── server.js               # app entry point
├── package.json
├── .env.example
└── .gitignore
```

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+
- A MongoDB database — either:
  - Local MongoDB (`mongodb://127.0.0.1:27017`), or
  - A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster

### 2. Clone & Install
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd blog-platform
npm install
```

### 3. Configure environment variables
Copy the example file and fill in your own values:
```bash
cp .env.example .env
```
Edit `.env`:
```
MONGO_URI=mongodb://127.0.0.1:27017/blog-platform
SESSION_SECRET=some_long_random_string
PORT=3000
```

### 4. Run the app
```bash
# Development (auto-restarts on changes)
npm run dev

# Production
npm start
```

Visit **http://localhost:3000** in your browser.

## How It Works

1. A visitor registers for an account (username, email, password).
2. They log in — a session is created and stored server-side.
3. Logged-in users can click **Write** to publish a new blog post.
4. Anyone (logged in or not) can browse and read posts on the home page.
5. Logged-in users can **like/unlike** a post and **leave comments**.
6. On their **Dashboard**, users see only their own posts, with options to **edit** or **delete** each one.
7. Ownership checks are enforced server-side (`isPostOwner` middleware) so users can never edit or delete content they don't own, even by guessing URLs.

## Data Model / Relationships

- **User** `1 ──── *` **Post** (`Post.author` references `User`)
- **Post** `1 ──── *` **Comment** (`Post.comments` array of refs; `Comment.post` back-reference)
- **User** `1 ──── *` **Comment** (`Comment.author` references `User`)
- **Post** `* ──── *` **User** via `Post.likes` (array of `User` ids)

## Possible Next Steps

- Add pagination to the home page feed
- Add tags/categories and filter by tag
- Add rich text / markdown editor for post content
- Add user profile pages showing all posts by that author
- Add image upload (instead of URL-only cover images) via `multer` + cloud storage
- Convert to a REST API + separate React/Vue frontend

## License

MIT — free to use for learning, portfolio, or as a starting point for your own project.
