# BLOG-PLATFORM---DEPOT
It is  a blogging platform where users can write and publish their own blogs, similar to platforms like Medium , instagram etc.  Users will be able to create posts, edit them, delete them, and interact with other users through comments and likes. It is similar to the social media platform like instagram , facebook  but in different terms .

This is a complete, tested blog platform — Node.js + Express + MongoDB (Mongoose) + EJS. I actually ran it (rendered every template, booted the server, hit every route) and fixed a real bug I found (EJS 3 requires <%- include('path') %> syntax, not the old <% include path %>).
What's included:



<img width="935" height="605" alt="image" src="https://github.com/user-attachments/assets/f0160f6a-8289-44ce-a55c-6b0663b51e5b" />



Auth: register/login/logout with bcrypt-hashed passwords, sessions stored in MongoDB
Posts: create, read, edit, delete — only the owner can edit/delete (enforced server-side, not just hidden in the UI)
Comments: add/delete, only comment owner can delete their own
Likes: toggle like/unlike per post
Dashboard: "my posts" view with stats
Search: filter posts by title
Clean CSS (Medium-inspired), no framework dependency
.env.example, .gitignore, README.md with setup steps, LICENSE — ready to push straight to GitHub


<img width="1920" height="1200" alt="image" src="https://github.com/user-attachments/assets/7e4e5aba-5c6e-4834-9b10-aca5a4289dfe" />



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


<img width="1857" height="836" alt="image" src="https://github.com/user-attachments/assets/9d52be6c-18e3-4d24-914b-2a2625a06c36" />



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


<img width="1107" height="513" alt="image" src="https://github.com/user-attachments/assets/fd8bd61c-420b-42b8-8386-3892ca1a5a46" />


### 2. Clone & Install
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd blog-platform
npm install
```

<img width="1920" height="1200" alt="image" src="https://github.com/user-attachments/assets/261af559-3901-4549-9a3a-ede2fc347126" />




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


<img width="1066" height="562" alt="image" src="https://github.com/user-attachments/assets/4e762f73-802b-493a-b288-69b56147410c" />



### 4. Run the app
```bash

<img width="1262" height="608" alt="image" src="https://github.com/user-attachments/assets/9834be8d-b754-4691-b99e-8143b7311005" />



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
