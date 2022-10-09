import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';

import { Logger } from './logger/Logger';
import { userRoute } from './routes/UserRoutes';

const server = express();

server.listen(5000, () => {
    console.log('Server is running 🚀 ');
});



// dynamic assets - SSR (Server Side Rendering)

// middleware
server.use(Logger.consoleLog);
// static assets - API
server.use(express.static(path.resolve(__dirname, './html/public')));

server.use('/api/users', userRoute);

//query
// get('/api/v1/query)
// req.query

// const { search, limit } = req.query


// route parametes
// get('/api/v1/products/:productID')
// req.params
server.get('/api/about', (req, res) => {
    res.status(200).send('About page');
});

server.all('*', (req, res) => {
    res.status(404).send('<h1> resource not found </h1>');
});


// server.get();
// server.post();
// server.delete();
// server.put();
// server.use();
// server.all();