'use strict';

(function ( ){



  //search for a Open Street Map
  let map = L.map('map', {
    minZoom: 5,
    maxZoom: 7
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  //Set mapview in the center of Finland
  map.setView([65.5538179, 25.7496755], 5);


  map.createPane('labels');
  map.getPane('labels').style.zIndex = 650;
  map.getPane('labels').style.pointerEvents = 'none';

 let positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
    attribution: '©OpenStreetMap, ©CartoDB'
  }).addTo(map);

  let positronLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
    attribution: '©OpenStreetMap, ©CartoDB',
    pane: 'labels'
  }).addTo(map);




  //fetch confirmed and death cases
  //search the number of cases by Health Care District or University Hospital
  //creates html
  //returns confirmed cases for the map use
  async function fetchApi() {
    try {
      const response = await fetch(
          'https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData/v2');
      if (!response.ok) throw new Error('jokin meni pieleen');
      const formattedResponse = await response.json();

      const confirmedCases = getConfirmedCases(formattedResponse);
      const healthCareDistricts = getConfirmedHCDistricts(confirmedCases);
      const cCases = getValuesBy(healthCareDistricts);
      //console.log(confirmedCasesDataObj);

      //for html
      const p = document.querySelector('p');

      const totalc = formattedResponse.confirmed.length;
      p.innerHTML += `<color><b>Vahvistetut tartunnat yhteensä: </b><br><br><font color ='#10316b'> ${totalc}</color><br></p>`;

      const totald = formattedResponse.deaths.length;
      p.innerHTML += `<p><b>Kuolleita yhteensä: </b><br><br></B><font color ='#10316b'>${totald}</font></p>`;

      const recovered = formattedResponse.recovered.length;
      p.innerHTML += `<p><b>Parantuneita: </b><br><br></B><font color ='#10316b'>${recovered}</font></p>`;

      /*const casesToday = formattedResponse.deaths.length;
      p.innerHTML += `<p><b>Vahvistettuja tartuntoja tänään: </b><br><br></B><font color ='#10316b'>${totald}</font></p>`;

      const deathsToday = formattedResponse.deaths.length;
      p.innerHTML += `<p><b>Kuolleita tänään: </b><br><br></B><font color ='#10316b'>${totald}</font></p>`;*/

      const deathCases = getDeathCases(formattedResponse);
      const area = getDeathsbyArea(deathCases);
      const dCases = getValuesBy(area);
      p.innerHTML += `<p><b>Kuolleet yliopistosairaalan mukaan: </b></p>`;
        for (let [key, value] of dCases) {
          p.innerHTML += `<p>${key}:<font color ='#10316b'> ${value}</font></p>`;
        }

      const lastUpdate = formattedResponse.confirmed.pop().date;
      let d = new Date(lastUpdate);
      p.innerHTML += `<p><b>Tiedot päivitetty: </b> ${Intl.DateTimeFormat(
          ['ban', 'id']).format(d)}</p>`;

      return cCases;

    } catch (error) {
      console.log(error);
    }
  }

  //finds all confirmed cases
  function getConfirmedCases(data) {
    const confirmedCases = data.confirmed;
    return confirmedCases;
  }

  //finds all confirmed cases by district
  function getConfirmedHCDistricts(data) {
    const healthCareDistricts = data.map(
        confirmedCase => confirmedCase.healthCareDistrict);
    return healthCareDistricts;
  }

  //finds all death cases
  function getDeathCases(data) {
    const deathCases = data.deaths;
    return deathCases;
  }

  //finds death cases by university hospital
  function getDeathsbyArea(data) {
    const area = data.map(confirmedCase => confirmedCase.area);
    return area;
  }

  //maps arrays per key and value
  function getValuesBy(data) {
    const map = new Map();
    data.forEach(function(keyValue) {
      if (map.has(keyValue)) {
        let count = map.get(keyValue);
        count++;
        map.set(keyValue, count);
      } else {
        map.set(keyValue, 1);
      }
    });
    return map;
  }
  var legend = L.control({position: 'topright'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [ 10, 50, 100, 200, 500, 1000, 3000],
        labels = [];

      labels.push(
          '<i style="background:' + '#FED976 "></i>' + grades[0] + '-' + grades[1] + '<br>' +
          '<i style="background:' + '#FEB24C "></i>' + grades[1] + '-' + grades[2] + '<br>' +
          '<i style="background:' + '#FD8D3C "></i>' + grades[2] + '-' + grades[3] + '<br>' +
          '<i style="background:' + '#FC4E2A "></i>' + grades[3] + '-' + grades[4] + '<br>' +
          '<i style="background:' + '#E31A1C "></i>' + grades[4] + '-' + grades[5] + '<br>' +
          '<i style="background:' + '#BD0026 "></i>' + grades[5] + '-' + grades[6] + '<br>' +
          '<i style="background:' + '#800026 "></i>' + grades[6] + '+' + '<br>'
      )


    div.innerHTML = labels.join('<br>');
    return div;
  };

  legend.addTo(map);

  //fetch coordinates of the health care districts
  //create map features
  async function fetchData(myData) {
    try {
      const response = await fetch(
          'https://raw.githubusercontent.com/VuokkoH/koronavirus-avoindata/master/healthDistrictsEPSG4326.geojson',
          {mode: 'cors'});
      if (!response.ok) throw new Error('jokin meni pieleen');
      const data = await response.json();
        L.geoJson(data, {
          style: function(feature, layer) {
            const cases = myData.get(feature.properties.healthCareDistrict);
            getColor(cases);
          return {
            color:
            cases > 3000 ? '#800026' :
                cases > 1000  ? '#BD0026' :
                    cases > 500  ? '#E31A1C' :
                        cases > 200  ? '#FC4E2A' :
                            cases > 100   ? '#FD8D3C' :
                                cases > 50   ? '#FEB24C' :
                                    cases > 10   ? '#FED976' :
                                        '#FFEDA0',
            weight: 2,
            opacity: 1,
            dashArray: '3',
            fillOpacity: 0.7
            //color: '#e25822'
          };
        },

        onEachFeature: function(feature, layer) {
          //console.log("d:" + myData.get(feature.properties.healthCareDistrict));
          let popupContent = '<h3>Tartunnat maakunnassa: </h3> ' +
              '<h4>' + feature.properties.healthCareDistrict + ' ' +
              myData.get(feature.properties.healthCareDistrict) + '</h4>';
          if (feature.properties && feature.properties.popupContent) {
            popupContent += feature.properties.popupContent;
          }
          layer.bindPopup(popupContent);
        },
      }).addTo(map);

    } catch (error) {
      console.log(error);
    }
  }
  function getColor(cases) {
  return {
    color:
    cases > 3000 ? '#800026' :
      cases > 1000 ? '#BD0026' :
          cases > 500 ? '#E31A1C' :
              cases > 200 ? '#FC4E2A' :
                  cases > 100 ? '#FD8D3C' :
                      cases > 50 ? '#FEB24C' :
                          cases > 10 ? '#FED976' :
                              '#FFEDA0'
  }
  }

  //needed in order to fetches to function
  //passes the values from fetchApi() to fetchData()
  (async () => {
    const values = await fetchApi();
    await fetchData(values);
  })();
})();