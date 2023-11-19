//---------------------------------------------------
// This function loads the parts of your skeleton 
// (navbar, footer, and other things) into html doc. 
//---------------------------------------------------
function loadSkeleton() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            //if the pointer to "user" object is not null, then someone is logged in
            // User is signed in.
            // Do something for the user here.
            // console.log($('#navbarPlaceholder').load('./text/nav_after_login.html'));
            console.log($('#footerPlaceholder').load('./text/footer.html'));
        } else {
            // No user is signed in.
            // console.log($('#navbarPlaceholder').load('./text/nav_before_login.html'));
            console.log($('#footerPlaceholder').load('./text/footer.html'));
        }
    });
}
loadSkeleton();  //invoke the function

function addMenuListener(item) {
    console.log(item);
    document.getElementById(item).addEventListener("click", () => {
        passValue(item);
    })
}

function passValue(item) {
    localStorage.setItem("location", item);
    console.log("clicked..." + item);
    window.location.href = "./search_info.html";
}

addMenuListener("SE06");
addMenuListener("SE02");
addMenuListener("SW02");

/* Load locations JSON API data (generated by Mockaroo) to Firestore */
// Developed by Jimmy

async function readJSONbin() {
    const response = await fetch(
        'https://my.api.mockaroo.com/recycling_bins.json?key=95977410'
    )
    const data = await response.text(); //get text file, string
    const bins = JSON.parse(data); //convert to JSON

    for (bin of bins) {
        let name = bin.name;

        db.collection("bins").add({
            bin_id: bin["bin_id"],
            street: bin.street,
            city: bin.city,
            province: bin.province,
            country: bin.country,
            lat: bin.lat,
            lng: bin.lng,
            material_type: bin["material_type"]
        });
    }
}

/* Redirects to map.html by click event 
 * and stores the document ID of recycling locations
 */
// Developed by Jimmy

document.getElementById("first-location").addEventListener("click", function (event) {
    window.location.href = "./map.html";
});
localStorage.setItem("docID1", "6aKItibiBjY2cDWrA89u");

document.getElementById("second-location").addEventListener("click", function (event) {
    window.location.href = "./map.html";
});
localStorage.setItem("docID2", "EKck6GUBPubHSrBZ6v8f");

document.getElementById("third-location").addEventListener("click", function (event) {
    window.location.href = "./map.html";
});
localStorage.setItem("docID3", "EkvT4ux1fSxodGsX89Z8");

// Developed by Leo

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d * 1000; // Distance in meters
}

function getGeolocation() {
    if ("geolocation" in navigator) {
        // Check if geolocation is supported
        navigator.geolocation.getCurrentPosition(function (position) {
            // This function is the success callback

            // Get current time
            let now = new Date();
            let time = now.toLocaleTimeString(); // Converts the time to a string using locale conventions.

            // Extract lat and long
            var lat1 = position.coords.latitude;
            var long1 = position.coords.longitude

            var targetlat = localStorage.getItem("lat");
            var targetlong = localStorage.getItem("lng");

            // Calculate distance in meters, and get radius input
            for (let x = 1; x <= 3; x++) {
                currentLocation = db.collection("bins").doc(localStorage.getItem("docID" + x));
                console.log(localStorage.getItem("docID" + x));
                currentLocation.get().then(bin => {
                    lat = bin.data().lat;
                    lng = bin.data().lng;
                    console.log(bin.data().street);
                    var d = getDistanceInMeters(lat1, long1, lat, lng);
    
                    if (d < 1000) {
                        document.getElementById("distancePlaceHolder" + x).innerHTML = d.toFixed(0) + "m";
                    } else {
                        document.getElementById("distancePlaceHolder" + x).innerHTML = (d / 1000).toFixed(0) + "km";
                    }
                });
            }


            /**
             * Check if user's position is within radius
             * If it is within radius, then a navigation buttons pops up to guide them to the rewards.html to claim rewards 
             * after they have recycled (We trust the user to do this, no validation function so far).
             */

        }, function (error) {
            // This function is the error callback
            console.error("Error occurred: " + error.message);
        });
    } else {
        // Geolocation isn’t available
        console.error("Geolocation is not supported by this browser.");
    }
}

getGeolocation();