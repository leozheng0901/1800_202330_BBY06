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

// document.getElementById("first-location").addEventListener("click", function (event) {
//     window.location.href = "./map.html";
//     localStorage.setItem("docID", "6aKItibiBjY2cDWrA89u");
// });
// localStorage.setItem("docID1", "6aKItibiBjY2cDWrA89u");

// document.getElementById("second-location").addEventListener("click", function (event) {
//     window.location.href = "./map.html";
//     localStorage.setItem("docID", "EKck6GUBPubHSrBZ6v8f");
// });
// localStorage.setItem("docID2", "EKck6GUBPubHSrBZ6v8f");

// document.getElementById("third-location").addEventListener("click", function (event) {
//     window.location.href = "./map.html";
//     localStorage.setItem("docID", "EkvT4ux1fSxodGsX89Z8");
// });
// localStorage.setItem("docID3", "EkvT4ux1fSxodGsX89Z8");

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

            /** Support function that calculates the distance */
            function getDistance(binLocation) {
                lat = binLocation.data().lat;
                lng = binLocation.data().lng;

                // Extract lat and long
                var lat1 = position.coords.latitude;
                var long1 = position.coords.longitude

                var d = getDistanceInMeters(lat1, long1, lat, lng);

                if (d < 1000) {
                    document.getElementById("distancePlaceHolder" + binLocation.data().bin_id).innerHTML = d.toFixed(0) + "m";
                } else {
                    document.getElementById("distancePlaceHolder" + binLocation.data().bin_id).innerHTML = (d / 1000).toFixed(0) + "km";
                }
            }

            // Loops through all the bins to get the locations
            db.collection('bins').get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    getDistance(doc);
                })
                sortDivs();
            })

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

function createLocations() {
    const container = document.querySelector('.searchList');
    db.collection("bins").onSnapshot((binDoc) => {
        binDoc.forEach((bin) => {

            const binID = bin.data().bin_id;
            const titleText = bin.data().street + ", " + bin.data().city;
            const materialsArray = bin.data().material_type.split(/[ ,]+/);

            /** Creating the containers */
            const outerDiv = document.createElement('div');
            outerDiv.classList.add('location-container');
            const innerDiv = document.createElement('div');
            innerDiv.classList.add('location');
            const innermostDiv = document.createElement('div');
            innermostDiv.setAttribute('class', 'location info');
            innermostDiv.setAttribute('id', binID);
            innermostDiv.addEventListener('click', function () {
                localStorage.setItem("docID", bin.id);
                console.log(localStorage.getItem("docID"))
                window.location.href = "./map.html";
            })

            /** More Info Button */
            const moreInfo = document.createElement('span');
            moreInfo.classList.add('types');
            moreInfo.setAttribute('id', binID);
            moreInfo.innerHTML = "More Info";
            moreInfo.addEventListener('click', function () {
                localStorage.setItem('docID', bin.id);
                console.log(binDoc);
                window.location.href = './search_info.html';
            })

            /** Title of Container */
            const title = document.createElement('span');
            title.setAttribute('id', 'title');
            title.innerHTML = titleText;

            /** Icon Container */
            const materialsContainer = document.createElement('div');
            materialsContainer.setAttribute('class', 'icon-container')

            switch (materialsArray.length) {
                case (1):
                    innermostDiv.style.height = "5vh";
                    innerDiv.style.height = "12vh";
                    break;
            }

            /** Content */
            materialsArray.forEach((recyclable) => {
                /** Icon */
                const materials = document.createElement('i');
                var icon = "";
                switch (recyclable.toLowerCase()) {
                    case ("plastic"):
                        icon = "fa-solid fa-bottle-water fa-lg";
                        break;
                    case ("paper"):
                        icon = "fa-solid fa-newspaper fa-lg";
                        break;
                    case ("organic"):
                        icon = "fa-solid fa-bacterium fa-lg";
                        break;
                    case ("glass"):
                        icon = "fa-solid fa-martini-glass fa-lg"
                        break;
                    case ("metal"):
                        icon = "fa-solid fa-plug fa-lg";
                        break;
                }

                /** Appending icons and their descriptions */
                const iconContainer = document.createElement('span');
                iconContainer.style.paddingTop = "0.8em";
                iconContainer.style.paddingBottom = "1.2em";
                iconContainer.style.display = "flex";
                iconContainer.style.justifyContent = "center";
                iconContainer.appendChild(materials);
                materials.setAttribute('class', icon);
                materialsContainer.appendChild(iconContainer);

                /** Description */
                const description = document.createElement('span');
                description.setAttribute('class', 'description');
                description.innerHTML = recyclable;

                /** Append */
                innermostDiv.appendChild(materialsContainer);
                innermostDiv.appendChild(description);
            })

            /** Appending distance placeholder */
            const distance = document.createElement('span');
            distance.setAttribute('class', 'distance');
            const distancePlaceHolderID = 'distancePlaceHolder' + bin.data().bin_id;
            const distancePlaceHolder = document.createElement('span');
            distancePlaceHolder.setAttribute('id', distancePlaceHolderID);
            distancePlaceHolder.setAttribute('class', 'sort');
            distance.appendChild(distancePlaceHolder);
            innermostDiv.appendChild(distance);

            /** Appending content */
            innerDiv.appendChild(moreInfo);
            innerDiv.appendChild(title);
            innerDiv.appendChild(innermostDiv);
            outerDiv.appendChild(innerDiv);
            container.append(outerDiv);
        })

    })
}

// Function to sort divs based on their values
function sortDivs() {
    var overallDiv = document.querySelector('.searchList');
    var outerDiv = document.querySelectorAll('.location-container');
    var divsToSort = [];

    for (let i = 0; i < outerDiv.length; i++) {
        divsToSort.push(outerDiv[i]);
    }

    var sortedDivs = Array.from(divsToSort).sort(function (a, b) {
        var valueA = parseInt(a.querySelector('.sort').textContent);
        var valueB = parseInt(b.querySelector('.sort').textContent);
        return valueA - valueB;
    });

    // Clear the outer div
    outerDiv.innerHTML = '';

    // Append the sorted divs
    sortedDivs.forEach(function (div) {
        overallDiv.appendChild(div);
    });

    localStorage.setItem('filter', 'None');
}

// Reads the custom range input
function customSort() {
    var overallDiv = document.querySelector('.searchList');
    const input = document.getElementById('range');
    var inputValue = input.value;
    localStorage.setItem("filter", inputValue);
    updateButtonText();

    if (/(?<!m)km/.test(input.value)) {
        inputValue = input.value.split('').filter(char => !"km".includes(char)).join('');
        inputValue *= 1000;
    } else if (/^(?!.*\bkm\b).*m.*$/.test(input.value)) {
        inputValue = input.value.split('').filter(char => !"m".includes(char)).join('');
    }

    var outerDiv = document.querySelectorAll('.location-container');
    var divsToSort = [];
    var filteredDivs = [];

    for (let i = 0; i < outerDiv.length; i++) {
        divsToSort.push(outerDiv[i]);
    }

    divsToSort = divsToSort.forEach(div => {
        var dist = div.querySelector('.sort').innerHTML
        if (/(?<!m)km/.test(div.querySelector('.sort').innerHTML)) {
            var distance = div.querySelector('.sort').innerHTML.split('').filter(char => !"km".includes(char)).join('');
            distance *= 1000;
            if (distance <= inputValue) {
                filteredDivs.push(div);
            }
        }
        if (dist.includes("m") && !dist.includes("km")) {
            var distance = div.querySelector('.sort').innerHTML.split('').filter(char => !"m".includes(char)).join('');
            if (distance <= inputValue) {
                filteredDivs.push(div);
            }
        }
    })

    var sortedDivs = Array.from(filteredDivs).sort(function (a, b) {
        var valueA = parseInt(a.querySelector('.sort').textContent);
        var valueB = parseInt(b.querySelector('.sort').textContent);
        return valueA - valueB;
    });

    // Clear the outer div
    overallDiv.innerHTML = '';

    // Append the sorted divs
    sortedDivs.forEach(function (div) {
        overallDiv.appendChild(div);
    });

}

// Listens for a click off screen to hide the menu
document.addEventListener('click', function (e) {

    // Defining all selectors
    var dropdown = document.querySelector('.dropdown-button');
    var dropdownContent = document.querySelector('.dropdown-content');
    var customInput = document.querySelector('#range');
    var oneHundred = document.querySelector('#hundred');
    var fiveHundred = document.querySelector('#fiveHundred');
    var kilometer = document.querySelector('#kilometer');
    var inputValue;

    // Support Function that will reorganize the divs
    function presetSort() {

        var overallDiv = document.querySelector(".searchList");
        var outerDiv = document.querySelectorAll('.location-container');
        var divsToSort = [];
        var filteredDivs = [];

        for (let i = 0; i < outerDiv.length; i++) {
            divsToSort.push(outerDiv[i]);
        }

        divsToSort = divsToSort.forEach(div => {
            var dist = div.querySelector('.sort').innerHTML;
            if (/(?<!m)km/.test(div.querySelector('.sort').innerHTML)) {
                var distance = div.querySelector('.sort').innerHTML.split('').filter(char => !"km".includes(char)).join('');
                distance *= 1000;
                if (distance <= inputValue) {
                    filteredDivs.push(div);
                }
            }
            if (dist.includes("m") && !dist.includes("km")) {
                var distance = div.querySelector('.sort').innerHTML.split('').filter(char => !"m".includes(char)).join('');
                if (distance <= inputValue) {
                    filteredDivs.push(div);
                }
            }
        })

        var sortedDivs = Array.from(filteredDivs).sort(function (a, b) {
            var valueA = parseInt(a.querySelector('.sort').textContent);
            var valueB = parseInt(b.querySelector('.sort').textContent);
            return valueA - valueB;
        });

        // Clear the outer div
        overallDiv.innerHTML = '';

        // Append the sorted divs
        sortedDivs.forEach(function (div) {
            overallDiv.appendChild(div);
        });
    }

    switch (e.target) {
        case (oneHundred):
            inputValue = 100;
            localStorage.setItem("filter", inputValue + "m")
            presetSort();
            break;
        case (fiveHundred):
            inputValue = 500;
            localStorage.setItem("filter", inputValue + "m");
            presetSort();
            break;
        case (kilometer):
            inputValue = 1000;
            localStorage.setItem("filter", inputValue + "m");
            presetSort();
            break;
    }

    updateButtonText();

    if (e.target == customInput || e.target == dropdown) {
        dropdownContent.style.display = 'flex';
    } else {
        dropdownContent.style.display = 'none';
    }
});

function updateButtonText() {
    var button = document.querySelector(".dropdown-button");
    button.innerHTML = localStorage.getItem("filter");
}

createLocations();
getGeolocation();
localStorage.setItem("stack", 0);

// Sortdivs gets ran but its not sorting properly (Prob because asynchronous behaviour?)
//Its clearing the outerDiv without reappending.