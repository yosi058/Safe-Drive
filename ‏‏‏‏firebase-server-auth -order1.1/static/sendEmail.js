

document.addEventListener("DOMContentLoaded", () => {

    async function drawCamerasSendEmailButton() {
        clearcCntainer("mainContainer");
        clearcCntainer("chartContainer");
        drawSpiner();
        var currentEmail= await postRequestToServer("/dbServer/getEmail", JSON.stringify({ cameraId: "camera_1" }));

        try {
            var camerasArr = await postRequestToServer("/dbServer/getCamerasOfUser");
            console.log(camerasArr);
        } catch (err) {
            console.log(err.message);
            return;
        }



        var container = document.getElementById('mainContainer');

        // var button = createAddCameraCard();

        // container.appendChild(button);

        camerasArr.forEach(async(camera) => {
            createAddCameraCard(camera).then((response)=>{
                container.appendChild(response);
            }).catch((err)=>{
                console.log(err.message)
            });
            

        });
        deletSpiner();
    }
    document.getElementById("sendEmail").addEventListener("click", drawCamerasSendEmailButton);



    // function createDeleteCameraCard(camera) {
    //     var cardDiv = document.createElement('div');
    //     cardDiv.className = "card text-white bg-dark mb-3"
    //     cardDiv.style = "width: 18rem;"

    //     var cardHeader = document.createElement('div')
    //     cardHeader.className = "card-header"
    //     cardHeader.innerHTML = camera

    //     cardDiv.appendChild(cardHeader)



    //     var cardBody = document.createElement('div')
    //     cardBody.className = "card-body"

    //     cardDiv.appendChild(cardBody);

    //     var editDiv = createAditEmail(camera);
    //     cardBody.appendChild(editDiv);

    //     var form = document.createElement('form')
    //     form.className = "form-group"
    //     cardBody.appendChild(form);


    //     var myHref = document.createElement('a');
    //     myHref.setAttribute("href",`/sendEmail?val=${camera}`)
    //     myHref.setAttribute("value","send email")
    //     myHref.innerHTML="send email"

    //     var div = document.createElement('div');
    //     div.appendChild(myHref);
    //     cardBody.appendChild(div);





    //     var button = document.createElement('input');
    //     button.type = 'submit';
    //     button.value = "Send email";
    //     button.className = "form-control"
    //     button.className = 'btn btn-primary ';

    //     form.appendChild(button);



    //     form.addEventListener("submit", async (event) => {
    //         event.preventDefault();
    //         drawSpiner();

    //         try {
    //             var tittleTravelsArr = await postRequestToServer("/dbServer/deleteCamera", JSON.stringify({ cameraId: camera }));
    //             console.log(tittleTravelsArr);
    //         } catch (err) {
    //             console.log(err.message);
    //             return;

    //         }
    //         deletSpiner();
    //         drawCamerasSendEmailButton()
    //     });






    //     return cardDiv;

    // }

    // function createAditEmail(camera) {
    //     var div = document.createElement('div')
    //     // div.innerHTML = val;
    //     div.className = "form-group";

    //     var label = document.createElement('label');


    //     label.innerHTML = "current email: " + camera



    //     label.htmlFor = "email"

    //     label.type = "label"

    //     var input = document.createElement('input')
    //     input.id = "email";
    //     input.type = "email"
    //     input.placeholder = "Enter " + "email";
    //     input.className = "form-control rounded-pill";
    //     input.style = "opacity:0.8;"
    //     input.required = true;
    //     // input.className = "form-text text-muted"
    //     div.appendChild(label);
    //     div.appendChild(input);

    //     return div;

    // }

    async function createAddCameraCard(camera) {
        var cardDiv = document.createElement('div');
        cardDiv.className = "card text-white bg-dark mb-3"
        cardDiv.style = "width: 18rem;"

        var cardHeader = document.createElement('div')
        cardHeader.className = "card-header"
        cardHeader.innerHTML = camera

        cardDiv.appendChild(cardHeader)



        var cardBody = document.createElement('div')
        cardBody.className = "card-body"

        cardDiv.appendChild(cardBody);


        var form = document.createElement('form')
        form.className = "form-group"
        cardBody.appendChild(form);

        var currentEmail
        try {
            currentEmail = await postRequestToServer("/dbServer/getEmail", JSON.stringify({ cameraId: camera }));
            console.log("currentEmail",currentEmail);
        } catch (err) {
            console.log(err.message);
            return;

        }

        var label = document.createElement('label');
        label.innerHTML = "current email: " + currentEmail
        label.htmlFor = "email"
        label.type = "label"
        label.className="p-2"


        var input = document.createElement('input')
        input.id = "email"
        input.type = "email"
        input.placeholder = "Enter new email"
        // input.className = "form-text text-muted";
        input.className = "form-control rounded-pill";
        input.style = "opacity:0.8;"
        input.required = true;
        var div = document.createElement('div');
        div.appendChild(label)
        div.appendChild(input);
        form.appendChild(div);
        div.className="p-3"
        



        var button = document.createElement('input');
        button.type = 'submit';
        button.value = "Set email";
        button.className = "form-control "

        form.appendChild(button);

        var cardText = document.createElement('p');
        cardText.className = "card-text"


        button.className = 'btn btn-primary';



        form.addEventListener("submit", async (event) => {
            drawSpiner();
            event.preventDefault();
            var email = event.target.email.value;

            


            try {
                var isSuccess = await postRequestToServer("/dbServer/setEmail", JSON.stringify({cameraId:camera, email: email }));
                console.log(isSuccess);
                if (!isSuccess) {
                    alert("camera name or password incorrect");
                }
            } catch (err) {
                console.log(err.message);
                return;

            }
            deletSpiner();
            drawCamerasSendEmailButton()
        })








        cardBody.appendChild(cardText);






        var myHref = document.createElement('a');
        myHref.setAttribute("href", `/sendEmail?val=${camera}`)
        myHref.setAttribute("value", "Send email")
        myHref.innerHTML = "Send email"
        myHref.className = 'btn btn-primary';

        var div = document.createElement('div');
        div.appendChild(myHref);
        cardBody.appendChild(div);




        return cardDiv;

    }

})