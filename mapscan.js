const getPlaces = require('./lib').getPlaces;

const min = [55.61849144622079, 37.454070398399615];
const max = [55.872812648938705, 37.78628594067161];

const latPoint = (Math.random() * (max[0] - min[0])) + min[0];
const lonPoint = (Math.random() * (max[1] - min[1])) + min[1];
const radius = 300;
console.log(latPoint,lonPoint);

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

const placeTypes = ['store', 'lodging', 'beauty_salon', 'gym', 'cafe', 'bar', 'restaurant', 'hair_care', 'spa'];
// const placeTypes = ['store'];

(async () => {
    for (const ptg of placeTypeGroups) {
        const places = await getPlaces(latPoint,lonPoint,radius,ptg);

        places.forEach(pi => {
            console.log(pi.name, pi.emails, pi.types.filter(t => t !== 'point_of_interest' && t !== 'establishment'));
        })
    }
})()

module.exports = {
    getPlaces
}