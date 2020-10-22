const express = require('express');
const mongoose = require('mongoose');
const dbConnection = require('./configs/index');
const tasksRouter = require('./routes/tasks');
const usersRouter = require('./routes/users');
var session = require('express-session');
const app = express();
const port = 6000

app.use(express.json());
app.use(session({
  secret: 'secretSession', 
  resave: false, 
  saveUninitialized: true
}))


mongoose.connect(dbConnection.mongo.db_connection, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on('error', (err) => console.error(err))
db.once('open', () => console.log('Connected to DB yow.'))

app.use('/tasks', tasksRouter);
app.use('/users', usersRouter);

app.listen(port, () => {
  console.log(`We Server Runnin' on Port ${port}`)
})
