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







    let userMarker = null;

document.getElementById("myLocation").addEventListener("click", function () {

    if (!navigator.geolocation) {
        alert("Your browser does not support GPS.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            if (userMarker) {
                map.removeLayer(userMarker);
            }

            userMarker = L.marker([lat, lng])
                .addTo(map)
                .bindPopup("📍 You are here")
                .openPopup();

            map.setView([lat, lng], 18);

        },
        function () {
            alert("Unable to get your location.");
        }
    );

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