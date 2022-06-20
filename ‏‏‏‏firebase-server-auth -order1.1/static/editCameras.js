document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("editCameras").addEventListener("click", drawCamerasEditButton);
})

    async function drawCamerasEditButton() {
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

        var button = createAddCameraCard();
        
        container.appendChild(button);

        camerasArr.forEach((camera) => {
            var button = createDeleteCameraCard(camera);
            container.appendChild(button);

        });
        deletSpiner();
    }
    // document.getElementById("editCameras").addEventListener("click", drawCamerasEditButton);

    function createDeleteCameraCard(camera) {
        var div = document.createElement('div');
        div.className = "card text-white bg-dark mb-3"
        div.style = "width: 18rem;"

        var cardHeader = document.createElement('div')
        cardHeader.className = "card-header"
        cardHeader.innerHTML = camera

        div.appendChild(cardHeader)



        var cardBody = document.createElement('div')
        cardBody.className = "card-body"

        div.appendChild(cardBody);


        var form = document.createElement('form')
        form.className = "form-group"
        cardBody.appendChild(form);





        var button = document.createElement('input');
        button.type = 'submit';
        button.value = "Delete camera";
        button.className = "form-control"
        button.className = 'btn btn-danger ';

        form.appendChild(button);



        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            drawSpiner();

            try {
                var tittleTravelsArr = await postRequestToServer("/dbServer/deleteCamera", JSON.stringify({ cameraId: camera }));
                console.log(tittleTravelsArr);
            } catch (err) {
                console.log(err.message);
                return;

            }
            deletSpiner();
            drawCamerasEditButton()
        });



        return div;

    }

    function createAddCameraCard() {
        var div = document.createElement('div');
        div.className = "card text-white bg-dark mb-3"
        div.style = "width: 18rem;"

        var cardHeader = document.createElement('div')
        cardHeader.className = "card-header"
        cardHeader.innerHTML = "Adding a new camera"

        div.appendChild(cardHeader)



        var cardBody = document.createElement('div')
        cardBody.className = "card-body"

        div.appendChild(cardBody);


        var form = document.createElement('form')
        form.className = "form-group"
        cardBody.appendChild(form);


        var input = document.createElement('input')
        input.id = "camera"
        input.placeholder = "Enter camera ID"
        input.className = "form-text text-muted";
        input.autocomplete = "username"
        input.required = true;
        form.appendChild(input);

        var input = document.createElement('input')
        input.id = "pass"
        input.placeholder = "Enter password"
        input.className = "form-text text-muted"
        input.type = "password"
        input.autocomplete = "current-password"
        input.required = true;
        form.appendChild(input);


        var button = document.createElement('input');
        button.type = 'submit';
        button.value = "Add camera";
        button.className = "form-control"

        form.appendChild(button);

        var cardText = document.createElement('p');
        cardText.className = "card-text"


        button.className = 'btn btn-primary';



        form.addEventListener("submit", async (event) => {
            drawSpiner();
            event.preventDefault();
            const camera = event.target.camera.value;
            const pass = event.target.pass.value;

            console.log(pass)


            try {
                var isSuccess = await postRequestToServer("/dbServer/updateCamera", JSON.stringify({ cameraId: camera, pass: pass }));
                console.log(isSuccess);
                if (!isSuccess) {
                    alert("camera name or password incorrect");
                }
            } catch (err) {
                console.log(err.message);
                return;

            }
            deletSpiner();
            drawCamerasEditButton()
        })


        cardBody.appendChild(cardText);
        return div;

    }

// })