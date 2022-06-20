const parserDB = require('./modelParserDB');

async function viewOnOneTravel(camera, info) {
    var id = info.numberOfTravel;
    // let response = await DbServer.getTravels(camera, id)
    // console.log(response);
    console.log("camera ", camera)
    console.log("id ", id)
    ret = await parserDB.numberOfEventsInTravel(camera, id);
    console.log(ret)

    console.log("ret[0]:" + ret[0])
    console.log("ret[1]:" + ret[1])
    console.log("ret[2]:" + ret[2])

    var text ="";
    if((ret[0] != 0 || ret[0] != 0||ret[0] != 0)){
    text = "All events that occurred while traveling in the 'pie' graph"
    }
    else{
        text = "splendid! There were no events on this travel!"
    }


    return myJson = {

        type: 'pie', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
        data: {
            labels: ['fell asleep', 'distractions', 'Tiredness indications'],
            datasets: [{
                label: 'Population',
                data: [
                    ret[0],
                    ret[1],
                    ret[2]
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)'
                ],
                borderWidth: 1,
                borderColor: '#777',
                hoverBorderWidth: 3,
                hoverBorderColor: '#000'
            }]
          
        },
        options: {
            plugins: {
            title: {
                display: true,
                text: text,
                font: {
                    size: 25
                },
                padding: {
                    top: 10,
                    bottom: 10,
                }
            },
            subtitle: {
                display: true,
                text: 'The travel start at '+ info.time + '  in "'+ info.locations +'"',
                font: {
                    size: 20
                },
                padding: {
                    top: 10,
                    bottom: 10,
                }
            }
        },
        }
    }
}

async function viewOnAmountTravels(camera, arrId) {
    ret = await parserDB.numberOfEventsInAmountOfTravels(camera, arrId, true);
    console.log("ret")
    console.log(ret)
    let red = [];
    let yellow = [];
    let orange = [];
    let black = [];
    labels = []

    arrId.forEach(element => {
       labels.push("travel: " + element)
    });
    

    ret.forEach(element => {
        red.push('#8b0000');
        yellow.push('#f0e68c');
        orange.push('#ff8c00');
        black.push('rgba(0, 0, 0, 1)');
    });
    red.push('#8b0000');
    yellow.push('#f0e68c');
    orange.push('#ff8c00');
    black.push('rgba(0, 0, 0, 1)');

    return myChart = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tiredness indications',
                data: ret[2],
                backgroundColor: yellow,
                borderColor: black,
                borderWidth: 1
            }, {
                label: 'distractions',
                data: ret[1],
                backgroundColor: orange,
                borderColor: black,
                borderWidth: 1
            }, {
                label: 'fell asleep',
                data: ret[0],
                backgroundColor: red,
                borderColor: black,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                // yAxes: [{
                //     ticks: { beginAtZero: true },
                //     stacked: true
                // }],
                // xAxes: [{
                //     stacked: true
                // }]
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Travel comparison in ' + camera,
                    font: {
                        size: 25
                    },
                    padding: {
                        top: 50,
                        bottom: 50,
                        font: {
                            size: 50
                        }
                    }
                }
            }
        }
    };
}

async function chartTravelsOnTimes(camera, Id) {
    console.log("start of chart TravelsOnTimes");
    var time = await parserDB.createArrOfTimeAndStatus(camera, Id)
    console.log(time);

    var dataPointsPhone = time[1];
    var dataPointsEye = time[2];
    var dataPointsyawning = time[0];

    var colorEye = Array(dataPointsPhone.length).fill('rgba(255, 26, 104, 0.2)');
    var colorPhone = Array(dataPointsEye.length).fill('rgba(36, 36, 36, 1)');
    var coloryawning = Array(dataPointsyawning.length).fill('rgba(11, 156, 49, 1)');

    const data = {
        datasets: [{
            label: 'fell asleep ',
            data: dataPointsPhone,
            backgroundColor: colorEye,
            borderColor: colorEye,
            showLine: false

        }, {
            label: 'distractions',
            data: dataPointsEye,
            backgroundColor: colorPhone,
            borderColor: colorPhone,
            showLine: false
        }, {
            label: 'Tiredness indications',
            data: dataPointsyawning,
            backgroundColor: coloryawning,
            borderColor: coloryawning,
            showLine: false
        }
        ]
    }
    ;
    var ret = { "data": data };
    return ret;
}

async function main() {
    viewOnAmountTravels("camera_7", [1, 2, 3, 4])
}
// main();


module.exports = {
    viewOnOneTravel,
    viewOnAmountTravels,
    chartTravelsOnTimes,
}
