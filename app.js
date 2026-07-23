const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 3
});
const ADMIN_MODE = false;
const bounds = [
    [0, 0],
    [1000, 1500]
];

L.imageOverlay("images/campus-map.jpg", bounds).addTo(map);
map.fitBounds(bounds);

const menu = document.getElementById("menu");
const button = document.getElementById("menuButton");
const list = document.getElementById("landmarkList");

button.onclick = () => {
    menu.style.display =
        menu.style.display === "block"
            ? "none"
            : "block";
};

const markers = [];

locations.forEach(location => {

    const customIcon = L.icon({
    iconUrl: "icons/" + location.icon + ".png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30]
});

const marker = L.marker(
    [location.y, location.x],
    { icon: customIcon }
).addTo(map);

 marker.bindPopup(`
    <div style="width:220px">
        <h3>${location.name}</h3>

        <img
            src="${location.image || 'images/campus-map.jpg'}"
            style="width:100%; border-radius:8px; margin-bottom:8px;"
        >

        <p>${location.description}</p>

        <p><strong>Category:</strong> ${location.category || 'N/A'}</p>

        <p><strong>Hours:</strong> ${location.hours || 'N/A'}</p>
    </div>
`);

    markers.push({
        name: location.name.toLowerCase(),
        marker: marker,
        location: location
    });

    const li = document.createElement("li");
    li.textContent = location.name;

    li.onclick = () => {
        map.setView([location.y, location.x], 1);
        marker.openPopup();
        menu.style.display = "none";
    };

    list.appendChild(li);

});

const searchBox = document.getElementById("searchBox");

searchBox.addEventListener("keyup", function () {

    const keyword = this.value.toLowerCase();

    const items = list.querySelectorAll("li");

    items.forEach(item => {

        if (item.textContent.toLowerCase().includes(keyword))
            item.style.display = "block";
        else
            item.style.display = "none";

    });

});

searchBox.addEventListener("keydown", function (e) {

    if (e.key !== "Enter") return;

    const keyword = this.value.toLowerCase().trim();

    const result = markers.find(m => m.name === keyword);

    if (result) {

        map.setView(
            [result.location.y, result.location.x],
            1
        );

        result.marker.openPopup();

        menu.style.display = "none";
    }

});



let clickedX = 0;
let clickedY = 0;

map.on("click", function (e) {
    clickedX = Math.round(e.latlng.lng);
    clickedY = Math.round(e.latlng.lat);

    document.getElementById("coordinates").innerHTML =
        "X: " + clickedX + " | Y: " + clickedY;
});

const generateButton = document.getElementById("copyCode");

generateButton.addEventListener("click", function () {
    const name = document.getElementById("bName").value;
    const description = document.getElementById("bDescription").value;
    const icon = document.getElementById("bIcon").value;

    const code =
        "{\n" +
        '    name: "' + name + '",\n' +
        "    x: " + clickedX + ",\n" +
        "    y: " + clickedY + ",\n" +
        '    description: "' + description + '",\n' +
        '    icon: "' + icon + '"\n' +
        "},";

    document.getElementById("outputCode").value = code;
});

const roadRoutes = {
    "Main Gate-Library": [
        [350, 1450],
        [380, 1300],
        [420, 1100],
        [300, 900],
        [220, 760]
    ],

    "Main Gate-Administration": [
        [374,1378],
        [412,1250],
        [334,1166],
        [300,1048],
        [304,830],
        [308,786],
        [180,738],
        [214,632]
    ]
};


document.getElementById("myLocation").addEventListener("click", function () {
    startCurrentLocation();
});



    if (ADMIN_MODE){

    roadNodes.forEach(function (node) {
    L.circleMarker([node.y, node.x], {
        radius: 5,
        weight: 2,
        fillOpacity: 1
    })
    .addTo(map)
    .bindPopup("Road Node: " + node.id);
});
}
Object.keys(roadConnections).forEach(function (nodeId) {

    const startNode = roadNodes.find(n => n.id === nodeId);

    roadConnections[nodeId].forEach(function (connectedId) {

        const endNode = roadNodes.find(n => n.id === connectedId);

    if (ADMIN_MODE) {
        L.polyline(
            [
                [startNode.y, startNode.x],
                [endNode.y, endNode.x]
            ],
            {
                weight: 2,
                color: "blue"
            }
        ).addTo(map);
    }

    });

});

    // Road Editor
let roadEditMode = false;

const roadEditCheckbox = document.getElementById("roadEditMode");
const roadEditorStatus = document.getElementById("roadEditorStatus");

const roadEditorPanel = document.getElementById("roadEditorPanel");
const addBuildingPanel = document.getElementById("addBuilding");
const coordinates = document.getElementById("coordinates");

    if (!ADMIN_MODE) {
    roadEditorPanel.style.display = "none";
    addBuildingPanel.style.display = "none";
    coordinates.style.display = "none";
}


let selectedRoadNode = null;
let selectedRoadMarker = null;
const roadLines = [];

roadEditCheckbox.addEventListener("change", function () {

    roadEditMode = this.checked;

    if (roadEditMode) {
        roadEditorStatus.textContent = "Editing is ON";
    } else {
        roadEditorStatus.textContent = "Editing is OFF";
    }

});
    let nextRoadNodeNumber = roadNodes.length + 1;

map.on("click", function (e) {

    if (!roadEditMode) {
        return;
    }

    const newNode = {
        id: "N" + nextRoadNodeNumber,
        x: Math.round(e.latlng.lng),
        y: Math.round(e.latlng.lat)
    };

    roadNodes.push(newNode);
    nextRoadNodeNumber++;

    if (ADMIN_MODE){
    const marker = L.circleMarker([newNode.y, newNode.x], {
    radius: 6,
    color: "red",
    weight: 2,
    fillColor: "red",
    fillOpacity: 1
}).addTo(map);
}
marker.bindPopup("Road Node: " + newNode.id);

marker.on("click", function (e) {
    L.DomEvent.stopPropagation(e.originalEvent);
    if (!roadEditMode) return;

    if (selectedRoadNode === null) {

        selectedRoadNode = newNode;
        selectedRoadMarker = marker;

        marker.setStyle({
            color: "green",
            fillColor: "green"
        });

    } else {

        // Draw the road
const newRoadLine = L.polyline([
    [selectedRoadNode.y, selectedRoadNode.x],
    [newNode.y, newNode.x]
], {
    color: "blue",
    weight: 3
}).addTo(map);

roadLines.push({
    from: selectedRoadNode.id,
    to: newNode.id,
    line: newRoadLine
});

// Save the connection
if (!roadConnections[selectedRoadNode.id]) {
    roadConnections[selectedRoadNode.id] = [];
}

if (!roadConnections[newNode.id]) {
    roadConnections[newNode.id] = [];
}

roadConnections[selectedRoadNode.id].push(newNode.id);
roadConnections[newNode.id].push(selectedRoadNode.id);

// Reset selection
selectedRoadNode = null;

marker.setStyle({
    color: "red",
    fillColor: "red"
});

    document.addEventListener("keydown", function (e) {
    if (e.key !== "Delete") return;
    if (!roadEditMode) return;
    if (!selectedRoadNode || !selectedRoadMarker) return;

    const nodeId = selectedRoadNode.id;

    // Remove connected blue lines
    for (let i = roadLines.length - 1; i >= 0; i--) {
        const roadLine = roadLines[i];

        if (roadLine.from === nodeId || roadLine.to === nodeId) {
            map.removeLayer(roadLine.line);
            roadLines.splice(i, 1);
        }
    }

    // Remove this node from neighboring connections
    if (roadConnections[nodeId]) {
        roadConnections[nodeId].forEach(function (neighborId) {
            if (roadConnections[neighborId]) {
                roadConnections[neighborId] =
                    roadConnections[neighborId].filter(function (id) {
                        return id !== nodeId;
                    });
            }
        });

        delete roadConnections[nodeId];
    }

    // Remove the node from roadNodes
    const nodeIndex = roadNodes.findIndex(function (node) {
        return node.id === nodeId;
    });

    if (nodeIndex !== -1) {
        roadNodes.splice(nodeIndex, 1);
    }

    // Remove the red/green circle
    map.removeLayer(selectedRoadMarker);

    selectedRoadNode = null;
    selectedRoadMarker = null;

    roadEditorStatus.textContent = "Node deleted";
});

    }

});

});

    const exportConnectionsBtn =
    document.getElementById("exportConnectionsBtn");

exportConnectionsBtn.addEventListener("click", function () {

    let output = "const roadConnections = {\n";

    Object.keys(roadConnections).forEach(function (nodeId) {

        const connections = roadConnections[nodeId]
            .map(function (id) {
                return '"' + id + '"';
            })
            .join(", ");

        output += "    " + nodeId + ": [" + connections + "],\n";
    });

    output += "};";

    console.log(output);
    navigator.clipboard.writeText(output);
    alert(
        "roadConnections.js code has been copied. " +
        "Open roadConnections.js, replace everything, then paste it."
    );
});

    const exportRoadNodesBtn =
    document.getElementById("exportRoadNodesBtn");

exportRoadNodesBtn.addEventListener("click", function () {

    let output = "const roadNodes = [\n";

    roadNodes.forEach(function (node) {

        output +=
            '    { id: "' + node.id +
            '", x: ' + node.x +
            ', y: ' + node.y +
            " },\n";

    });

    output += "];";

    console.log(output);
    
    navigator.clipboard.writeText(output);

    alert(
    "roadNodes.js code has been copied. " +
    "Open roadNodes.js, replace everything, then paste it."
    );

});

    let currentLocationMarker = null;
    let currentLocationCircle = null;
    let lastRouteUpdatePosition = null;

   function gpsToMap(latitude, longitude) {
  const centerLatitude = 7.997339028830308;
  const centerLongitude = 124.25986365408066;

  const longitudeDifference = longitude - centerLongitude;
  const latitudeDifference = latitude - centerLatitude;

  const x =
    134169.139685 * longitudeDifference -
    3151.575111 * latitudeDifference +
    558.733333;

  const y =
    693.276111 * longitudeDifference +
    110604.970236 * latitudeDifference +
    525.866667;

  // Your coordinates are X, Y.
  // Leaflet needs Y, X.
  return [y, x];


}

    function getNearestRoadNode(mapPosition) {
    let nearest = null;
    let shortestDistance = Infinity;

    roadNodes.forEach(node => {
        const dx = node.x - mapPosition[1];
        const dy = node.y - mapPosition[0];
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearest = node;
        }
    });

    return nearest;
}

    const currentLocationIcon = L.divIcon({
    className: "current-location-icon",
    html: '<div class="blue-location-dot"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});



function snapToNearestRoadSegment(position) {
  let closestPoint = position;
  let shortestDistance = Infinity;

  const pointY = position[0];
  const pointX = position[1];

  Object.entries(roadConnections).forEach(
    ([startNodeId, connectedNodeIds]) => {

      const startNode = roadNodes.find(
        node => node.id === startNodeId
      );

      if (!startNode) return;

      connectedNodeIds.forEach(endNodeId => {
        const endNode = roadNodes.find(
          node => node.id === endNodeId
        );

        if (!endNode) return;

        const x1 = startNode.x;
        const y1 = startNode.y;
        const x2 = endNode.x;
        const y2 = endNode.y;

        const segmentX = x2 - x1;
        const segmentY = y2 - y1;

        const segmentLengthSquared =
          segmentX * segmentX +
          segmentY * segmentY;

        if (segmentLengthSquared === 0) return;

        let t =
          ((pointX - x1) * segmentX +
            (pointY - y1) * segmentY) /
          segmentLengthSquared;

        t = Math.max(0, Math.min(1, t));

        const projectedX = x1 + t * segmentX;
        const projectedY = y1 + t * segmentY;

        const distanceX = pointX - projectedX;
        const distanceY = pointY - projectedY;

        const distance = Math.sqrt(
          distanceX * distanceX +
          distanceY * distanceY
        );

        if (distance < shortestDistance) {
          shortestDistance = distance;

          closestPoint = [
            projectedY,
            projectedX
          ];
        }
      });
    }
  );

  return closestPoint;
}

    function moveMarkerSmoothly(marker, newPosition, duration = 800) {
  const startPosition = marker.getLatLng();

  const startY = startPosition.lat;
  const startX = startPosition.lng;

  const endY = newPosition[0];
  const endX = newPosition[1];

  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const currentY = startY + (endY - startY) * progress;
    const currentX = startX + (endX - startX) * progress;

    marker.setLatLng([currentY, currentX]);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

    function moveMarkerSmoothly(marker, newPosition, duration = 1000) {

    const start = marker.getLatLng();

    const startY = start.lat;
    const startX = start.lng;

    const endY = newPosition[0];
    const endX = newPosition[1];

    const startTime = performance.now();

    function animate(time) {

        const progress = Math.min(
            (time - startTime) / duration,
            1
        );

        const currentY =
            startY + (endY - startY) * progress;

        const currentX =
            startX + (endX - startX) * progress;

        marker.setLatLng([currentY, currentX]);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }

    }

    requestAnimationFrame(animate);
}

function startCurrentLocation() {
  if (!navigator.geolocation) {
    alert("Your device does not support GPS location.");
    return;
  }

  navigator.geolocation.watchPosition(
    function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);
      console.log("Accuracy:", accuracy);

      // Temporary location marker.
      // We will convert the real GPS coordinates to your campus map coordinates next.
      const temporaryMapPosition = gpsToMap(latitude, longitude);

        const snappedPosition =
  snapToNearestRoadSegment(temporaryMapPosition);

      if (!currentLocationMarker) {
        currentLocationMarker = L.marker(snappedPosition, {
  icon: currentLocationIcon,
  zIndexOffset: 1000
})
          .addTo(map)
          .bindPopup("You are here");

        currentLocationCircle = L.circle(snappedPosition, {
          radius: 15
        }).addTo(map);

        map.setView(snappedPosition, 1);
      } else {
        moveMarkerSmoothly(
         currentLocationMarker,
         snappedPosition,
        1000
      );

currentLocationCircle.setLatLng(snappedPosition);
      if (typeof updateRouteFromCurrentLocation === "function") {

    if (
        !lastRouteUpdatePosition ||
        map.distance(lastRouteUpdatePosition, snappedPosition) >= 5
    ) {
        lastRouteUpdatePosition = snappedPosition;
        updateRouteFromCurrentLocation(snappedPosition);
    }

}
}
},
    function (error) {
      console.error(error);

      if (error.code === 1) {
        alert("Location permission was denied. Please allow location access.");
      } else if (error.code === 2) {
        alert("Your location is currently unavailable.");
      } else if (error.code === 3) {
        alert("Location request timed out.");
      }
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    }
  );
}

// startCurrentLocation();
