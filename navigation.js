const startSelect = document.getElementById("startLocation");
const destinationSelect =
    document.getElementById("destinationLocation");

let routeLine = null;

let activeDestinationNode = null;

    const gpsOption = document.createElement("option");
gpsOption.value = "_GPS_";
gpsOption.textContent = "📍 Use My Location";
startSelect.appendChild(gpsOption);

// Add buildings to the two dropdown menus
locations.forEach(function (location) {
    const startOption = document.createElement("option");
    startOption.value = location.name;
    startOption.textContent = location.name;
    startSelect.appendChild(startOption);

    const destinationOption = document.createElement("option");
    destinationOption.value = location.name;
    destinationOption.textContent = location.name;
    destinationSelect.appendChild(destinationOption);
});


clearRouteButton = document.getElementById("clearRoute");

const showRouteButton = document.getElementById("showRoute");

  function findNearestRoadNode(x, y, maxDistance = Infinity) {
    let nearestNode = null;
    let shortestDistance = Infinity;

    roadNodes.forEach(function (node) {
        const distance = Math.sqrt(
            Math.pow(node.x - x, 2) +
            Math.pow(node.y - y, 2)
        );

        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestNode = node;
        }
    });

    if (shortestDistance > maxDistance) {
        return null;
    }

    return nearestNode;
}

    function findShortestPath(startId, destinationId) {
    const distances = {};
    const previous = {};
    const unvisited = new Set();

    roadNodes.forEach(function (node) {
        distances[node.id] = Infinity;
        previous[node.id] = null;
        unvisited.add(node.id);
    });

    distances[startId] = 0;

    while (unvisited.size > 0) {
        let currentId = null;
        let smallestDistance = Infinity;

        unvisited.forEach(function (nodeId) {
            if (distances[nodeId] < smallestDistance) {
                smallestDistance = distances[nodeId];
                currentId = nodeId;
            }
        });

        if (currentId === null || smallestDistance === Infinity) {
            break;
        }

        if (currentId === destinationId) {
            break;
        }

        unvisited.delete(currentId);

        const currentNode = roadNodes.find(function (node) {
            return node.id === currentId;
        });

        const neighbors = roadConnections[currentId] || [];

        neighbors.forEach(function (neighborId) {
            if (!unvisited.has(neighborId)) return;

            const neighborNode = roadNodes.find(function (node) {
                return node.id === neighborId;
            });

            if (!neighborNode) return;

            const edgeDistance = Math.sqrt(
                Math.pow(neighborNode.x - currentNode.x, 2) +
                Math.pow(neighborNode.y - currentNode.y, 2)
            );

            const newDistance =
                distances[currentId] + edgeDistance;

            if (newDistance < distances[neighborId]) {
                distances[neighborId] = newDistance;
                previous[neighborId] = currentId;
            }
        });
    }

    const path = [];
    let currentId = destinationId;

    while (currentId !== null) {
        path.unshift(currentId);

        if (currentId === startId) {
            break;
        }

        currentId = previous[currentId];
    }

    if (path[0] !== startId) {
        return [];
    }

    return path;
}

showRouteButton.addEventListener("click", function () {
    const startName = startSelect.value;
    const destinationName = destinationSelect.value;

   if (destinationName === "") {
    alert("Please choose a destination.");
    return;
}

if (!currentLocationMarker && startName === "") {
    alert("Please press Use My Location or choose a starting point.");
    return;
}

if (startName !== "" && startName === destinationName) {
    alert("Please choose two different locations.");
    return;
}

 let startNode;

if (startName === "_GPS_") {

    if (!currentLocationMarker) {
        startCurrentLocation();
        alert("Location detected, press Show route again.");
        return;
    }

    const currentPosition = currentLocationMarker.getLatLng();

    startNode = findNearestRoadNode(
        currentPosition.lng,
        currentPosition.lat,
        40
    );

} else {

    const startBuilding = locations.find(function(location) {
        return location.name === startName;
    });

    startNode = findNearestRoadNode(
        startBuilding.x,
        startBuilding.y,
        40
    );
}



    if (!startNode) {
    alert("Move closer to a road before starting navigation.");
    return;
}

const destinationBuilding = locations.find(function (location) {
    return location.name === destinationName;
});

  

    const destinationNode = findNearestRoadNode(
    destinationBuilding.x,
    destinationBuilding.y
);

    if (!destinationNode) {
    alert("Destination is too far from a road.");
    return;
}

    activeDestinationNode = destinationNode;

    const path = findShortestPath(
    startNode.id,
    destinationNode.id
);

console.log("Shortest path:", path);

console.log(startNode);
console.log(destinationNode);

if (!path || path.length === 0) {
    alert("No route was found.");
    return;
}

const routeCoordinates = path.map(function (nodeId) {
    const node = roadNodes.find(function (roadNode) {
        return roadNode.id === nodeId;
    });

    return [node.y, node.x];
});

if (routeLine) {
    map.removeLayer(routeLine);
}

routeLine = L.polyline(routeCoordinates, {
    color: "red",
    weight: 7,
    opacity: 0.9
}).addTo(map);

map.fitBounds(routeLine.getBounds(), {
    padding: [50, 50]
});


//map.setView([startBuilding.y, startBuilding.x], 0);
});

function updateRouteFromCurrentLocation(currentPosition) {
    console.log("GPS route updating...", currentPosition);
    if (!activeDestinationNode) {
        return;
    }

    const currentNode = findNearestRoadNode(
        currentPosition[1], // x
        currentPosition[0],  // y
        40
    );

    if (!currentNode) {
        return;
    }

    const path = findShortestPath(
        currentNode.id,
        activeDestinationNode.id
    );

    if (!path || path.length === 0) {
        console.log("No route found from current location.");
        return;
    }

    const routeCoordinates = path.map(function (nodeId) {
        const node = roadNodes.find(function (roadNode) {
            return roadNode.id === nodeId;
        });

        return [node.y, node.x];
    });

    // Begin the magenta line at the exact GPS position.
    routeCoordinates.unshift(currentPosition);

    if (routeLine) {
        routeLine.setLatLngs(routeCoordinates);
    } else {
        routeLine = L.polyline(routeCoordinates, {
            color: "red",
            weight: 7,
            opacity: 0.9
        }).addTo(map);
    }
}



clearRouteButton.addEventListener("click", function () {

    if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
    }

    activeDestinationNode = null;

    startSelect.selectedIndex = 0;
    destinationSelect.selectedIndex = 0;

});
