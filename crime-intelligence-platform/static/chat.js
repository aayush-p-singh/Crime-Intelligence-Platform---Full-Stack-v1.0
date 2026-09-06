async function sendMessage() {

    const input = document.getElementById("messageInput");

    const messages = document.getElementById("messages") || document.getElementById("chat-feed");

    const message = input.value.trim();

    if (message === "") return;

    messages.innerHTML += `

        <div class="user-message">

            <strong>You</strong>

            <p>${escapeHtml(message)}</p>

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

        const retrieval = data.retrieval;
        const sources = retrieval && retrieval.required ? `
            <div class="retrieval-meta">
                <strong>Live sources</strong>
                <span>${escapeHtml(retrieval.confidence)} confidence</span>
                <span>Retrieved ${escapeHtml(new Date(retrieval.retrievedAt).toLocaleString())}</span>
                ${retrieval.notice ? `<p>${escapeHtml(retrieval.notice)}</p>` : ""}
                ${(retrieval.sources || []).map(source => `
                    <a href="${escapeAttribute(source.url)}" target="_blank" rel="noreferrer">
                        ${escapeHtml(source.title)}${source.publicationDate ? ` (${escapeHtml(new Date(source.publicationDate).toLocaleDateString())})` : ""}
                    </a>
                `).join("")}
            </div>
        ` : "";

        messages.innerHTML += `

            <div class="ai-message">

                <strong>Officer</strong>

                <p>${escapeHtml(data.reply)}</p>
                ${sources}

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

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    }[character]));
}

function escapeAttribute(value) {
    return escapeHtml(value);
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