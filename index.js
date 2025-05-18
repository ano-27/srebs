// creating server using express

const express = require('express');
const { dbConnection } = require('./models/index.js');
const cookie = require('cookie-parser');
const exphbs = require('express-handlebars');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const apiRouter = require('./route/apiRoutes.js');
const viewRouter = require('./route/viewRoutes.js');

const app = express();

app.use(cors({  // Cookies across devices
    origin: 'http://192.168.0.127:8081',
    credential: true
}))
app.use(express.static('public'));  //  Express will serve everything in public/ as if it were the root /

app.use(express.json());            // Middleware to parse req.body
app.use(express.urlencoded({ extended: true }));

app.use(cookie());                  // Middleware to parse cookie
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.use('/api', apiRouter);         // Middleware to handle requests at url '/api'
app.use('/', viewRouter);

const startServer = async () => {
    try {
        await dbConnection(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD);
        app.listen(8081, '0.0.0.0', () => {    // Start Server when everything is set up
            console.log('Server is running at:', 8081);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
}

startServer();