// the map
var map;

function initialize() {
  var myOptions = {
    zoom: 2,
    center: new google.maps.LatLng(10, 0),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  // initialize the map
  map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);

  // these are the map styles
  var styles = [
    {
        featureType: "all",
        elementType: "geometry",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "all",
        elementType: "geometry.stroke",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "all",
        elementType: "labels",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "all",
        elementType: "labels.text",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "all",
        elementType: "labels.text.stroke",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "all",
        elementType: "labels.icon",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "administrative.country",
        elementType: "geometry.fill",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "administrative.country",
        elementType: "geometry.stroke",
        stylers: [
            {
                visibility: "on"
            },
            {
                "weight": "1.50"
            }
        ]
    },
    {
        featureType: "administrative.country",
        elementType: "labels",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "administrative.country",
        elementType: "labels.text",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "administrative.province",
        elementType: "all",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "administrative.province",
        elementType: "geometry.fill",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "administrative.locality",
        elementType: "all",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "administrative.neighborhood",
        elementType: "labels",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "administrative.land_parcel",
        elementType: "labels",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "landscape",
        elementType: "all",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "landscape",
        elementType: "geometry.stroke",
        stylers: [
            {
                visibility: "off"
            },
            {
                "saturation": "1"
            }
        ]
    },
    {
        featureType: "landscape.man_made",
        elementType: "all",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "landscape.man_made",
        elementType: "labels",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "landscape.natural",
        elementType: "all",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "landscape.natural",
        elementType: "geometry.fill",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "landscape.natural",
        elementType: "labels",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "poi",
        elementType: "all",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "road",
        elementType: "all",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "transit",
        elementType: "all",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "water",
        elementType: "all",
        stylers: [
            {
                visibility: "on"
            }
        ]
    },
    {
        featureType: "water",
        elementType: "labels",
        stylers: [
            {
                visibility: "off"
            }
        ]
    }
];

  map.setOptions({styles: styles});


    //Google Geo Chart ------------------------

  google.charts.load('current', {
    'packages':['geochart'],
    // Note: you will need to get a mapsApiKey for your project.
    // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
    'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
  });
  google.charts.setOnLoadCallback(drawRegionsMap);

  function drawRegionsMap() {
    var data = google.visualization.arrayToDataTable([
      ['Country', 'Popularity'],
      ['Germany', 200],
      ['United States', 300],
      ['Brazil', 400],
      ['Canada', 500],
      ['France', 600],
      ['RU', 700]
    ]);

    var options = {};

    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

    chart.draw(data, options);

//--------------------------------------
  
//   // Initialize JSON request
//   var script = document.createElement('script');
//   var url = ['https://www.googleapis.com/fusiontables/v1/query?'];
//   url.push('sql=');
//   var query = 'SELECT name, kml_4326 FROM ' +
//       '1foc3xO9DyfSIF6ofvN0kp2bxSfSeKog5FbdWdQ';
//   var encodedQuery = encodeURIComponent(query);
//   url.push(encodedQuery);
//   url.push('&callback=drawMap');
//   url.push('&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ');
//   script.src = url.join('');
//   var body = document.getElementsByTagName('body')[0];
//   body.appendChild(script);
}

var countries = [];

function drawMap(data) {
  var rows = data['rows'];
  for (var i in rows) {
    if (rows[i][0] != 'Antarctica') {
      var newCoordinates = [];
      var geometries = rows[i][1]['geometries'];
      if (geometries) {
        for (var j in geometries) {
          newCoordinates.push(constructNewCoordinates(geometries[j]));
        }
      } else {
        newCoordinates = constructNewCoordinates(rows[i][1]['geometry']);
      }
      var country = new google.maps.Polygon({
        paths: newCoordinates,
        strokeColor: '#8eb7f5',
        strokeOpacity: 1.5,
        strokeWeight: 0.3,
        fillColor: '#6895d9',
        fillOpacity: 0,
        name: rows[i][0]
      });

      countries.push(country);

      google.maps.event.addListener(country, 'mouseover', function() {
        this.setOptions({fillOpacity: 0.4});
      });
      google.maps.event.addListener(country, 'mouseout', function() {
        this.setOptions({fillOpacity: 0});
      });
      google.maps.event.addListener(country, 'click', function() {
        inputCountry(this);
      });

      country.setMap(map);
    }
  }
  startCountries();
}

function constructNewCoordinates(polygon) {
  var newCoordinates = [];
  var coordinates = polygon['coordinates'][0];
  for (var i in coordinates) {
    newCoordinates.push(
        new google.maps.LatLng(coordinates[i][1], coordinates[i][0]));
  }
  return newCoordinates;
}

var correctCountries = [];
var currentCountry;
var countryIndex = -1;

var lastCountry;

var numAttempted = 0;
var numCorrect = 0;
var numWrong = 0;

function startCountries(){
    document.getElementById("left").innerHTML = countries.length;
    correctCountries = [];
    selectNewCountry();
}


function inputCountry(country){

    var correctDisplay = document.getElementById("correctDisplay");

    if(currentCountry == country)
    {
        correctCountries.push(countryIndex);
        correctDisplay.innerHTML = "Correct!";
        correctDisplay.style.color ="#65ce65";

        countries.splice(countries.indexOf(currentCountry), 1);

        numCorrect++;
        document.getElementById("correction").innerHTML = "";
    }
    else
    {
        currentCountry.setOptions({fillColor: "#ce6565", fillOpacity: 0.4});

        correctDisplay.innerHTML = "Incorrect";
        correctDisplay.style.color = "#ce6565";
        document.getElementById("correction").innerHTML = "you clicked " + country.name;
        numWrong++;

        map.panTo(currentCountry.latLngs.g[0].g[0]);
        var bounds = new google.maps.LatLngBounds();
    
        currentCountry.latLngs.forEach(group => {
            group.g.forEach(element => {
                bounds.extend(element);
            });
        });
    
        map.fitBounds(bounds);
    }

    if(lastCountry != null)
        lastCountry.setOptions({fillColor: "#6895d9", fillOpacity: 0});

    numAttempted++;
    document.getElementById("numAttempted").innerHTML = numAttempted;
    document.getElementById("numCorrect").innerHTML = numCorrect;
    document.getElementById("numWrong").innerHTML = numWrong;
    document.getElementById("percent").innerHTML = Math.round(numCorrect / numAttempted * 1000) / 10;

    lastCountry = currentCountry;
    selectNewCountry();
}

function selectNewCountry(){
    countryIndex = selectCountry();

    if(countryIndex >= 0)
    {
        currentCountry = countries[countryIndex];
        document.getElementById("countryName").innerHTML = currentCountry.name;
    }
    else
    {
        document.getElementById("countryName").innerHTML = "No more countries!";
    }
}


function selectCountry()
{
    var selection;

    var i = 0;

    selection = Math.round(Math.random() * (countries.length - 1));

    return selection;
}

google.maps.event.addDomListener(window, 'load', initialize);