const getConfirmedCasesDataObj = (confirmedCases) => {
    const formatDateString = (date) =>  date.split("T").splice(0, 1).toString()
    const confirmedCasesReversed = confirmedCases.reverse()
    let confirmedCasesDataObj = {byDistricts: {}, byDate: {}}
    confirmedCasesReversed
                .map(confirmedCase => formatDateString(confirmedCase.date))
                .forEach(date => { confirmedCasesDataObj["byDate"][date] =  0 })
    confirmedCasesReversed
                .map(confirmedCase => confirmedCase.healthCareDistrict)
                .forEach(district => { confirmedCasesDataObj["byDistricts"][district] =  0 })
    confirmedCasesReversed.forEach((confirmedCase, i) => {
        const formattedConfirmedCaseDate = formatDateString(confirmedCase.date)
        if (formattedConfirmedCaseDate) {
            confirmedCasesDataObj["byDate"][formattedConfirmedCaseDate] += 1
        }
        confirmedCasesDataObj["byDistricts"][confirmedCase.healthCareDistrict] += 1
    })
    return confirmedCasesDataObj
}

async function getDataObj () {
    try {
        const response = await fetch('https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData/v2');
        if (!response.ok) throw new Error('jokin meni pieleen');
        const formattedResponse = await response.json();
        const confirmedCases = formattedResponse.confirmed
        const confirmedCasesDataObj = getConfirmedCasesDataObj(confirmedCases)
        return confirmedCasesDataObj
    } catch (error) {
        console.log(error)
    }
}

const lineChartCtx = document.querySelector('#lineChart').getContext('2d'); // context of the chart describing element
const barChartCtx = document.querySelector('#barChart').getContext('2d');

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

const barColors = ["#10316b", "#000000", "#e25822", "#ececeb", "#f6f578", "#f6d743", "#649d66", "#06623b", "#10316b", "#000000", "#e25822", "#ececeb", "#f6f578", "#f6d743", "#649d66", "#06623b", "#10316b", "#000000", "#e25822", "#ececeb", "#f6f578", "#f6d743"]

const drawCharts = (dataObj) => {
    new Chart(lineChartCtx, {
        type: 'line',
        data: {
            labels: Object.keys(dataObj["byDate"]).reverse(),
            datasets: [{
                label: 'Vahvistetut tapaukset tänä päivänä',
                fill: false,
                data: Object.values(dataObj["byDate"]).reverse(),
                borderColor: "#10316b",
                borderWidth: 1
            }]
        },
        options: chartOptions
    })
    new Chart(barChartCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(dataObj["byDistricts"]),
            datasets: [{
                label: 'Vahvistetut tapaukset tässä sairaanhoitopiirissä',
                fill: false,
                data: Object.values(dataObj["byDistricts"]),
                backgroundColor: barColors,
                borderColor: barColors,
                borderWidth: 1
            }]
        },
        options: chartOptions
    })
}

getDataObj().then(dataObj => drawCharts(dataObj))
