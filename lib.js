const axios = require('axios');
const fetch = require('node-fetch');
const emailExistence = require('email-existence');
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

async function checkEmailExistence(emailAddress) {
    return new Promise((resolve, reject) => {
        emailExistence.check(emailAddress, (error, exists) => {
            if (error) resolve(false);
            resolve(exists);
        });
    })
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

        const emailAddressChecks = Array.from(findEmailAddresses(body)).filter(async emaddr => await checkEmailExistence(emaddr));
        const emailAddresses = await Promise.all(emailAddressChecks);

        return Array.from(emailAddresses);
    }
    catch (e) {
        console.log('no response: ', url, e.message);
        return '';
    }
};

function getPlaces(lat, lon, radius, placeTypes, ignoredPlaces) {
    return new Promise(async resolve => {
        const responses = await Promise.all(placeTypes.map(pt => axios(getAxiosSearchConfig(lat,lon,radius,pt))));
        const placeIds = responses.map(r => r.data.results.map(res => res.place_id)).flat().filter(pid => !ignoredPlaces.includes(pid));
        const placeResponses = await Promise.all(placeIds.map(pid => getAxiosPlaceConfig(pid)).map(apc => axios(apc)))
        const placeInfos = placeResponses.map(placeResponse => placeResponse.data.result).filter(placeInfo => placeInfo.website);
        console.log(placeInfos.length, 'PLACES WITH WEBSITES');
        const placeEmailInfos = await Promise.all(placeInfos.map(async placeInfo => ({...placeInfo, emails: await scanWebPage(placeInfo.website)})));
        // console.log(placeEmailInfos.filter(p => p.emails.length > 0));
        const acceptedPlaces = placeEmailInfos.filter(p => p.emails.length > 0);
        console.log(acceptedPlaces.length, 'PLACES WITH EMAIL ADDRESSES');
        const acceptedPlaceIds = acceptedPlaces.map(ap => ap.place_id);
        const rejectedPlaceIds = [...placeIds].filter(pid => !acceptedPlaceIds.includes(pid));
        resolve({acceptedPlaces, rejectedPlaceIds});
    })
}

module.exports = {
    getPlaces
}