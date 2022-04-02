const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
// app.all('*', function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
//     // res.setHeader("Content-Type", "application/json;charset=utf-8"); 
//     next();
// });
app.get('/', (request, response) => {

    response.setHeader('Access-Control-Allow-Origin', '*')
    response.send('hello get no header')
})

app.get('/status', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.statusCode = 201
    response.end()
})

app.post('/', multipartMiddleware, (request, response) => {
    console.log(request.body);
    response.setHeader('Access-Control-Allow-Origin', '*')
    if (request.body.id === '181870132' && request.body.password === 'fred@nxb21') {
        response.send(JSON.stringify({
            correct: true,
            time: Date.now()
        }))
    }
    else {
        response.send(JSON.stringify({
            correct: false,
            time: Date.now()
        }))
    }
})

app.get('/todos', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.send('get todos')
})

app.get('/todos/:id', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*')
    // response.send('hello todos')
    response.send(request.params.id)
})

app.get('/cauldron/hit', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.send('suicide')
})

app.post('/todos', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.send('post todos')
})

app.listen(3000, () => {
    console.log('server running at http://localhost:3000/');
})