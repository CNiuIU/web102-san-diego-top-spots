let map;
let markers = [];
let userLocation;

//function for GoogleMaps API, display map when page loads
//google.maps.Map --> constructor provided by GoogleMaps Javascript API
//getElementById search HTML for id="map" to know where to display map
//zoom and center to set up map for user
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: { lat: 32.7157, lng: -117.1611 } // Default center: San Diego
    });
}

//calculator of distance
//distance between two points on a sphere using lat and long
//this is called haversine
//trig functions in JS works with radians, so need Radians
//radians = degrees x (pi/180)
//working with miles, so it's 3958.8, if it was km, it would be 6371

function haversineDistance(coords1, coords2) {
    const toRad = (x) => x * Math.PI / 180;
    const R = 3958.8; // miles
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a = Math.sin(dLat / 2) ** 2 +
              Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

//markers on map and rows to the table
//creating GoogleMaps marker
//creating info window (description) when interacting with marker
//mouseover event when user hovers over marker
//and another event when mouse leaves the marker

//in the "Link" column, create GoogleMaps URL using Lat and Long pulled from data.json
//with the URL, can go to GoogleMaps

function addMarkersAndRows(spots) {
    const tbody = $('#spots-table tbody');
    tbody.empty();

    spots.forEach(spot => {
        // Add marker
        const position = { lat: spot.location[0], lng: spot.location[1] };
        const marker = new google.maps.Marker({
            position,
            map,
            title: spot.name
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `<h3>${spot.name}</h3><p>${spot.description}</p>`
        });

        marker.addListener('mouseover', () => {
            infoWindow.open(map, marker);
        });
        marker.addListener('mouseout', () => {
            infoWindow.close();
        });

        markers.push(marker);

        // Add table row
        const googleLink = `https://www.google.com/maps?q=${spot.location[0]},${spot.location[1]}`;
        tbody.append(`
            <tr>
                <td>${spot.name}</td>
                <td>${spot.description}</td>
                <td>${spot.distance ? spot.distance.toFixed(2) : ''}</td>
                <td><a href="${googleLink}" target="_blank">Open in Google Maps</a></td>
            </tr>
        `);
    });
}

//checkc if browser can have GPS
//getCurrentPosition, asks the user for GPS info
//read lat and long and stores in userLocation
//center map around user
//marker on "your location"
//if user denies GPS, it still loadSpots(), that's the "else" in "if else"
function getUserLocationAndLoadSpots() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            map.setCenter(userLocation);
            new google.maps.Marker({
                position: userLocation,
                map,
                title: "Your Location",
                icon: { url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }
            });

            loadSpots();
        }, () => {
            loadSpots(); // fallback without user location
        });
    } else {
        loadSpots();
    }
}

//find data.json and grab the data to populate website with
//if userLocation, use that variable in other function/maths
//calculate distance from where user is at to whereever
function loadSpots() {
    $.getJSON('data.json', data => {
        let spots = data;

        if (userLocation) {
            spots.forEach(spot => {
                const spotCoords = { lat: spot.location[0], lng: spot.location[1] };
                spot.distance = haversineDistance(userLocation, spotCoords);
            });

            spots.sort((a, b) => a.distance - b.distance);
        }

        addMarkersAndRows(spots);
    });
}
//run code when webpage is loaded
//initialize map and get userLocation GPS
$(document).ready(() => {
    initMap();
    getUserLocationAndLoadSpots();
    

});