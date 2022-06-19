const JSONToCsv = require("json2csv").parse;
const FileSystem = require("fs");
const DbServer = require('./modelDbServer');
const parserDB = require('./modelParserDB');

// var source = {"ori": "1", "ori1": "4", "ori2":"5"}

// const csv = JSONToCsv(source,{fields:["ori","ori1","ori2"]});
// FileSystem.writeFileSync("./testcsv.csv",csv);

async function saveOneTravelToCsv(camera, id) {
    info = await DbServer.getTravels(camera, id);
    const csv = JSONToCsv(info, { fields: ["time", "status", "massege", "locations"] });
    FileSystem.writeFileSync(`./${camera}Travel${id}.csv`, csv);
    return true;
}

async function saveALLTravelToCsv(camera, idArr) {
    console.log("in saveALLTravelToCsv" );
    var info = await parserDB.numberOfEventsInSumOfTravelsToCsv(camera, idArr);
    // console.log("info in csv", info)
    const csv = JSONToCsv(info, { fields: ["sleep", "phone", "yawning", "locations", "timeOfTravel"] });
    try {
        FileSystem.writeFileSync(`./${camera}allTravelS.csv`, csv);
    } catch (err) {
        console.log("error!: ", err.message);

    }
    return true;
}
async function deleteFile(isAll, camera, id) {
    let fileMame = null;
    if (isAll) {
        fileMame = `./${camera}Travel${id}.csv`;
    }
    else {
        fileMame = `./${camera}allTravelS.csv`;
    }
    FileSystem.unlink(fileMame, (err) => {
        if (err) {
            console.log("error in deleteFile: ", err);
        }
        else {
            console.log("File is deleted.");
        }
    });
    return true;
}

async function main() {
    // saveOneTravelToCsv("camera_7", 3);
    // saveALLTravelToCsv("camera_7", [1,2,3,4])
    deleteFile(true, "camera_7", 3);
    deleteFile(false, "camera_7", 3);


}


// main();


module.exports = {
    saveOneTravelToCsv,
    saveALLTravelToCsv,
    deleteFile,
}