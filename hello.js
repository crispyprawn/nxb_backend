const express = require('express')

const app = express()

app.get('/server',(request, response) => {
    response.setHeader('Access-Control-Allow-Origin','*')
    response.send('hello ajax')
})



app.get('/jquery',(request,response) => {
    let jqueryCallback = request.query.callback;
    const data ={
        name:'atguigu',
        campus:['beijing','nanjing']
    }
    response.send(`${jqueryCallback}(${JSON.stringify(data)})`)
})

app.get('/jquery-jsonp',(request,response) => {
    let jqueryCallback = request.query.callback;
    // response.setHeader('Access-Control-Allow-Origin','*')
    const data ={
        name:'atguigu',
        campus:['beijing','nanjing']
    }
    response.send(`${jqueryCallback}(${JSON.stringify(data)})`)
    // response.send('hello jquery')
})

app.listen(8000,() => {
    console.log('server running at http://localhost:8000/');
})