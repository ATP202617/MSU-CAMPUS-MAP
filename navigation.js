const startSelect = document.getElementById("startLocation");
const destinationSelect =
    document.getElementById("destinationLocation");

let routeLine = null;

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



const showRouteButton = document.getElementById("showRoute");

    function findNearestRoadNode(x, y) {

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

    if (startName === "" || destinationName === "") {
        alert("Please choose a starting point and destination.");
        return;
    }

    if (startName === destinationName) {
        alert("Please choose two different locations.");
        return;
    }

    const startBuilding = locations.find(function (location) {
    return location.name === startName;
});

const destinationBuilding = locations.find(function (location) {
    return location.name === destinationName;
});

    const startNode = findNearestRoadNode(
    startBuilding.x,
    startBuilding.y
);

const destinationNode = findNearestRoadNode(
    destinationBuilding.x,
    destinationBuilding.y
);

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
    color: "magenta",
    weight: 7,
    opacity: 0.9
}).addTo(map);

map.fitBounds(routeLine.getBounds(), {
    padding: [50, 50]
});


//map.setView([startBuilding.y, startBuilding.x], 0);
});