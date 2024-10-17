const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');  // 

const app = express();
const PORT = 3300;

// Middleware
app.use(cors());  //  CORS 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

//  MongoDB ( Docker)
mongoose.connect('mongodb://mongodb:27017/sensorDB', {  //  'localhost'  'mongodb'
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

//  schema 
const sensorSchema = new mongoose.Schema({
    lightLevel: { type: Number, required: true },
    switchStatus: { type: Boolean, required: true },
    timestamp: { type: Date, default: Date.now }
});

//  schema
const SensorData = mongoose.model('SensorData', sensorSchema);

// 
let lastSensorData = {};

// Endpoint 
app.post('/sensor-data', (req, res) => {
    const lightLevel = req.body.lightLevel;
    const switchStatus = req.body.switchStatus;
    const apiKey = req.body.apiKey;

    //  API Key
    const validApiKey = 'vCzQ5wGGWHzFtWum8oBE9qlcc731eAE3G4BHmmrcFfOvt7Ho47wlaPItctszAdztecoyMDKe9GuzOMQ9YoOLCOF0RuIUGIvd34Aqq5QB5SXgk2ScSHvkpcLcKBTyuzLH';
    if (apiKey !== validApiKey) {
        return res.status(403).send('Invalid API Key');
    }

    // 
    lastSensorData = {
        lightLevel: lightLevel,
        switchStatus: switchStatus
    };

    // 
    const sensorData = new SensorData({
        lightLevel: lightLevel,
        switchStatus: switchStatus
    });

    // 
    sensorData.save()
        .then(() => {
            console.log('Data saved:', lastSensorData);
            res.send('Data received and saved to MongoDB');
        })
        .catch(error => {
            console.error('Error saving data:', error);
            res.status(500).send('Error saving data to MongoDB');
        });
});

// Endpoint 
app.get('/sensor-data', (req, res) => {
    res.json(lastSensorData);  //  JSON
});

//  endpoint  index.html ( 'public')
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

