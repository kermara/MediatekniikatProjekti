'use strict';

(function ( ){



  //search for a Open Street Map
  let map = L.map('map', {
    minZoom: 5,
    maxZoom: 6
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

      //for html
      const p = document.querySelector('p');

      const totalc = formattedResponse.confirmed.length;
      p.innerHTML += `<p><b>Vahvistetut tartunnat yhteensä: </b> ${totalc}</p>`;

      const totald = formattedResponse.deaths.length;
      p.innerHTML += `<p><b>Kuolleita yhteensä: </b></B>${totald}</p>`;

      const deathCases = getDeathCases(formattedResponse);
      const area = getDeathsbyArea(deathCases);
      const dCases = getValuesBy(area);
      p.innerHTML += `<p><b>Kuolleet yliopistosairaalan mukaan: </b></p>`;
      for (let [key, value] of dCases) {
        p.innerHTML += `<p>${key} ${value}</p>`;
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
        style: function(feature) {
          return {color: '#e25822'};
        },
        onEachFeature: function(feature, layer) {
          let popupContent = '<h3>Vahvistetut tartunnat: </h3> ' +
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

  //needed in order to fetches to function
  //passes the values from fetchApi() to fetchData()
  (async () => {
    const values = await fetchApi();
    await fetchData(values);
  })();
})();