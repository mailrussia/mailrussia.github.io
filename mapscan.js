const fs = require('fs');
const getPlaces = require('./lib').getPlaces;

async function scanPlaces(latPoint,lonPoint,radius,placeTypeGroups,ignoredPlaceIds) {

    const foundPlaces = require('./places.json');
    console.log('START: ', Object.keys(foundPlaces).length, 'PLACES');

    for (const placeTypes of placeTypeGroups) {
        const newPlaces = await getPlaces(latPoint,lonPoint,radius,placeTypes,Object.keys(foundPlaces));

        newPlaces.acceptedPlaces.forEach(newPlace => {
            foundPlaces[newPlace.place_id] = {
                name: newPlace.name,
                site: newPlace.website,
                types: newPlace.types.filter(t => t !== 'point_of_interest' && t !== 'establishment'),
                coordinates: [newPlace.geometry.location.lat, newPlace.geometry.location.lng]
            };
            console.log(newPlace.name, newPlace.emails, newPlace.types.filter(t => t !== 'point_of_interest' && t !== 'establishment'));
        })
        newPlaces.rejectedPlaceIds.forEach(pid => {
            foundPlaces[pid] = 0;
        })
    }

    fs.writeFile('places.json', JSON.stringify(foundPlaces), (err) => {
        if (err) {
            console.error(err);
        }
    })

    return Promise.resolve();

}


const min = [55.61849144622079, 37.454070398399615];
const max = [55.872812648938705, 37.78628594067161];

const latPoint = (Math.random() * (max[0] - min[0])) + min[0];
const lonPoint = (Math.random() * (max[1] - min[1])) + min[1];
// const latPoint = 55.83426763729049;
// const lonPoint = 37.48901534551857;
const latStep = (max[0]-min[0])/50;
const lonStep = (max[1]-min[1])/50;
const latPoints = Array.apply(null,{length: 51}).map((a,index) => { return min[0] + index*latStep; });
const lonPoints = Array.apply(null,{length: 51}).map((a,index) => { return min[1] + index*lonStep; });

const radius = 300;

const placeTypeGroups = [
    ['airport','amusement_park','aquarium','art_gallery','bakery','bar','beauty_salon','store','bicycle_store'],
    ['book_store','bowling_alley','cafe','campground','car_dealer','car_rental','car_repair','car_wash','casino','cemetery'],
    ['church','clothing_store','convenience_store','department_store','doctor','drugstore','electrician','electronics_store','florist','funeral_home'],
    ['furniture_store','gas_station','gym','hair_care','hardware_store','hindu_temple','home_goods_store','hospital','insurance_agency','jewelry_store'],
    ['laundry','lawyer','library','liquor_store','locksmith','lodging','meal_delivery','meal_takeaway','mosque','movie_rental'],
    ['movie_theater','moving_company','museum','night_club','painter','park','parking','pet_store','pharmacy','physiotherapist'],
    ['plumber','post_office','primary_school','real_estate_agency','restaurant','roofing_contractor','rv_park','school','secondary_school','shoe_store'],
    ['shopping_mall','spa','stadium','storage','supermarket','synagogue','tourist_attraction','travel_agency','veterinary_care','zoo'],
];
// const placeTypeGroups = [
//     ['store'],
// ];

// const nPlacesStart = Array.from(foundPlaces).length;

(async () => {

    const startLat = 20;
    const nLat = 5;
    const startLon = 20;
    const nLon = 5;

    for (let iLat = startLat; iLat<startLat+nLat; iLat++) {
        for (let iLon = startLon; iLon<startLon+nLon; iLon++) {
            try {
                console.log(latPoints[iLat],lonPoints[iLon]);
                await scanPlaces(latPoints[iLat], lonPoints[iLon], radius, placeTypeGroups);
            }
            catch (e) {

            }
        }
    }

    // await scanPlaces(latPoint, lonPoint, radius, placeTypeGroups);

    console.log('READY!');

})()

module.exports = {
    getPlaces
}