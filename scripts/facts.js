

function createFacts() {
    const outerDiv = document.querySelector(".facts-body");
    var numOfFacts;
    db.collection("facts").get().then((querySnapshot) => {
        var numOfFacts = querySnapshot.size;
        console.log("Amount of documents in collection: " + numOfFacts);
        const containers = [];
        const facts = [];
        const descriptions = [];

        for (let x = 0; x < numOfFacts; x++) {
            db.collection("facts").doc("fact" + x)
                .onSnapshot(factDoc => {
                    const innerDiv = document.createElement("div")
                    innerDiv.classList.add("fact-container");
                    const newDiv = document.createElement("div")
                    newDiv.classList.add("fact")

                    if (factDoc.data().type == "aluminum") {
                        var imageLink = "./images/can.png"
                        var type = "aluminum"
                    } else if (factDoc.data().type == "glass") {
                        var imageLink = "./images/glass.png"
                        var type = "glass"
                    }

                    let sourceLink = factDoc.data().source;
                    let quote = factDoc.data().quote;

                    newDiv.innerHTML = '<img src="' + imageLink + '"class="' + type + '"><span id="fact' + x + '-goes-here" class="title"></span><div class="fact info"><a href=' + sourceLink + ' class="description" target="_blank"><span style="text-decoration: underline;">Source</span></a></div>';
                    innerDiv.appendChild(newDiv);
                    outerDiv.appendChild(innerDiv);
                    containers.push(newDiv);
                    facts.push(quote);
                    descriptions.push(sourceLink);
                    for (let x = 0; x < containers.length; x++) {
            
                        const factGoesHereId = "fact" + x + "-goes-here";
            
                        document.getElementById(factGoesHereId).innerHTML = facts[x];
                    }
            })
        }
    });
}
localStorage.setItem("stack", 0);
