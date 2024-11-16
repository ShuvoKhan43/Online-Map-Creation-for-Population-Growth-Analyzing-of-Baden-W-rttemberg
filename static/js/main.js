
var maplibreMap = new maplibregl.Map({
    container: 'map', // container ID
    style: {
        'version': 8,
        'sources': {
            'osm-tiles': {
                'type': 'raster',
                'tiles': [
                    'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
                ],
                'tileSize': 256,
                'attribution': '© OpenStreetMap contributors'
            }
        },
        'layers': [
            {
                'id': 'osm-tiles',
                'type': 'raster',
                'source': 'osm-tiles',
                'minzoom': 0,
                'maxzoom': 19
            }
        ]
    },
    center: [9.1544, 48.6361], // starting position [lng, lat]
    zoom: 8 // starting zoom
});

// Add zoom and rotation controls to the map.
maplibreMap.addControl(new maplibregl.NavigationControl());


var geojsonUrl = "http://localhost:5000/geojson";  

maplibreMap.on('load', async function () {

    maplibreMap.addSource('geojson_data', {
        'type': 'geojson',
        'data': geojsonUrl
    });


    // Add a click event listener to the layer
    maplibreMap.addLayer({
        'id': 'geojson_layer',
        'type': 'fill',
        'source': 'geojson_data',
        'layout': {},
        'paint': {
            // 'fill-color': ['case', ['boolean', ['feature-state', 'clicked'], false], '#FFFF00', '#627BC1'],
            'fill-color': [
                'case',
                    ['boolean', ['feature-state', 'clicked'], false], '#00FF00', // clicked color
                    ['boolean', ['feature-state', 'hover'], false], '#FFFF00', // hover color
                    '#627BC1' // default color
            ],
            'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.5, 0.8]
        }
    });

    maplibreMap.addLayer({
        'id': 'geojson_layer_outline',
        'type': 'line',
        'source': 'geojson_data',
        'layout': {},
        'paint': {
            'line-color': '#000000',
            'line-width': 0.5
        }
    });


    // Variable to hold the ID of the currently hovered feature
    var hoveredFeatureId = null;

    // Event listener for click to log the properties of the clicked feature
    maplibreMap.on('click', 'geojson_layer', function (e) {
        if (e.features && e.features.length > 0) {
            var clickedFeature = e.features[0];
            var name = clickedFeature.properties.name
            console.log(name);
            if (name == "Esslingen" || name == "Ludwigsburg" || name == "Karlsruhe") {
                console.log(`Population data available for ${name}`)
            }
        }
    });

    // Event listener for mouse move to update the feature state for hover
    maplibreMap.on('mousemove', 'geojson_layer', function (e) {
        if (e.features.length > 0) {
            if (hoveredFeatureId) {
                maplibreMap.setFeatureState(
                    { source: 'geojson_data', id: hoveredFeatureId },
                    { hover: false }
                );
            }

            hoveredFeatureId = e.features[0].id;

            maplibreMap.setFeatureState(
                { source: 'geojson_data', id: hoveredFeatureId },
                { hover: true }
            );
        }
    });

    // Event listener for mouse leave to reset the hover state
    maplibreMap.on('mouseleave', 'geojson_layer', function () {
        if (hoveredFeatureId) {
            maplibreMap.setFeatureState(
                { source: 'geojson_data', id: hoveredFeatureId },
                { hover: false }
            );
        }
        hoveredFeatureId = null;
    });


    let clickedFeatureId = null;

    // Add a click event listener to the layer
    maplibreMap.on('click', 'geojson_layer', function (e) {
        if (clickedFeatureId) {
            maplibreMap.setFeatureState(
                { source: 'geojson_data', id: clickedFeatureId },
                { clicked: false }
            );
        }

        clickedFeatureId = e.features[0].id;

        maplibreMap.setFeatureState(
            { source: 'geojson_data', id: clickedFeatureId },
            { clicked: true }
        );

        var coordinates = e.lngLat;
        var properties = e.features[0].properties;

        // Log the properties to the console
        console.log(properties);

        // Create a popup
        var popupContent = '<b>' + properties.name + '</b>';
        new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(maplibreMap);
    });

    // Reset the color when clicking outside of the features
    maplibreMap.on('click', function (e) {
        var features = maplibreMap.queryRenderedFeatures(e.point, {
            layers: ['geojson_layer']
        });

        if (!features.length && clickedFeatureId) {
            maplibreMap.setFeatureState(
                { source: 'geojson_data', id: clickedFeatureId },
                { clicked: false }
            );
            clickedFeatureId = null;
        }
    });

});

// static/js/script.js
document.addEventListener('DOMContentLoaded', function () {
    const populationBtn = document.getElementById('populationBtn');
    const simulationBtn = document.getElementById('simulationBtn');
    const populationOptions = document.getElementById('populationOptions');
    const simulationOptions = document.getElementById('simulationOptions');
    const submitBtn = document.getElementById('submitBtn');
    const chartContainer = document.getElementById('chartContainer');
    const closeChartBtn = document.getElementById('closeChartBtn');
    const ctx = document.getElementById('myChart').getContext('2d');
    let myChart;

    populationBtn.addEventListener('click', function () {
        populationBtn.classList.add('active');
        simulationBtn.classList.remove('active');
        populationOptions.classList.remove('hidden');
        simulationOptions.classList.add('hidden');
    });

    simulationBtn.addEventListener('click', function () {
        simulationBtn.classList.add('active');
        populationBtn.classList.remove('active');
        simulationOptions.classList.remove('hidden');
        populationOptions.classList.add('hidden');
    });

    submitBtn.addEventListener('click', function () {
        let apiUrl = '';
        let title = '';
        if (populationBtn.classList.contains('active')) {
            if (document.getElementById('espop').checked) {
                apiUrl = 'http://localhost:5000/population/espop';
                title = 'Esslingen Population';
            } else if (document.getElementById('karlpop').checked) {
                apiUrl = 'http://localhost:5000/population/karlpop';
                title = 'Karlsruhe Population';
            } else if (document.getElementById('ludpop').checked) {
                apiUrl = 'http://localhost:5000/population/ludpop';
                title = 'Ludwigsburg Population';
            }
        } else if (simulationBtn.classList.contains('active')) {
            if (document.getElementById('essim').checked) {
                apiUrl = 'http://localhost:5000/simulation/espop';
                title = 'Esslingen Simulation';
            } else if (document.getElementById('karlsim').checked) {
                apiUrl = 'http://localhost:5000/simulation/karlpop';
                title = 'Karlsruhe Simulation';
            } else if (document.getElementById('ludsim').checked) {
                apiUrl = 'http://localhost:5000/simulation/ludpop';
                title = 'Ludwigsburg Simulation';
            }
        }

        if (apiUrl) {
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    // Prepare data for the chart
                    const labels = data.map(item => (item.year));
                    const values = data.map(item => item.population);

                    // Destroy previous chart instance if it exists
                    if (myChart) {
                        myChart.destroy();
                    }

                    // Create a new chart
                    myChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Population per Year',
                                data: values,
                                borderColor: '#e056fd',
                                borderWidth: 1,
                                fill: false
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                x: {
                                    type: 'linear',
                                    position: 'bottom',
                                    title: {
                                        display: true,
                                        text: 'Year'
                                    }
                                },
                                y: {
                                    beginAtZero: true, // Begin y-axis at 0
                                    title: {
                                        display: true,
                                        text: 'Population(thousand)'
                                    }
                                }
                            },
                            plugins: {
                                title: {
                                    display: true,
                                    text: title
                                }
                            }
                        }
                    });

                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } else {
            alert('Please select an option.');
        }
    });

    $(document).ready(function () {
        // Hide chart container on page load
        $('#chartContainer').hide();

        // Show chart container on submit button click
        $('#submitBtn').click(function () {
            // Your existing submit button logic goes here

            // Show the chart container
            $('#chartContainer').show();
        });

        // Close chart container on close button click
        $('#closeChartBtn').click(function () {
            // Hide the chart container
            $('#chartContainer').hide();
        });
    });

    document.querySelectorAll('input[name="population"]').forEach((elem) => {
        elem.addEventListener('change', (event) => {
            let selectedValue = event.target.nextSibling.textContent.trim().replace(/ (Pop|Sim)/, '');
            highlightFeature(selectedValue);
        });
    });

    document.querySelectorAll('input[name="simulation"]').forEach((elem) => {
        elem.addEventListener('change', (event) => {
            let selectedValue = event.target.nextSibling.textContent.trim().replace(/ (Pop|Sim)/, '');
            highlightFeature(selectedValue);
        });
    });

    document.getElementById('submitBtn').addEventListener('click', () => {
        unhighlightFeature();
    });

    function highlightFeature(name) {
        maplibreMap.setFilter('geojson_layer', ['==', ['get', 'name'], name]);
    }

    function unhighlightFeature() {
        maplibreMap.setFilter('geojson_layer', null);
    }

});
