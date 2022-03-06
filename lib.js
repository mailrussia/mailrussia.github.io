const axios = require('axios');
const fetch = require('node-fetch');
const emailExistence = require('email-existence');
const fs = require('fs');
const credentials = require('./credentials.json');

function getAxiosSearchConfig(lat,lon,radius,type) {
    return {
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}%2C${lon}&radius=${radius}&type=${type}&key=${credentials.key}`,
        headers: {}
    }
}

function getAxiosPlaceConfig(placeId) {
    return {
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id%2Ctypes%2Cwebsite%2Cname%2Cgeometry%2Cformatted_phone_number&key=${credentials.key}`,
        headers: { }
    };
}

function findEmailAddresses(stringObj) {
    const regex = /[a-z0-9.]+@[a-z.]+\.(ru|com|org|edu|moscow)+/img
    return new Set(stringObj.match(regex));
}

const scanWebPage = async (url) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const startTime = Date.now();
        const response = await fetch(url, { signal: controller.signal });
        const fetchTime = Date.now() - startTime;
        console.log(fetchTime, url);
        const body = await response.text();
        clearTimeout(timeoutId)
        return Array.from(findEmailAddresses(body));
    }
    catch (e) {
        console.log('no response: ', url, e.message);
        return '';
    }
};

function getPlaces(lat, lon, radius, placeTypes) {
    return new Promise(async resolve => {
        const responses = await Promise.all(placeTypes.map(pt => axios(getAxiosSearchConfig(lat,lon,radius,pt))));
        const placeIds = responses.map(r => r.data.results.map(res => res.place_id)).flat();
        const placeResponses = await Promise.all(placeIds.map(pid => getAxiosPlaceConfig(pid)).map(apc => axios(apc)))
        const placeInfos = placeResponses.map(placeResponse => placeResponse.data.result).filter(placeInfo => placeInfo.website);

        console.log(placeInfos.length, 'PLACES WITH WEBSITES');

        const placeEmailInfos = await Promise.all(placeInfos.map(async placeInfo => ({...placeInfo, emails: await scanWebPage(placeInfo.website)})));
        // console.log(placeEmailInfos.filter(p => p.emails.length > 0));
        resolve(placeEmailInfos.filter(p => p.emails.length > 0));
    })
}

module.exports = {
    getPlaces
}