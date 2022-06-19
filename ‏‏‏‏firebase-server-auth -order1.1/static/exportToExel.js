document.addEventListener("DOMContentLoaded", () => {

    async function drawAllCamerasButton() {
        // drawSpiner("buttonContainer")

        try {
            var camerasArr = await postRequestToServer("/dbServer/getCamerasOfUser");
            console.log(camerasArr);
        } catch (err) {
            console.log(err.message);
            return;
        }
        var container = document.getElementById('buttonContainer');

        clearcCntainer("container");
        clearcCntainer("buttonContainer");


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
        div.className = "card text-white bg-secondary mb-3"
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
        clearcCntainer("buttonContainer");
        var container = document.getElementById("buttonContainer");



        console.log(camera)
        try {
            var tittleTravelsArr = await postRequestToServer("/dbServer/getTittleTravels", JSON.stringify({ cameraId: camera }));
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

        var form = document.createElement('form');
        form.className = "form-group"

        tittleTravelsArr.forEach((tittleTravel) => {
            console.log(tittleTravel)
            console.log(tittleTravel["numberOfTravel"])
            var travelId = tittleTravel["numberOfTravel"]
            travelIdArr.push(travelId)

            var button = document.createElement('input');
            button.type = 'button';
            button.id = 'submit';
            button.value = "show travel " + travelId;
            // button.className = 'btn';
            button.className = "btn btn-outline-success dropdown-toggle";

            button.onclick = (async function () {
                console.log(camera)
                try {
                    // var travelsArr = await postRequestToServer("/dbServer/getTravels", JSON.stringify({ cameraId: camera, travelId: travelId }));
                    var travelsArr = await postRequestToServer("/jsonToCsv/saveOneTravelToCsv", JSON.stringify({ cameraId: camera, travelId: travelId }));
                    
                    console.log(travelsArr);
                    


                } catch (err) {
                    console.log(err.message);
                    return;

                }
            });
            var checkbox = document.createElement('INPUT');
            checkbox.setAttribute("type", "checkbox");
            // checkbox.name = `checkbox ${camera}`;
            checkbox.name = `checkboxTravels`;
            checkbox.value = travelId;






            var div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(button);
            form.appendChild(div);
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
        container.appendChild(form);


        var sbmitCheckbox = document.createElement('input');
        sbmitCheckbox.type = 'button';
        sbmitCheckbox.className = "btn btn-primary";
        sbmitCheckbox.id = "sbmitCheckbox";
        sbmitCheckbox.value = "Compare all travels";
        sbmitCheckbox.addEventListener("click", async (event) => {
            let checkboxes = document.querySelectorAll('input[name="checkboxTravels"]');
            let values = [];
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
            // await drawCompareMarkedTravels(cameraId, traveslId);
            var res = await postRequestToServer("/jsonToCsv/saveAllTravelToCsv", JSON.stringify({ cameraId: cameraId, travelArrId: travelArrId }));
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
            let checkboxes = document.querySelectorAll('input[name="checkboxTravels"]:checked');
            let values = [];
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
            var res = await postRequestToServer("/jsonToCsv/saveAllTravelToCsv", JSON.stringify({ cameraId: cameraId, travelArrId: travelArrId }));
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



    function postRequestToServer(path, body = "") {

        return new Promise((resolve, reject) => {
            fetch(path, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                },
                body: body,
            }).then(response => response.json())

                .then(json => {
                    console.log("in postRequestToServer");
                    resolve(json);
                })
                .catch(err => {
                    console.log(err.message)
                    reject(err)
                });
        })
    }

    ////////////////////////////////////////////////////////////////////////////////////


})




