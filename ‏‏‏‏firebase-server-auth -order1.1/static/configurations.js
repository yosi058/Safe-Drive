document.addEventListener("DOMContentLoaded", () => {
    const defaultEyes = 3;
    const defaultPhone = 3;
    const defaultYawning = 3;
    const defaultYawningAlert = true;


    async function drawCamerasConfButton() {
        // drawSpiner("buttonContainer")

        try {
            var camerasArr = await postRequestToServer("/dbServer/getCamerasOfUser");
            console.log(camerasArr);
        } catch (err) {
            console.log(err.message);
            return;
        }

        clearcCntainer("container");
        clearcCntainer("buttonContainer");

        var container = document.getElementById('buttonContainer');

        var button = createConfAllCameraCard(camerasArr);
        container.appendChild(button);

        camerasArr.forEach((camera) => {
            var button = createConfCameraCard(camera);
            container.appendChild(button);

        });
    }
    document.getElementById("configurations").addEventListener("click", drawCamerasConfButton);

    function createConfCameraCard(camera) {
        var div = document.createElement('div');
        div.className = "card text-white bg-secondary mb-3"
        div.style = "width: 18rem;"

        var cardHeader = document.createElement('div')
        cardHeader.className = "card-header"
        cardHeader.innerHTML = camera

        div.appendChild(cardHeader)


        var cardBody = document.createElement('div')
        cardBody.className = "card-body"

        div.appendChild(cardBody);


        var form = createConfCameraForm([camera]);
        cardBody.appendChild(form);

        return div;

    }
    function createConfCameraForm(camerasArr) {
        var form = document.createElement('form')
        form.className = "form-group"

        var args = ["eyes", "phone", "yawning"];
        args.forEach((val) => {
            var div = document.createElement('div')
            // div.innerHTML = val;
            div.className = "form-group";

            var label = document.createElement('label');
            label.innerHTML = val;
            label.htmlFor = val

            label.type = "label"

            var input = document.createElement('input')
            input.id = val;
            input.placeholder = "Enter " + val;
            input.className = "form-control";
            input.pattern = "([1-6]{1}.[1-6]{1})|[1-6]{1}";
            input.required = true;

            // input.className = "form-text text-muted"
            div.appendChild(label);
            div.appendChild(input);
            form.appendChild(div);
        })

        var div = document.createElement('div')
        div.className = "form-group";

        var label = document.createElement('label');
        label.innerHTML = " Yawning Alert";
        label.htmlFor = "yawningAlert"
        label.className = "form-check-label";
        label.type = "label"

        var input = document.createElement('input')
        input.type = "checkbox";
        input.id = "yawningAlert";
        input.className = "form-check-input";
        input.value = true;



        div.appendChild(input);
        div.appendChild(label);
        form.appendChild(div);


        var div = document.createElement('div');
        div.className = "form-group";

        var button = document.createElement('input');
        button.type = 'submit';
        button.value = "Set configurations";
        button.className = "form-control"
        button.className = 'btn btn-primary';
        div.appendChild(button);
        form.appendChild(div);


        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            // const camerasArr = camerasArr;
            const eyes = event.target.eyes.value;
            const phone = event.target.phone.value;
            const yawning = event.target.yawning.value;
            const yawningAlert = event.target.yawningAlert.checked;
            console.log(eyes)
            console.log(phone)
            console.log(yawning)
            console.log(yawningAlert)

            try {
                console.log("in try form")
                await postRequestToServer("/dbServer/setConfOfArrCamera", JSON.stringify({ camerasArr: camerasArr, eyes: eyes, phone: phone, yawning: yawning, yawningAlert: yawningAlert }));
                console.log("in try 2 form")
                drawCamerasConfButton();
            } catch (err) {
                console.log("err form")
                console.log(err.message);
                return;

            }
            drawCamerasConfButton()
            console.log("finish form")
        });
        var div = document.createElement('div');
        div.className = "form-group ";
        
        var button = document.createElement('input');
        button.type = 'submit';
        button.value = "Set to default configurations";
        button.className = "form-control"
        button.className = 'btn btn-primary';
        div.appendChild(button);
        form.appendChild(div);

        button.addEventListener("click", async () => {
            const eyes = defaultEyes;
            const phone = defaultPhone;
            const yawning = defaultYawning;
            const yawningAlert = defaultYawningAlert;
            try {
                await postRequestToServer("/dbServer/setConfOfArrCamera", JSON.stringify({ camerasArr: camerasArr, eyes: eyes, phone: phone, yawning: yawning, yawningAlert: yawningAlert }));
                drawCamerasConfButton();
            } catch (err) {
                console.log(err.message);
                return;

            }
            drawCamerasConfButton()
            console.log("finish Set to default configurations")
        })


        return form;

    }

    function createConfAllCameraCard(camerasArr) {
        var div = document.createElement('div');
        div.className = "card text-white bg-secondary mb-3"
        div.style = "width: 18rem;"

        var cardHeader = document.createElement('div')
        cardHeader.className = "card-header"
        cardHeader.innerHTML = "Set configurations for all cameras"

        div.appendChild(cardHeader)



        var cardBody = document.createElement('div')
        cardBody.className = "card-body"

        div.appendChild(cardBody);


        var form = createConfCameraForm(camerasArr);

        cardBody.appendChild(form);




        var cardText = document.createElement('p');
        cardText.className = "card-text"


        cardBody.appendChild(cardText);
        return div;

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