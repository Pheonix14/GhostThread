import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import crypto from 'crypto';
import ejs from 'ejs';
import session from "express-session";
import cookieParser from "cookie-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));

// http server and socket.io server
const app = express();
const server = createServer(app);
const io = new Server(server, {});

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.use(express.static(join(__dirname, "views")));
app.set("views", join(__dirname, "views"));

// express session and cookie
const MemoryStore = session.MemoryStore;
app.use(cookieParser());
app.use(
  session({
    store: new MemoryStore(),
    secret: await generateRandomSecret(),
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 2 * 60 * 60 * 1000, secure: false }, // Set to true for HTTPS only
  }),
);

// Use the URL-encoded body parser
app.use(express.urlencoded({ extended: true }));

// express routing
app.get("/", (req, res) => {
  res.render("home");
})

app.get('/join', (req, res) => {
    res.render("join");
});

app.get('/create', (req, res) => {
    res.render("create");
});

app.get('/chat/:roomcode', authenticate, (req, res) => {
  
  const { roomcode } = req.params;
    const username = req.session.user;
  
    res.render("chat", { username: username, roomcode: roomcode });
});

// express post request

app.post("/join", async (req, res) => {
  const { username, roomcode } = req.body;

  if (!roomcode) {
    return res.status(400).send("Invalid Room Code");
  }

  res.cookie("loggedIn", true);
  res.cookie("loggedInUser", username);
  req.session.user = username;
  req.session.loggedIn = true;
  return res.redirect(`/chat/${roomcode}`);
});


// socket.io
io.on('connection', (socket) => {
  
  socket.on('join', (room) => {
    socket.join(room);
  });
  
  socket.on('chat message', (msg) => {
    io.to(data.room).emit('chat message', msg);
  });
});


// auth function
function authenticate(req, res, next) {
  // Check if the user is logged in
  if (req.session.loggedIn) {
    next();
  } else {
    // Check if there is a loggedInUser cookie and restore the session
    if (req.cookies.loggedIn) {
      req.session.loggedIn = true;
      req.session.user = req.cookies.loggedInUser;
      req.session.loggedIn = true;
      return next();
    }
    // User is not logged in, redirect to the login page
    res.redirect("/");
  }
}

// generate random secret
function generateRandomSecret() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString("hex"));
      }
    });
  });
}

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});