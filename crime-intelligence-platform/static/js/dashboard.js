let currentMetric = "";

/* ---------------- KPI CARDS ---------------- */

async function loadKPIs() {

    const res = await fetch("/api/dashboard/kpis");
    const data = await res.json();

    document.getElementById("crimeRateCard").innerText =
        data.averageCrimeRate.toLocaleString();

    document.getElementById("totalCrimeCard").innerText =
        data.totalCrime.toLocaleString();

    document.getElementById("womenCrimeCard").innerText =
        data.totalWomenCrime.toLocaleString();

    document.getElementById("chargesheetCard").innerText =
        data.averageChargesheetRate + "%";
}

/* ---------------- STATE PANEL ---------------- */

async function loadState(state, metric) {

    const res = await fetch(`/api/state/${encodeURIComponent(state)}`);
    const data = await res.json();

    currentMetric = metric;

    const active = {
        "Crime Rate": "",
        "Women Crime": "",
        "Chargesheet Rate": "",
        "Total Crime": ""
    };

    active[metric] = "active-stat";

    let buttonText = "Open in CIO →";

    switch (metric) {

        case "Crime Rate":
            buttonText = "Explain Crime Rate →";
            break;

        case "Women Crime":
            buttonText = "Explain Women Crime →";
            break;

        case "Chargesheet Rate":
            buttonText = "Explain Chargesheet Rate →";
            break;

        case "Total Crime":
            buttonText = "Explain Total Crime →";
            break;

    }

    document.getElementById("statePanel").innerHTML = `

        <h2>📍 ${data.name.toUpperCase()}</h2>

        <p class="summary-title">
            Crime Intelligence Summary
        </p>

        <div class="state-stat ${active["Crime Rate"]}">
            <span>Crime Rate</span>
            <strong>${data.crimeRate}</strong>
        </div>

        <div class="state-stat ${active["Total Crime"]}">
            <span>Total Crime</span>
            <strong>${Number(data.totalCrime).toLocaleString()}</strong>
        </div>

        <div class="state-stat ${active["Women Crime"]}">
            <span>Women Crime</span>
            <strong>${Number(data.womenCrime).toLocaleString()}</strong>
        </div>

        <div class="state-stat ${active["Chargesheet Rate"]}">
            <span>Chargesheet Rate</span>
            <strong>${data.chargesheetRate}%</strong>
        </div>

        <button
            class="cio-btn"
            onclick="openCIO('${data.name}', '${metric}')">

            ${buttonText}

        </button>

        <small class="ncrb-note">
            Official NCRB Statistics (2022)
        </small>

    `;
}

/* ---------------- CHARTS ---------------- */

async function createChart(id, url, label) {

    const res = await fetch(url);
    const chartData = await res.json();
    chartData.forEach(item => {

    if(item.name === "dadra & nagar haveli and daman & diu"){

        item.name = "DNH & DD";

    }

    else if(item.name === "andaman & nicobar islands"){

        item.name = "A & N Islands";

    }

    else if(item.name === "madhya pradesh"){

        item.name = "M.P.";

    }

    else if(item.name === "uttar pradesh"){

        item.name = "U.P.";

    }

});
    
    

    const chart = new Chart(document.getElementById(id), {

        type: "bar",

        data: {

            labels: chartData.map(x => x.name),

            datasets: [{
                label: label,
                data: chartData.map(x => x.value)
            }]
        },

        options: {

            responsive: true,

            animation:{

    duration:1200,

    easing:"easeOutQuart"

},

            plugins:{

    legend:{
        display:false
    },

    tooltip:{

        backgroundColor:"#111827",

        titleColor:"#ffffff",

        bodyColor:"#e5e7eb",

        borderColor:"#3b82f6",

        borderWidth:1,

        cornerRadius:10,

        padding:12,

        displayColors:false

    }

},
            scales:{

    x:{

        grid:{
            display:false
        },

        ticks:{
            color:"#94a3b8"
        }

    },

    y:{

        grid:{
            color:"rgba(255,255,255,.05)"
        },

        ticks:{
            color:"#94a3b8"
        }

    }

},

            onClick(event, elements) {

                if (!elements.length) return;

                const index = elements[0].index;

                const state = chart.data.labels[index];

                loadState(state, label);

            }

        }    

    });
    
    

}

/* ---------------- CIO ---------------- */

function openCIO(state, metric) {

    let prompt = `Tell me about ${state}.`;

    switch (metric) {

        case "Crime Rate":
            prompt = `Explain the crime rate of ${state}.`;
            break;

        case "Women Crime":
            prompt = `Explain the women crime statistics of ${state}.`;
            break;

        case "Chargesheet Rate":
            prompt = `Explain the chargesheet rate of ${state}.`;
            break;

        case "Total Crime":
            prompt = `Explain the total reported crime of ${state}.`;
            break;

    }

    localStorage.setItem("cioQuestion", prompt);

    window.location.href = "/chat";
}

/* ---------------- STARTUP ---------------- */

loadKPIs();

createChart(
    "crimeChart",
    "/api/dashboard/crime-rate",
    "Crime Rate"
);

createChart(
    "womenChart",
    "/api/dashboard/women-crime",
    "Women Crime"
);

createChart(
    "chargesheetChart",
    "/api/dashboard/chargesheet",
    "Chargesheet Rate"
);

createChart(
    "totalCrimeChart",
    "/api/dashboard/total-crime",
    "Total Crime"
);

lucide.createIcons();

    // 2. Real-time UTC System Clock
    const sysTimeElement = document.getElementById('sys-time');
    function updateSystemTime() {
        const now = new Date();
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        if (sysTimeElement) {
            sysTimeElement.textContent = `${hours}:${minutes}:${seconds} UTC`;
        }
    }
    updateSystemTime();
    setInterval(updateSystemTime, 1000);

    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
