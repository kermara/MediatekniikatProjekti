'use strict'

async function getData() {
  try {
    const response = await fetch('https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData/v2');
    if (!response.ok) throw new Error('jokin meni pieleen');
    const formattedResponse = await response.json();
    console.log(formattedResponse);

    const confirmedCases = getConfirmedCases(formattedResponse);
    const healthCareDistricts = getConfirmedHCDistricts(confirmedCases);
    console.log(healthCareDistricts);
    const cCases = getConfirmedValuesByDistrict(healthCareDistricts);
    console.log(cCases);

    const deathCases = getDeathCases(formattedResponse);
    const area = getDeathsbyArea(deathCases);
    console.log(area);
    const dCases = getDeathsValuesByArea(area);
    console.log(dCases);

  } catch (error) {
    console.log(error)
  }
}

function getConfirmedCases(data){
  const confirmedCases = data.confirmed;
  return confirmedCases;
}

function getConfirmedHCDistricts(data) {
  const healthCareDistricts = data.map(confirmedCase => confirmedCase.healthCareDistrict);
  return healthCareDistricts;
}

function getConfirmedValuesByDistrict(data) {
  const map = new Map();
  data.forEach(function(keyValue) {
    if (map.has(keyValue)){
      let count= map.get(keyValue);
      count++;
      map.set(keyValue, count);
    }else {
      map.set(keyValue, 1);
    }
  });
  return map;
}

function getDeathCases(data){
  const deathCases = data.deaths;
  return deathCases;
}

function getDeathsbyArea(data) {
  const area = data.map(confirmedCase => confirmedCase.area);
  return area;
}

function getDeathsValuesByArea(data) {
  const map = new Map();
  data.forEach(function(keyValue) {
    if (map.has(keyValue)){
      let count= map.get(keyValue);
      count++;
      map.set(keyValue, count);
    }else {
      map.set(keyValue, 1);
    }
  });
  return map;
}

let values;
(async () => {
  values = await getData();
})();