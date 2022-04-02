const express = require('express')
const app = express()
const bodyParser = require('body-parser')
let sqlite3 = require('sqlite3').verbose();

let database = new sqlite3.Database('myshop.db')
app.use(bodyParser.urlencoded({ extended: true }))
app.post('/login/:username/:password', (request, response) => {
    console.log(request.params.username);
    console.log(request.params.password);
    response.send(request.params.username)
})
app.post('/login', (request, response) => {
    response.send(request.body.username)
})
app.listen(3000)