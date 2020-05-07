const getConfirmedCasesDataObj = (confirmedCases, deathCases) => {
    const formatDateString = (date) =>  date.split("T").splice(0, 1).toString()
    const confirmedCasesReversed = confirmedCases.reverse()
    const deathCasesReversed = deathCases.reverse()
    let dataObject = {confirmedCasesByDistricts: {}, confirmedCasesByDate: {}, deathCasesByDate: {}, deathCasesByArea: {}}
    confirmedCasesReversed
                .map(confirmedCase => formatDateString(confirmedCase.date))
                .forEach(date => { dataObject["confirmedCasesByDate"][date] =  0 })
    dataObject["deathCasesByDate"] = {...dataObject["confirmedCasesByDate"]}
    confirmedCases
                .map(confirmedCase => confirmedCase.healthCareDistrict)
                .forEach(district => { dataObject["confirmedCasesByDistricts"][district] =  0 })
    deathCases
            .map(deathCase => deathCase.area)
            .forEach(area => { dataObject["deathCasesByArea"][area] =  0 })
    confirmedCasesReversed.forEach((confirmedCase, _) => {
        const formattedConfirmedCaseDate = formatDateString(confirmedCase.date)
        if (formattedConfirmedCaseDate) {
            dataObject["confirmedCasesByDate"][formattedConfirmedCaseDate] += 1
        }
        dataObject["confirmedCasesByDistricts"][confirmedCase.healthCareDistrict] += 1
    })
    deathCasesReversed.forEach((deathCase, _) => {
        const formattedDeathCaseDate = formatDateString(deathCase.date)
        if (formattedDeathCaseDate) {
            dataObject["deathCasesByDate"][formattedDeathCaseDate] += 1
        }
        dataObject["deathCasesByArea"][deathCase.area] += 1
    })
    return dataObject
}

async function getDataObj () {
    try {
        const response = await fetch('https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData/v2');
        if (!response.ok) throw new Error('jokin meni pieleen');
        const formattedResponse = await response.json();
        const confirmedCases = formattedResponse.confirmed
        const deathCases = formattedResponse.deaths
        const dataObject = getConfirmedCasesDataObj(confirmedCases, deathCases)
        return dataObject
    } catch (error) {
        console.log(error)
    }
}

const confirmedCasesByDateLineChartCtx = document.querySelector('#confirmedCasesByDateLineChart').getContext('2d'); // context of the chart describing element
const confirmedCasesByDistrictBarChartCtx = document.querySelector('#confirmedCasesByDistrictBarChart').getContext('2d');

const deathCasesByDateLineChartCtx = document.querySelector('#deathCasesByDateLineChart').getContext('2d'); // context of the chart describing element
const deathCasesByDistrictBarChartCtx = document.querySelector('#deathCasesByDistrictBarChart').getContext('2d');

const cumulativeLineChartCtx = document.querySelector('#cumulativeLineChart').getContext('2d');
//const cumulativeDeathChartCtx = document.querySelector('#cumulativeDeathChart').getContext('2d');

const chartOptions = {
    scales: {
        yAxes: [{
            scaleLabel: {
                display: true,
                labelString: "Vahvistetut tapaukset"
            }
        }]
    }
}

function getTotalCases(dataObj) {
    const cumulativeSum = (sum => value => sum += value)(0);
    return Object.values(dataObj["confirmedCasesByDate"]).reverse().map(cumulativeSum)
}

/*function getTotalDeaths(dataObj) {
    //const cumulativeSum = (sum => value => sum += value)(0);
    let cumulativeSum = [];
    Object.values(dataObj["deathCasesByDate"]).reverse().filter(deathCases => deathCases).forEach((deathCases, i) => {cumulativeSum.push(i === 0 ? deathCases : deathCases + cumulativeSum[i-1]); console.log(deathCases)})
    return cumulativeSum
}*/

const barColors = ["#10316b", "#000000", "#e25822", "#ececeb", "#f6f578", "#f6d743", "#649d66", "#06623b", "#10316b", "#000000", "#e25822", "#ececeb", "#f6f578", "#f6d743", "#649d66", "#06623b", "#10316b", "#000000", "#e25822", "#ececeb", "#f6f578", "#f6d743"]

const drawCharts = (dataObj) => {
    new Chart(confirmedCasesByDateLineChartCtx, {
        type: 'line',
        data: {
            labels: Object.keys(dataObj["confirmedCasesByDate"]).reverse(),
            datasets: [{
                label: 'Vahvistetut tapaukset tänä päivänä',
                fill: false,
                data: Object.values(dataObj["confirmedCasesByDate"]).reverse(),
                borderColor: "#10316b",
                borderWidth: 1
            }]
        },
        options: chartOptions
    })
    new Chart(confirmedCasesByDistrictBarChartCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(dataObj["confirmedCasesByDistricts"]),
            datasets: [{
                label: 'Vahvistetut tapaukset tässä sairaanhoitopiirissä',
                fill: false,
                point: {
                    radius: 0
                },
                data: Object.values(dataObj["confirmedCasesByDistricts"]),
                backgroundColor: barColors,
                borderColor: barColors,
                borderWidth: 1
            }]
        },
        options: chartOptions
    })
    new Chart(deathCasesByDateLineChartCtx, {
        type: 'line',
        data: {
            labels: Object.keys(dataObj["deathCasesByDate"]).reverse(),
            datasets: [{
                label: 'Vahvistetut kuolemat tänä päivänä',
                fill: false,
                data: Object.values(dataObj["deathCasesByDate"]),
                borderColor: "#222",
                borderWidth: 1
            }]
        },
        options: chartOptions
    })
    new Chart(deathCasesByDistrictBarChartCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(dataObj["deathCasesByArea"]),
            datasets: [{
                label: 'Vahvistetut kuolemat tässä sairaanhoitopiirissä',
                fill: false,
                data: Object.values(dataObj["deathCasesByArea"]),
                borderColor: "#222",
                backgroundColor: "#222",
                borderWidth: 1
            }]
        },
        options: chartOptions
    }),
    new Chart(cumulativeLineChartCtx, {
        type: 'line',
        data: {
            labels: Object.keys(dataObj["confirmedCasesByDate"]).reverse(),
            datasets: [{
                label: 'Vahvistetut tapaukset yhteensä Suomessa',
                fill: false,
                data: getTotalCases(dataObj),
                borderColor: "#e25822",
                borderWidth: 1
            }]
        },
        options: chartOptions
    })
    /*new Chart(cumulativeDeathChartCtx, {
        type: 'line',
        data: {
            labels: Object.keys(dataObj["deathCasesByDate"]).reverse(),
            datasets: [{
                label: 'Vahvistetut kuolemat yhteensä Suomessa',
                fill: false,
                data: getTotalDeaths(dataObj),
                borderColor: "#222",
                borderWidth: 1
            }]
        },
        options: chartOptions
    })*/
}

(async () => {
    const dataSource = await getDataObj();
    drawCharts(dataSource);
})();