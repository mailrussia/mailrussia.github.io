const express = require('express');
const cors = require('cors');
const getPlaces = require('./lib').getPlaces;

const placeTypes = ['store', 'lodging', 'beauty_salon', 'gym', 'cafe', 'bar', 'restaurant'];

const min = [55.61849144622079, 37.454070398399615];
const max = [55.872812648938705, 37.78628594067161];

const dataApp = express();
const port = 4444;
dataApp.use(cors());

dataApp.get('/api/emails', async (req, res) => {

    const latPoint = (Math.random() * (max[0] - min[0])) + min[0];
    const lonPoint = (Math.random() * (max[1] - min[1])) + min[1];
    const radius = 300;
    console.log(latPoint,lonPoint);

    const emailsArray = [];

    const ppp = await getPlaces(latPoint, lonPoint, radius, placeTypes);
    console.log(ppp);

    res.contentType("application/json");
    console.log('READY!');
    res.write(JSON.stringify(ppp));
    res.end();
});

dataApp.listen(port, () => {
    console.log('\x1b[31;1mserver listening on port 9000\x1b[0m');
});

