const path = require('path');
const http = require('http');
const express = require('express');
const session = require('express-session');
const socketIo = require('socket.io');
const mysql = require('mysql');
import { writeFileSync } from "fs";

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'Kiruahig20',
  database: 'myIRC'
})

connection.connect(function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Connected!")
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let myUsername = "";
let myUserId;
let myUser;
let allMessages = new Array;

// Tell express we will use these modules 
app.use(session({
  secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the public folder to enable acces to html files.
app.use(express.static(path.join(__dirname, 'public')));

// different route

app.get('/', (req, res) => {
  myUsername = req.session.username;
  myUserId = req.session.user_id;
  if(req.session.loggedin){
    res.sendFile(path.join(__dirname, ('/public/html/home.html')))
  }else{
    res.redirect("/login.html");
  }
})
app.get('/home', (req, res) => {
  myUsername = req.session.username
  myUserId = req.session.user_id
  if(req.session.loggedin){
    res.sendFile(path.join(__dirname, ('/public/html/home.html')))
  }else{
    res.redirect("/login.html");
  }
})

app.get('/admin', (req,res)=>{
  if(req.session.loggedin && req.session.user_role == 1){
    res.sendFile(path.join(__dirname, ('/public/html/admin.html')))
  }else{
    res.redirect("/login.html");
  }
})

app.get('/admin-message', (req,res)=>{
  if(req.session.loggedin && req.session.user_role == 1){
    res.sendFile(path.join(__dirname, ('/public/html/admin-message.html')))
  }else{
    res.redirect("/login.html");
  }
})

app.get('/groups.html', (req, res) => {
  if(req.session.loggedin){
    res.sendFile(path.join(__dirname, ('/public/html/groups.html')))
  }else{
    res.redirect("/login.html");
  }
})
app.get('/private.html', (req, res) => {
  if(req.session.loggedin){
    res.sendFile(path.join(__dirname, ('/public/html/private.html')))
  }else{
    res.redirect("/login.html");
  }
})
app.get('/chat.html', (req, res) => {
  if(req.session.loggedin){
    myUsername = req.session.username
    myUserId = req.session.user_id
    res.sendFile(path.join(__dirname, ('/public/html/chat.html')))
  }else{
    res.redirect("/login.html");
  }
})
app.get('/login.html', (req, res) => {
  if(req.session.loggedin){
    res.redirect("/");
  }else{
    res.sendFile(path.join(__dirname, ('/public/html/login.html')))
  }
})
app.get('/signup.html', (req, res) => {
  if(req.session.loggedin){
    res.redirect("/");
  }else{
    res.sendFile(path.join(__dirname, ('/public/html/signup.html')))
  }
})

app.post('/register', async function(req,res){
  await connection.query('SELECT * FROM users WHERE username = ?', [req.body.username], async function(error,results,fields){
    if(error) throw error;
    if(results.length > 0){
      res.redirect("/signup.html")
    }else if(results.length <= 0){
      await connection.query(`INSERT INTO users VALUES (0, '${req.body.username}', '${req.body.password}', '${req.body.name}', CURRENT_TIMESTAMP)`, function (err, result){
        if (err) {
          throw err;
        }
        if(result){
          res.redirect("/login.html")
        }
      })
    }
  })
})

  // Route to check informations sent from the login page 
app.post('/auth', async function(request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		await connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {   
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
        request.session.user_id = results[0].user_id;
        request.session.user_role = results[0].role;
				// Redirect to home page
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});


// Route to disconnect , we empty the session variables and redirect to connection page
app.get('/logout', function(req,res){
  req.session.loggedin = false;
  req.session.username = "";
  req.session.user_id = "";
  req.session.user_role = "";
  res.redirect('/login.html')
})

// Route to display the message the admin searched
app.post('/display_messages', async function(req,res){
  if(req.session.loggedin && req.session.user_role == 1){
    // Empty the previous messages array if it exists
    allMessages = [];
    // Get the input from the dates sent in the form
    let firstMessageDate = req.body.first_message_date
    let secondMessageDate = req.body.second_message_date
    // Search the messages between two dates
    let mySqlQuery = `SELECT * FROM messages WHERE date_sent BETWEEN '${firstMessageDate}' AND '${secondMessageDate}'`
    await connection.query(mySqlQuery, function(err, results){
      if (err) throw err;
      if(results){
        results.forEach(result => {
          // Push this into the array, example => "ID : 10 (Sat Apr 06 2024 07:51:19 GMT+0000 (Coordinated Universal Time)) Message :Hello World"
          allMessages.push(`ID : ${result.sender_id} (${result.date_sent}) Message :${result.message_content} `);
        });
        allMessages.forEach(message => {
          writeFileSync('public/logs/admin-searched-msg.txt', message + "\n", {flag: 'a+'});
        });
        res.redirect('/admin-message')
      }
    })
  }else{
    res.redirect("/login.html");
  }
})

// Start when someone join the server
io.on('connection', socket => {
  socket.username = myUsername;
  socket.userId= myUserId;
  socket.on('join-room', roomName =>{
    socket.join(roomName)
    
    // Broadcast = tout le monde sauf la personne qui déclanche le on. Et IO pour tout le monde
    socket.broadcast.to(roomName).emit('join-message', `${socket.username} connected`);

    // socket pour la personne qui se connecte
    socket.to(roomName).emit('message', 'Welcome on our chat');
    
    // Utilisation des messages récuperés sur le server
    socket.on('message-chat', message => {
      let sqlMessage = message.replace(/'/g, "\\'");
      writeFileSync('public/logs/chat.txt', message + "\n", {flag: 'a+'});
      let sqlQuery = `INSERT INTO messages (conversation_id, sender_id, message_content, date_sent) VALUES ('${1}','${socket.userId}','${sqlMessage}',CURRENT_TIMESTAMP)`

      connection.query(sqlQuery, function(err, result){
        if (err) throw err;
      })
      // print your own message
      socket.emit('message-received', `You : ${message}`);
      // print message for the others
      socket.broadcast.to(roomName).emit('message-other-received', `${socket.username} : ${message}`)
    });

  })


  // Envoi de la liste des messages pannel admin
  socket.on('admin-messages',()=>{
    socket.emit('display-messages', allMessages)
  })
});

const PORT = 4000

server.listen(PORT, () => console.log(`server running on port ${PORT}`));