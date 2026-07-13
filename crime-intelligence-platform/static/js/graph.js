const params = new URLSearchParams(window.location.search);
const state = params.get("state") || "delhi";

fetch(`/api/graph/${encodeURIComponent(state)}`)
    .then(res => res.json())
    .then(data => {

        // ---------- Style Nodes ----------
        data.nodes.forEach(node => {

            switch (node.group) {

                case "State":
                    node.size = 50;
                    node.shape = "database";
                    node.color = {
                        background: "#2563eb",
                        border: "#60a5fa"
                    };
                    node.font = {
                        color: "#fff",
                        size: 28,
                        face: "Inter",
                        bold: true
                    };
                    break;

                case "Metric":

                    node.size = 26;
                    node.shape = "dot";

                    if (node.id === "Crime Rate") {
                        node.color = {
                            background: "#ef4444",
                            border: "#f87171"
                        };
                    }

                    else if (node.id === "Women Crime") {
                        node.color = {
                            background: "#f97316",
                            border: "#fb923c"
                        };
                    }

                    else if (node.id === "Chargesheet Rate") {
                        node.color = {
                            background: "#22c55e",
                            border: "#4ade80"
                        };
                    }

                    else if (node.id === "Total Crime") {
                        node.color = {
                            background: "#eab308",
                            border: "#fde047"
                        };
                    }

                    node.font = {
                        color: "#fff",
                        size: 18,
                        face: "Inter"
                    };

                    break;
            }

        });

        // ---------- Create DataSets ----------
        const nodes = new vis.DataSet(data.nodes);
        const edges = new vis.DataSet(data.links);

        const container = document.getElementById("graph");

        // ---------- Create Network ----------
        const graph = new vis.Network(
    container,
    {
        nodes,
        edges
    },
    {

        autoResize: true,

        physics: {

            enabled: true,

            barnesHut: {
                gravitationalConstant: -18000,
                springLength: 260,
                springConstant: 0.02,
                damping: 0.22,
                avoidOverlap: 1
            },

            stabilization: {
                iterations: 300
            }

        },

        interaction: {

            hover: true,
            tooltipDelay: 100,
            navigationButtons: true,
            zoomView: true,
            dragView: true

        },

        nodes: {

            borderWidth: 3,

            shadow: {
                enabled: true,
                size: 18,
                x: 0,
                y: 0
            },

            font: {
                color: "#ffffff",
                size: 18,
                face: "Inter"
            }

        },

        edges: {

            width: 3,

            arrows: {
                to: {
                    enabled: true,
                    scaleFactor: 0.8
                }
            },

            smooth: {
                enabled: true,
                type: "dynamic"
            },

            color: {
                color: "#38bdf8",
                highlight: "#7dd3fc",
                hover: "#ffffff"
            },

            font: {
                color: "#cbd5e1",
                size: 14,
                align: "middle"
            }

        }

    }
);

const info = document.getElementById("infoContent");



graph.on("click", function (params) {

    if (params.nodes.length === 0) return;

    const node = nodes.get(params.nodes[0]);

    let html = "";

    switch (node.id) {

        case state:

            html = `
                <h3>${node.label}</h3>

                <p><b>Entity</b><br>State Node</p>

                <p>This node represents the selected state in the Crime Intelligence Knowledge Graph.</p>

                <p>All crime metrics, AI predictions and recommendations originate from this node.</p>
            `;
            break;

        case "Crime Rate":

            html = `
                <h3>Crime Rate</h3>

                <p><b>Value</b><br>${node.label.split("\n")[1]}</p>

                <p>Registered IPC crimes per lakh population.</p>
            `;
            break;

        case "Women Crime":

            html = `
                <h3>Women Crime</h3>

                <p><b>Cases</b><br>${node.label.split("\n")[1]}</p>

                <p>Total crimes registered against women.</p>
            `;
            break;

        case "Chargesheet":

            html = `
                <h3>Chargesheet Rate</h3>

                <p><b>Value</b><br>${node.label.split("\n")[1]}</p>

                <p>Percentage of investigated cases resulting in chargesheets.</p>
            `;
            break;

        case "Total Crime":

            html = `
                <h3>Total Crime</h3>

                <p><b>Incidents</b><br>${node.label.split("\n")[1]}</p>

                <p>Total registered crimes during the selected year.</p>
            `;
            break;

        case "AI Prediction":

            html = `
                <h3>AI Prediction Engine</h3>

                <p>Machine Learning forecasts future crime trends using historical NCRB indicators.</p>
            `;
            break;

        case "GenAI Analysis":

            html = `
                <h3>Generative AI</h3>

                <p>LLM-generated intelligence report summarizing risk patterns and recommendations.</p>
            `;
            break;

        default:

            html = `<h3>${node.label}</h3>`;

    }

    info.innerHTML = html;

    info.style.opacity = 0;

setTimeout(() => {

    info.innerHTML = html;

    info.style.opacity = 1;

},150);

});


graph.on("hoverNode", function () {

    document.body.style.cursor = "pointer";

});

graph.on("blurNode", function () {

    document.body.style.cursor = "default";

});

graph.on("doubleClick", function (params) {

    if (params.nodes.length > 0) {

        graph.focus(params.nodes[0], {

            scale: 1.5,
            animation: true

        });

    }

});
       

graph.on("click", function(params){

    if(params.nodes.length===0) return;

    const node = nodes.get(params.nodes[0]);

    document.getElementById("infoContent").innerHTML = `

        <div class="metric">
            <b>Name</b><br>
            ${node.label}
        </div>

        <div class="metric">
            <b>Category</b><br>
            ${node.group}
        </div>

        <div class="metric">
            <b>Value</b><br>
            ${node.value ?? "N/A"}
        </div>

    `;
});

        // ---------- Hover Effects ----------
        graph.on("hoverNode", function () {
            document.body.style.cursor = "pointer";
        });

        graph.on("blurNode", function () {
            document.body.style.cursor = "default";
        });

    })
    .catch(err => console.error(err));