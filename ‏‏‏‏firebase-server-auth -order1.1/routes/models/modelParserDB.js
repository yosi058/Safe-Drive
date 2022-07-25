const DbServer = require('./modelDbServer');


//The function returns all events from travel, in the form of an array
//   arr[ |0:fell asleep|, |1:distractions|, |2:Tiredness indications|]
async function numberOfEventsInTravel(camera, id) {

    let info = await DbServer.getTravels(camera, id)
    let events = await createArrOfIvents(info)
    return events;

}

//The function changes the structure of the array. Designed for use in draw on time
async function reshapeArr(events) {
    Yawning = [];
    phone = [];
    eyesClosing = [];
    data = []
    events.forEach((arr) => {
        eyesClosing.push(arr[0]);
        phone.push(arr[1]);
        Yawning.push(arr[2]);
    });
    data.push(eyesClosing);
    data.push(phone);
    data.push(Yawning);
    return data;
}

//The function fills an array of events that were traveling
//   arr[ |0:fell asleep|, |1:distractions|, |2:Tiredness indications|]
async function createArrOfIvents(infoTravel) {
    let events = [0, 0, 0];
    infoTravel = infoTravel.slice(1);
    infoTravel.forEach((e) => {
        events[parseInt(e["status"])] += 1;
    });
    // console.log("createArrOfIvents")
    // console.log(events);
    return events;
}


//The function returns arrays of events that occurred on travels that the function received
async function numberOfEventsInAmountOfTravels(camera, arrIdTravels, isReshape = false) {
    events = [];
    let infoOnTravels = await DbServer.getAllDataOnCamera(camera, arrIdTravels)

    for (travel of infoOnTravels) {
        info = await createArrOfIvents(travel)
        events.push(info)
    }
    if (isReshape) {
        events = await reshapeArr(events)
    }

    return events;
}

//The function creates a score for each travel
async function parserGetTravelsScore(camera, arrIdTravels) {
    let yawning = 0.5; //arr[2]
    let sleep = 2; //arr[0]
    let phone = 1; //arrr[1]
    evg = [];
    max = -1;
    idWorstTravels = -1;
    arr = await numberOfEventsInAmountOfTravels(camera, arrIdTravels);
    console.log("arr");
    arr.forEach((travel, index) => {
        score = travel[0] * sleep + travel[1] * phone + travel[2] * yawning;
        evg.push(score);
        if (score > max) {
            idWorstTravels = index;
            max = score;
        }
    });
    ret = { "scoreArr": evg, "worstTravelIndex": idWorstTravels }
    return ret;
}

//The function creates an array of time and status for each travel
async function createArrOfTimeAndStatus(camera, id) {
    var travel = await DbServer.getTravels(camera, id)
    travel = travel.slice(1);

    console.log("travel in createArrOfTimeEvnts ", travel)
    let mapEvents = [[], [], []];
    travel.forEach((e) => {
        mapEvents[parseInt(e["status"])].push({ x: new Date(e["time"]), y: parseInt(e["status"]) + 1 })
    });
    console.log("createArrOfTimeEvnts")
    console.log(mapEvents);
    return mapEvents;
}

//The function creates a map with the data on each travel, in the form of an export to a file
async function numberOfEventsInSumOfTravelsToCsv(camera, arrIdTravels) {
    console.log(" in numberOfEventsInSumOfTravelsToCsv")
    console.log("camera: ", camera);
    console.log("arrIdTravels: ", arrIdTravels);
    let events = [];
    let infoOnTravels = await DbServer.getAllDataOnCamera(camera, arrIdTravels)
    for (travel of infoOnTravels) {
        if (travel.length > 0) {
            console.log("travle in numberOfEventsInSumOfTravelsToCsv: ", travel)
            var info = await createArrOfIvents(travel)
            let sleep = info[0];
            let phone = info[1];
            let yawning = info[2];
            let timeOfTravel = travel[0]["time"];
            let locations = travel[0]["locations"];
            events.push({ fell_asleep: sleep, distractions: phone, Tiredness_indications: yawning, timeOfTravel: timeOfTravel, locations: locations })
        }
    }
    return events;
}




async function main() {

    //console.log(await createArrOfTimeAndStatus("camera_9",3));
    //console.log(await parserGetTravelsScore ("camera_99",[68, 67]));
}

//main()


///////////////////////////////
module.exports = {
    numberOfEventsInTravel,
    numberOfEventsInAmountOfTravels,
    parserGetTravelsScore,
    createArrOfTimeAndStatus,
    numberOfEventsInSumOfTravelsToCsv,
}
