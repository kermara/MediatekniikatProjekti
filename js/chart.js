const getTwoMonthAgoDate = () => {
    const todaysDate = new Date();
    let twoMonthAgoDate = new Date(todaysDate.valueOf());
    const twoMonthAgoMonth = todaysDate.getMonth() - 2;
    twoMonthAgoDate.setMonth(twoMonthAgoMonth)
    const twoMonthAgoDateFormatted = twoMonthAgoDate.getFullYear() + '-' +  ('0' + (twoMonthAgoDate.getMonth() +1 )).slice(-2) + '-' + ('0' + twoMonthAgoDate.getDate()).slice(-2);
    return twoMonthAgoDateFormatted
}

const getConfirmedCasesByDate = (confirmedCases) => {
    const datesOfConfirmedCases = confirmedCases.map(confirmedCase => confirmedCase.date.split("T").splice(0, 1).toString()).reverse()
    const twoMonthAgoDate = getTwoMonthAgoDate()
    let confirmedCasesByDate = {}
    let caseCounter = 0;
    datesOfConfirmedCases.forEach((date, i) => {
        if (date === twoMonthAgoDate) {
            return
        } 
        else {
            caseCounter++;
            if (date !== datesOfConfirmedCases[i + 1]) {
                confirmedCasesByDate[date] = caseCounter
                caseCounter = 0;
            }
        }
    })
    return confirmedCasesByDate
}

const ctx = document.querySelector('#chart').getContext('2d'); // context of the chart describing element

async function getData () {
    try {
        const response = await fetch('https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData/v2');
        if (!response.ok) throw new Error('jokin meni pieleen');
        const formattedResponse = await response.json();
        const confirmedCases = formattedResponse.confirmed
        const confirmedCasesByDate = getConfirmedCasesByDate(confirmedCases)
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(confirmedCasesByDate).reverse(),
                datasets: [{
                    label: 'Confirmed cases in Finland for the past 2 months',
                    fill: false,
                    data: Object.values(confirmedCasesByDate).reverse(),
                    backgroundColor: "red",
                    borderColor: "red",
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Confirmed cases"
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Time"
                        }
                    }]
                }
            }
        })
    } catch (error) {
        console.log(error)
    }
}

getData()