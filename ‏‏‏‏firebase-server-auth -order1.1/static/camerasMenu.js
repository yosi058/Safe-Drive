document.addEventListener("DOMContentLoaded", () => {
    async function drawAllCamerasButton() {
        
        clearcCntainer("mainContainer");
        clearcCntainer("chartContainer");
        clearcCntainer("buttonContainer");
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
            var onclickFunck = (function () { return drawAllTittleTravelsButton(camera) });
            var button = createCameraCard(camera, onclickFunck);


            container.appendChild(button);
        });

    }

    document.getElementById("CamerasMenu").addEventListener("click", drawAllCamerasButton);


    async function drawAllTittleTravelsButton(camera) {
        clearcCntainer("mainContainer");
        clearcCntainer("chartContainer");
        drawSpiner();

        var mainContainer = document.getElementById("mainContainer");
        var buttonContainer = document.getElementById("buttonContainer");




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

        var scrollDiv = document.createElement('div');
        scrollDiv.setAttribute("class", "border border-primary rounded overflow-auto p-3 mb-3 mb-md-0 me-md-3")
        scrollDiv.setAttribute("style", "max-height: 500px")
        // scrollDiv.setAttribute("style","width: 500px")


        tittleTravelsArr.forEach((infoTravel) => {
            console.log(infoTravel)
            console.log(infoTravel["numberOfTravel"])
            var travelId = infoTravel["numberOfTravel"]
            var travelTime = infoTravel["time"];
            var travelLocations = infoTravel["locations"];
            travelIdArr.push(travelId)

            var button = document.createElement('button');
            button.type = 'button';
            button.id = 'dropdownMenuButton' + travelTime;
            // button.innerHTML = "travel: " + travelTime + "<br />" + travelLocations;
            button.innerHTML = "travel: " + travelTime + " " + travelLocations;
            button.setAttribute("style", "width: 500px;border-color: white; border-bottom: solid; border-bottom-width: thin;")
            // button.className = 'btn';
            button.className = "btn btn-outline-primary dropdown-toggle rounded-0";
            button.setAttribute("data-toggle", "dropdown");
            button.setAttribute("aria-haspopup", "true");
            button.setAttribute("aria-expanded", "false");
            //  aria-haspopup="true" aria-expanded="false"



            // button.onclick = (async function () {
            //     console.log(camera)
            //     try {
            //         var travelsArr = await postRequestToServer("/dbServer/getTravels", JSON.stringify({ cameraId: camera, travelId: travelId }));
            //         console.log(travelsArr);
            //         await drawPieOneTravel(camera, travelId);
            //         await drawTarvelsOnTime(camera, travelId);



            //     } catch (err) {
            //         console.log(err.message);
            //         return;

            //     }
            // });
            var checkbox = document.createElement('INPUT');
            checkbox.setAttribute("type", "checkbox");
            // checkbox.name = `checkbox ${camera}`;
            checkbox.name = `checkboxTravels`;
            checkbox.value = travelId;
            checkbox.className = "form-check-input me-2"
            // checkbox.value = tittleTravel;







            var div = document.createElement('div');

            div.appendChild(checkbox);
            div.appendChild(button);
            scrollDiv.appendChild(div);
            buttonsArr.push(div);


            var menuDiv = document.createElement('div');
            menuDiv.className = "dropdown-menu";
            menuDiv.ariaLabel = 'dropdownMenuButton' + travelTime;;
            var a = document.createElement('a');
            a.type = "button";
            a.className = "dropdown-item";
            a.innerHTML = "drawPieOneTravel"
            a.value = "action"
            a.onclick = async () => {
                try {
                    await drawPieOneTravel(camera, infoTravel);
                } catch (err) {
                    console.log(err.message);
                    return;
                }
            }
            // a.addEventListener("click", async () => {
            //     try {
            //         await drawPieOneTravel(camera, infoTravel);
            //     } catch (err) {
            //         console.log(err.message);
            //         return;
            //     }
            // });
            menuDiv.appendChild(a);
            var a = document.createElement('a');
            a.type = "button";
            a.className = "dropdown-item";
            a.innerHTML = "drawTarvelsOnTime"
            a.value = "action2"
            a.onclick = async () => {
                try {
                    await drawTarvelsOnTime(camera, infoTravel);
                } catch (err) {
                    console.log(err.message);
                    return;
                }
            }
            // a.addEventListener("click", async () => {
            //     try {
            //         await drawTarvelsOnTime(camera, infoTravel);
            //     } catch (err) {
            //         console.log(err.message);
            //         return;
            //     }
            // });
            menuDiv.appendChild(a);
            div.appendChild(menuDiv);
            div.className = "dropdown"


        });
        deletSpiner();
        // clearcCntainer("buttonContainer");
        var div = document.createElement("div")
        // div.className= "overflow-auto"
        div.setAttribute("class", "overflow-auto")
        div.appendChild(scrollDiv);
        mainContainer.appendChild(div);


        var compareAllButton = document.createElement('input');
        compareAllButton.type = 'button';
        compareAllButton.className = "btn btn-primary";
        compareAllButton.id = "compareAllButton";
        compareAllButton.value = "Compare all travels";
        compareAllButton.addEventListener("click", async (event) => {
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
            var traveslId = values;
            await drawCompareMarkedTravels(cameraId, traveslId);
        })


        var div = document.createElement('div');
        div.className="p-2"
        div.appendChild(compareAllButton);
        buttonContainer.appendChild(div);

        // ///////////////////////////////////////////////////////////////
        var compareMarkedButton = document.createElement('input');
        compareMarkedButton.type = 'button';
        compareMarkedButton.className = "btn btn-primary";
        compareMarkedButton.id = "compareMarkedButton";
        compareMarkedButton.value = "Compare marked travels";
        compareMarkedButton.addEventListener("click", async (event) => {
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
            var traveslId = values;
            await drawCompareMarkedTravels(cameraId, traveslId);
        })

        var div = document.createElement('div');
        div.appendChild(compareMarkedButton);
        div.className="p-2"
        buttonContainer.appendChild(div);

        // ///////////////////////////////////////////////////////////////


        var compareMarkedButton = document.createElement('input');
        compareMarkedButton.type = 'button';
        compareMarkedButton.className = "btn btn-primary";
        compareMarkedButton.id = "BackToCamerasMenue";
        compareMarkedButton.value = "Back to all cameras";
        compareMarkedButton.addEventListener("click", async (event) => {
            await drawAllCamerasButton();
        })

        var div = document.createElement('div');
        div.appendChild(compareMarkedButton);
        div.className="p-2"
        buttonContainer.appendChild(div);



        // ///////////////////////////////////////////////////////////////

        var myHref = document.createElement('a');
        myHref.setAttribute("href", `/sendEmail?val=${camera}`)
        myHref.setAttribute("value", "send email")
        myHref.innerHTML = "send email"
        myHref.className = "btn btn-primary"

        var div = document.createElement('div');
        div.appendChild(myHref);
        div.className="p-2"
        buttonContainer.appendChild(div);


        // ///////////////////////////////////////////////////////////////

        var worstTravelDiv = await drawTravelScore(buttonsArr, camera, travelIdArr);

        var worstTravelPieButton = document.createElement('input');
        worstTravelPieButton.type = 'button';
        worstTravelPieButton.className = "btn btn-primary";
        worstTravelPieButton.value = "Draw the worst travel Pie";
        worstTravelPieButton.id = "DrawTheWorstTravelPie";



        var div = document.createElement('div');
        div.className="p-2"
        div.appendChild(worstTravelPieButton);
        buttonContainer.appendChild(div);



        worstTravelPieButton.addEventListener("click", async (event) => {
            var a = worstTravelDiv.querySelectorAll('a')
            console.log(a[0]);
            a[0].onclick()
            console.log(worstTravelDiv.querySelectorAll('a'))
        });


        var worstTravelOnTimeButton = document.createElement('input');
        worstTravelOnTimeButton.type = 'button';
        worstTravelOnTimeButton.className = "btn btn-primary";
        worstTravelOnTimeButton.value = "Draw the worst travel On Time";
        worstTravelOnTimeButton.value = "worstTravelOnTimeButton";



        var div = document.createElement('div');
        div.className = "p-2"
        div.appendChild(worstTravelOnTimeButton);
        buttonContainer.appendChild(div);



        worstTravelOnTimeButton.addEventListener("click", async (event) => {
            var a = worstTravelDiv.querySelectorAll('a')
            console.log(a[1]);
            a[1].onclick()
            console.log(worstTravelDiv.querySelectorAll('a'))
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
        console.log(buttonsArr[worstTravelIndex].getElementsByTagName('button'))
        // buttonsArr[worstTravelIndex].getElementsByTagName('button').style.color = "red";
        buttonsArr[worstTravelIndex].getElementsByTagName('button')[0].className = "btn btn-outline-danger dropdown-toggle"
        // setAttribute("class","btn btn-outline-danger  dropdown-toggle")

        // travelsScoreArr
        return buttonsArr[worstTravelIndex]

    }



    function createCameraCard(name, onclickFunck) {
        var div = document.createElement('div');
        div.className = "card text-white bg-dark mb-3"
        div.style = "width: 18rem;"
        div.id = name

        var cardHeader = document.createElement('div')
        cardHeader.className = "card-header"
        cardHeader.innerHTML = name

        div.appendChild(cardHeader)



        var cardBody = document.createElement('div')
        cardBody.className = "card-body"

        div.appendChild(cardBody);


        var cardText = document.createElement('p');
        cardText.className = "card-text"
        cardText.id = `card-text ${name}`


        var button = document.createElement('input');
        button.type = 'button';
        button.id = 'submit';
        button.value = "Show travels";


        button.className = 'btn btn-primary';


        button.onclick = onclickFunck;

        cardBody.appendChild(button);
        cardBody.appendChild(cardText);
        return div;

    }

})