const PORT = 3000
const express = require('express')
const server = express()

const morgan = require('morgan')
server.use(morgan('dev'))

server.use(express.json())

const apiRouter=require('./api')
server.use('/api', apiRouter)

server.use((req, res, next)=>{
    console.log("logger started")
    console.log(req.body)
    console.log("logger ended")
    next()
})



server.listen(PORT, ()=>{
    console.log(`Server is listening up on port: ${PORT}`)
})

