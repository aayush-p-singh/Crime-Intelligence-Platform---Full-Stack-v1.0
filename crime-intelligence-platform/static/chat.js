async function sendMessage() {

    const input = document.getElementById("messageInput");

    const messages = document.getElementById("messages");

    const message = input.value.trim();

    if (message === "") return;

    messages.innerHTML += `

        <div class="user-message">

            <strong>You</strong>

            <p>${message}</p>

        </div>

    `;

    input.value = "";

    messages.scrollTop = messages.scrollHeight;

    try {

        const response = await fetch("/api/officer", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                message: message

            })

        });

        const data = await response.json();

        messages.innerHTML += `

            <div class="ai-message">

                <strong>Officer</strong>

                <p>${data.reply}</p>

            </div>

        `;

        messages.scrollTop = messages.scrollHeight;

    }

    catch(err){

        console.error(err);

        messages.innerHTML += `

            <div class="ai-message">

                <strong>Officer</strong>

                <p>

                Sorry, something went wrong.

                </p>

            </div>

        `;

    }

}

document
.getElementById("messageInput")
.addEventListener("keypress", function(e){

    if(e.key==="Enter"){

        sendMessage();

    }

});

window.addEventListener("load", () => {

    const question = localStorage.getItem("cioQuestion");

    if(!question)
        return;

    document.getElementById("messageInput").value = question;

    localStorage.removeItem("cioQuestion");

    sendMessage();

});