document.addEventListener("DOMContentLoaded", () => {


    async function drawAllCamerasButton() {
        clearcCntainer("mainContainer");
        clearcCntainer("chartContainer");
        drawSpiner();

        try {
            var camerasArr = await postRequestToServer("/dbServer/getCamerasOfUser");
            console.log(camerasArr);
        } catch (err) {
            console.log(err.message);
            return;
        }
        var container = document.getElementById('mainContainer');

        deletSpiner();


        camerasArr.forEach((camera) => {

            var button = createCameraCard(camera);
            button.addEventListener("click", () => {
                drawAllTittleTravelsButton(camera);
            })


            container.appendChild(button);
        });

    }


    function createCameraCard(camreId) {
        var div = document.createElement('div');
        div.className = "card text-white bg-dark mb-3"
        div.style = "width: 18rem;"
        div.id = camreId

        var cardHeader = document.createElement('div')
        cardHeader.className = "card-header"
        cardHeader.innerHTML = camreId

        div.appendChild(cardHeader)



        var cardBody = document.createElement('div')
        cardBody.className = "card-body"

        div.appendChild(cardBody);


        var cardText = document.createElement('p');
        cardText.className = "card-text"
        cardText.id = `card-text ${camreId}`


        var button = document.createElement('input');
        button.type = 'button';
        button.id = 'submit';
        button.value = "Show travels";


        button.className = 'btn btn-primary';


        // button.onclick = onclickFunck;

        cardBody.appendChild(button);
        cardBody.appendChild(cardText);
        return div;

    }

    document.getElementById("exportToExel").addEventListener("click", drawAllCamerasButton);

    async function drawAllTittleTravelsButton(camera) {
        clearcCntainer("mainContainer");
        clearcCntainer("chartContainer");
        drawSpiner();

        var container = document.getElementById("mainContainer");



        console.log(camera)
        try {
            var tittleTravelsArr = await postRequestToServer("/dbServer/getTittleTravels", JSON.stringify({ cameraId: camera }));
            // tittleTravelsArr = tittleTravelsArr.reverse();
            console.log(tittleTravelsArr);

        } catch (err) {
            console.log(err.message);
            return;

        }


        if ((tittleTravelsArr.length) < 1) {
            var cardText = document.getElementById(`card-text ${camera}`);
            cardText.innerHTML = "no travels";
            return;
        }
        var travelIdArr = []
        var buttonsArr = []

        var scrollDiv = document.createElement('div');
        scrollDiv.setAttribute("class", "overflow-auto p-3 mb-3 mb-md-0 me-md-3 bg-light")
        scrollDiv.setAttribute("style", "max-height: 500px;")
        // var scrollDiv = document.createElement('form');
        // scrollDiv.className = "form-group"

        tittleTravelsArr.forEach((tittleTravel) => {
            console.log(tittleTravel)
            console.log(tittleTravel["numberOfTravel"])
            var travelId = tittleTravel["numberOfTravel"]
            var travelTime = tittleTravel["time"];
            travelIdArr.push(travelId)

            var button = document.createElement('input');
            button.type = 'button';
            button.id = 'submit';
            button.value = "travel: " + travelTime;
            // button.className = 'btn';
            button.className = "btn btn-outline-success dropdown-toggle";

            button.onclick = (async function () {
                drawSpiner();
                console.log(camera)
                try {
                    // var travelsArr = await postRequestToServer("/dbServer/getTravels", JSON.stringify({ cameraId: camera, travelId: travelId }));
                    // var travelsArr = await postRequestToServer("/jsonToCsv/saveOneTravelToCsv", JSON.stringify({ cameraId: camera, travelId: travelId }));
                    var body = JSON.stringify({ cameraId: camera, travelId: travelId });
                    var fileName = `${camera}Travel${travelId}`
                    var res = await downloadPostRequest("/jsonToCsv/saveOneTravelToCsv", body, fileName);


                    // fetch("/jsonToCsv/saveOneTravelToCsv", {
                    //     method: "POST",
                    //     headers: {
                    //         Accept: "application/json",
                    //         "Content-Type": "application/json",
                    //         "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                    //     },
                    //     body: body,
                    // })
                    //     .then((res) => {
                    //         console.log(res)
                    //         return res.blob();
                    //     })
                    //     .then((data) => {
                    //         var a = document.createElement("a");
                    //         a.href = window.URL.createObjectURL(data);
                    //         console.log(data)
                    //         a.download = `${camera}Travel${travelId}`;
                    //         a.click();
                    //     });

                    // console.log(travelsArr);



                } catch (err) {
                    console.log(err.message);
                    return;

                }
                deletSpiner();
            });
            var checkbox = document.createElement('INPUT');
            checkbox.setAttribute("type", "checkbox");
            // checkbox.name = `checkbox ${camera}`;
            checkbox.name = `checkboxTravels`;
            checkbox.value = travelId;






            var div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(button);
            scrollDiv.appendChild(div);
            buttonsArr.push(button);


            var menuDiv = document.createElement('div');
            menuDiv.className = "dropdown-menu";
            menuDiv.ariaLabel = "dropdownMenuButton";
            var a = document.createElement('a');
            a.className = "dropdown-item";
            a.innerHTML = "action"
            menuDiv.appendChild(a);
            var a = document.createElement('a');
            a.className = "dropdown-item";
            a.innerHTML = "action2"
            menuDiv.appendChild(a);
            div.appendChild(menuDiv);
            div.className = "dropdown show"


        });
        deletSpiner();
        var div = document.createElement("div")
        div.setAttribute("class", "overflow-auto")
        div.appendChild(scrollDiv);
        container.appendChild(div)


        var sbmitCheckbox = document.createElement('input');
        sbmitCheckbox.type = 'button';
        sbmitCheckbox.className = "btn btn-primary";
        sbmitCheckbox.id = "sbmitCheckbox";
        sbmitCheckbox.value = "Compare all travels";
        sbmitCheckbox.addEventListener("click", async (event) => {
            drawSpiner();
            var checkboxes = document.querySelectorAll('input[name="checkboxTravels"]');
            var values = [];
            console.log("values", values)
            checkboxes.forEach((checkbox) => {
                values.push(checkbox.value);
            });
            if (values.length <= 0) {
                alert("There is no travels for this camera");
                return;
            }
            var cameraId = camera;
            var travelArrId = values;

            var body = JSON.stringify({ cameraId: camera, travelArrId: travelArrId });
            var fileName = `${camera}allTravelS`;
            var res = await downloadPostRequest("/jsonToCsv/saveAllTravelToCsv", body, fileName);

            deletSpiner();
        })


        var div = document.createElement('div');
        div.appendChild(sbmitCheckbox);
        container.appendChild(div);

        // ///////////////////////////////////////////////////////////////
        var sbmitCheckbox = document.createElement('input');
        sbmitCheckbox.type = 'button';
        sbmitCheckbox.className = "btn btn-primary";
        sbmitCheckbox.id = "sbmitCheckbox";
        sbmitCheckbox.value = "Compare marked travels";
        sbmitCheckbox.addEventListener("click", async (event) => {
            drawSpiner();
            var checkboxes = document.querySelectorAll('input[name="checkboxTravels"]:checked');
            var values = [];
            console.log("values", values)
            checkboxes.forEach((checkbox) => {
                values.push(checkbox.value);
            });
            if (values.length <= 0) {
                alert("You need to mark the traves you want to compare");
                return;
            }

            var cameraId = camera;
            var travelArrId = values;
            // await drawCompareMarkedTravels(cameraId, traveslId);
            // var res = await postRequestToServer("/jsonToCsv/saveAllTravelToCsv", JSON.stringify({ cameraId: cameraId, travelArrId: travelArrId }));
            var body = JSON.stringify({ cameraId: camera, travelArrId: travelArrId });
            var fileName = `${camera}allTravelS`;
            var res = await downloadPostRequest("/jsonToCsv/saveAllTravelToCsv", body, fileName);
            deletSpiner();
        })

        var div = document.createElement('div');
        div.appendChild(sbmitCheckbox);
        container.appendChild(div);

        // ///////////////////////////////////////////////////////////////




        // ///////////////////////////////////////////////////////////////


        var sbmitCheckbox = document.createElement('input');
        sbmitCheckbox.type = 'button';
        sbmitCheckbox.className = "btn btn-primary";
        sbmitCheckbox.id = "sbmitCheckbox";
        sbmitCheckbox.value = "Show the worst travel";



        var div = document.createElement('div');
        div.appendChild(sbmitCheckbox);
        container.appendChild(div);


        var worstTravelbutton = await drawTravelScore(buttonsArr, camera, travelIdArr);
        sbmitCheckbox.addEventListener("click", async (event) => {
            worstTravelbutton.onclick();
        });
    }

    async function drawTravelScore(buttonsArr, camera, travelIdArr) {
        console.log("in drawScore");
        console.log("travelIdArr ", travelIdArr)

        var travelsScoreArr = await postRequestToServer('/queries/getTravelsScore', JSON.stringify({ 'camera': camera, 'travelIdArr': travelIdArr }))
        console.log(travelsScoreArr)
        buttonsArr.forEach((button, index) => {
            button.value = button.value + " " + travelsScoreArr['scoreArr'][index]
        })
        worstTravelIndex = travelsScoreArr['worstTravelIndex']
        buttonsArr[worstTravelIndex].style.backgroundColor = "red";
        // travelsScoreArr
        return buttonsArr[worstTravelIndex]

    }


    ///////////////////////////////  SERVER REQUEST   /////////////////////////////////////



    // function postRequestToServer(path, body = "") {

    //     return new Promise((resolve, reject) => {
    //         fetch(path, {
    //             method: "POST",
    //             headers: {
    //                 Accept: "application/json",
    //                 "Content-Type": "application/json",
    //                 "CSRF-Token": Cookies.get("XSRF-TOKEN"),
    //             },
    //             body: body,
    //         }).then(response => response.json())

    //             .then(json => {
    //                 console.log("in postRequestToServer");
    //                 resolve(json);
    //             })
    //             .catch(err => {
    //                 console.log(err.message)
    //                 reject(err)
    //             });
    //     })
    // }

    ////////////////////////////////////////////////////////////////////////////////////


})




