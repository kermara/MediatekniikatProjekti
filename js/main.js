'use strict'

async function printToConsole () {
    try {
        const response = await fetch('https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData/v2');
        if (!response.ok) throw new Error('jokin meni pieleen');
        const formattedResponse = await response.json();
        const confirmedCases = formattedResponse.confirmed
        const healthCareDistricts = confirmedCases.map(confirmedCase => confirmedCase.healthCareDistrict)
        console.log(healthCareDistricts)
    } catch (error) {
        console.log(error)
    }
}

printToConsole()
