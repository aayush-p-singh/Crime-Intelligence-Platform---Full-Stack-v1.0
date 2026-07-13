// ==========================================
// Crime Intelligence Platform
// State Comparison Module
// Part 1
// ==========================================

let radarChart = null;

// ------------------------------
// DOM References
// ------------------------------

const state1Select = document.getElementById("state1");
const state2Select = document.getElementById("state2");

const aiVerdict = document.getElementById("aiVerdict");
const comparisonResult = document.getElementById("comparisonResult");

// ------------------------------
// Metric Card Component
// ------------------------------

function metricCard(title, value, winner, insight = "") {

    return `

    <div class="metric-card">

        <span>${title}</span>

        <h2>${value}</h2>

        ${
            insight
            ? `<p class="metric-insight">${insight}</p>`
            : ""
        }

        ${
            winner
            ? `<div class="winner">🏆 Better</div>`
            : `<div class="loser">—</div>`
        }

    </div>

    `;

}

// ------------------------------
// Load States
// ------------------------------

async function loadStates() {

    const res = await fetch("/states");
    const states = await res.json();

    state1Select.innerHTML = "";
    state2Select.innerHTML = "";

    states.forEach(state => {

        state1Select.innerHTML += `
            <option value="${state}">
                ${state}
            </option>
        `;

        state2Select.innerHTML += `
            <option value="${state}">
                ${state}
            </option>
        `;

    });

}

window.onload = loadStates;

// ------------------------------
// Helpers
// ------------------------------

function percentDifference(a, b) {

    return Math.abs(
        ((a - b) / Math.max(a, b)) * 100
    ).toFixed(1);

}

function normalize(v1, v2, lowerBetter = true) {

    const max = Math.max(v1, v2);
    const min = Math.min(v1, v2);

    if (max === min) {

        return [100, 100];

    }

    if (lowerBetter) {

        return [

            ((max - v1) / (max - min)) * 100,

            ((max - v2) / (max - min)) * 100

        ];

    }

    return [

        ((v1 - min) / (max - min)) * 100,

        ((v2 - min) / (max - min)) * 100

    ];

}

// ------------------------------
// Compare States
// ------------------------------

async function compareStates() {

    const state1 = state1Select.value;
    const state2 = state2Select.value;

    if (state1 === state2) {

        alert("Select two different states.");
        return;

    }

    const response = await fetch(

        `/compare/${encodeURIComponent(state1)}/${encodeURIComponent(state2)}`

    );

    const data = await response.json();

    const s1 = data[0];
    const s2 = data[1];

    // --------------------------
    // Winner Calculation
    // --------------------------

    const winner = {

        crimeRate:
            s1.crimeRate < s2.crimeRate,

        womenCrime:
            s1.womenCrime < s2.womenCrime,

        chargesheet:
            s1.chargesheetRate > s2.chargesheetRate,

        totalCrime:
            s1.totalCrime < s2.totalCrime

    };

    const score1 =

        Number(winner.crimeRate) +
        Number(winner.womenCrime) +
        Number(winner.chargesheet) +
        Number(winner.totalCrime);

    const score2 = 4 - score1;

    const overallWinner =
        score1 >= score2 ? s1 : s2;

    const overallLoser =
        score1 >= score2 ? s2 : s1;

    const lowestCrime =
        winner.crimeRate ? s1.name : s2.name;

    const lowestWomenCrime =
        winner.womenCrime ? s1.name : s2.name;

    const highestChargesheet =
        winner.chargesheet ? s1.name : s2.name;

    const crimeDiff =
        percentDifference(s1.crimeRate, s2.crimeRate);

    const womenDiff =
        percentDifference(s1.womenCrime, s2.womenCrime);

    const chargeDiff =
        percentDifference(
            s1.chargesheetRate,
            s2.chargesheetRate
        );

    const totalCrimeDiff =
        percentDifference(
            s1.totalCrime,
            s2.totalCrime
        );
    // ==========================================
    // AI Verdict
    // ==========================================

    const scoreA = Math.round((score1 / 4) * 100);
    const scoreB = Math.round((score2 / 4) * 100);

    aiVerdict.innerHTML = `

    <div class="ai-verdict">

        <h2>🧠 AI Comparative Assessment</h2>

        <h1>${overallWinner.name} performs better overall.</h1>

        <div class="executive-summary">

            <h3>Executive Summary</h3>

            <p>

                <b>${overallWinner.name}</b> outperforms
                <b>${overallLoser.name}</b>
                across public safety indicators.

            </p>

            <ul>

                <li>
                    Crime Rate Difference:
                    <b>${crimeDiff}%</b>
                </li>

                <li>
                    Women Crime Difference:
                    <b>${womenDiff}%</b>
                </li>

                <li>
                    Chargesheet Difference:
                    <b>${chargeDiff}%</b>
                </li>

                <li>
                    Overall Crime Difference:
                    <b>${totalCrimeDiff}%</b>
                </li>

            </ul>

        </div>

        <div class="strength-box">

            <h2>Strength Analysis</h2>

            <div class="strength-grid">

                <div>

                    <h3>✅ Strengths</h3>

                    <ul>

                        ${winner.crimeRate ? "<li>Lower Crime Rate</li>" : ""}

                        ${winner.womenCrime ? "<li>Better Women Safety</li>" : ""}

                        ${winner.chargesheet ? "<li>Higher Chargesheet Rate</li>" : ""}

                        ${winner.totalCrime ? "<li>Lower Overall Crime</li>" : ""}

                    </ul>

                </div>

                <div>

                    <h3>⚠ Needs Improvement</h3>

                    <ul>

                        ${!winner.crimeRate ? "<li>Crime Control</li>" : ""}

                        ${!winner.womenCrime ? "<li>Women Safety</li>" : ""}

                        ${!winner.chargesheet ? "<li>Investigation Efficiency</li>" : ""}

                        ${!winner.totalCrime ? "<li>Total Crime</li>" : ""}

                    </ul>

                </div>

            </div>

        </div>

        <div class="score-section">

            <div class="score-row">

                <span>${s1.name}</span>

                <strong>${scoreA}%</strong>

            </div>

            <div class="score-bar">

                <div
                    class="score-fill"
                    style="width:${scoreA}%">
                </div>

            </div>

            <div class="score-row">

                <span>${s2.name}</span>

                <strong>${scoreB}%</strong>

            </div>

            <div class="score-bar">

                <div
                    class="score-fill second"
                    style="width:${scoreB}%">
                </div>

            </div>

        </div>

    </div>

    `;
        // ==========================================
    // Summary Cards + Comparison Cards
    // ==========================================

    comparisonResult.innerHTML = `

    <div class="summary-grid">

        <div class="summary-card">

            <h3>🏆 Lowest Crime Rate</h3>

            <h2>${lowestCrime}</h2>

        </div>

        <div class="summary-card">

            <h3>👩 Lowest Women Crime</h3>

            <h2>${lowestWomenCrime}</h2>

        </div>

        <div class="summary-card">

            <h3>👮 Highest Chargesheet</h3>

            <h2>${highestChargesheet}</h2>

        </div>

        <div class="summary-card">

            <h3>⭐ Overall Winner</h3>

            <h2>${overallWinner.name}</h2>

        </div>

    </div>

    <br>

    <div class="compare-grid">

        <!-- ================= LEFT ================= -->

        <div class="state-card">

            <h2>${s1.name}</h2>

            <p class="risk-tag ${s1.risk.toLowerCase()}">

                ${s1.risk.toUpperCase()} RISK

            </p>

            ${metricCard(

                "Crime Rate",

                s1.crimeRate,

                winner.crimeRate,

                winner.crimeRate

                    ? `↓ ${crimeDiff}% lower than ${s2.name}`

                    : `↑ ${crimeDiff}% higher than ${s2.name}`

            )}

            ${metricCard(

                "Women Crime",

                Number(s1.womenCrime).toLocaleString(),

                winner.womenCrime,

                winner.womenCrime

                    ? `↓ ${womenDiff}% lower than ${s2.name}`

                    : `↑ ${womenDiff}% higher than ${s2.name}`

            )}

            ${metricCard(

                "Chargesheet Rate",

                s1.chargesheetRate + "%",

                winner.chargesheet,

                winner.chargesheet

                    ? `↑ ${chargeDiff}% higher than ${s2.name}`

                    : `↓ ${chargeDiff}% lower than ${s2.name}`

            )}

            ${metricCard(

                "Total Crime",

                Number(s1.totalCrime).toLocaleString(),

                winner.totalCrime,

                winner.totalCrime

                    ? `↓ ${totalCrimeDiff}% lower than ${s2.name}`

                    : `↑ ${totalCrimeDiff}% higher than ${s2.name}`

            )}

        </div>

        <div class="vs">

            <h1>VS</h1>

        </div>

                <!-- ================= RIGHT ================= -->

        <div class="state-card">

            <h2>${s2.name}</h2>

            <p class="risk-tag ${s2.risk.toLowerCase()}">

                ${s2.risk.toUpperCase()} RISK

            </p>

            ${metricCard(

                "Crime Rate",

                s2.crimeRate,

                !winner.crimeRate,

                !winner.crimeRate

                    ? `↓ ${crimeDiff}% lower than ${s1.name}`

                    : `↑ ${crimeDiff}% higher than ${s1.name}`

            )}

            ${metricCard(

                "Women Crime",

                Number(s2.womenCrime).toLocaleString(),

                !winner.womenCrime,

                !winner.womenCrime

                    ? `↓ ${womenDiff}% lower than ${s1.name}`

                    : `↑ ${womenDiff}% higher than ${s1.name}`

            )}

            ${metricCard(

                "Chargesheet Rate",

                s2.chargesheetRate + "%",

                !winner.chargesheet,

                !winner.chargesheet

                    ? `↑ ${chargeDiff}% higher than ${s1.name}`

                    : `↓ ${chargeDiff}% lower than ${s1.name}`

            )}

            ${metricCard(

                "Total Crime",

                Number(s2.totalCrime).toLocaleString(),

                !winner.totalCrime,

                !winner.totalCrime

                    ? `↓ ${totalCrimeDiff}% lower than ${s1.name}`

                    : `↑ ${totalCrimeDiff}% higher than ${s1.name}`

            )}

        </div>

    </div>

    `;
    // ==========================================
    // Radar Chart
    // ==========================================

    const radarCanvas = document.getElementById("comparisonRadar");

    if (radarChart) {
        radarChart.destroy();
    }

    const [crime1, crime2] =
        normalize(s1.crimeRate, s2.crimeRate, true);

    const [women1, women2] =
        normalize(s1.womenCrime, s2.womenCrime, true);

    const [charge1, charge2] =
        normalize(s1.chargesheetRate, s2.chargesheetRate, false);

    const [total1, total2] =
        normalize(s1.totalCrime, s2.totalCrime, true);

    radarChart = new Chart(radarCanvas, {

        type: "radar",

        data: {

            labels: [

                "Crime Control",
                "Women Safety",
                "Investigation",
                "Overall Crime"

            ],

            datasets: [

                {

                    label: s1.name,

                    data: [

                        crime1,
                        women1,
                        charge1,
                        total1

                    ],

                    backgroundColor: "rgba(59,130,246,.25)",

                    borderColor: "#3b82f6",

                    pointBackgroundColor: "#3b82f6",

                    pointRadius: 5,

                    borderWidth: 3

                },

                {

                    label: s2.name,

                    data: [

                        crime2,
                        women2,
                        charge2,
                        total2

                    ],

                    backgroundColor: "rgba(239,68,68,.25)",

                    borderColor: "#ef4444",

                    pointBackgroundColor: "#ef4444",

                    pointRadius: 5,

                    borderWidth: 3

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            animation: {

                duration: 1200

            },

            plugins: {

                legend: {

                    labels: {

                        color: "white",

                        font: {

                            size: 14

                        }

                    }

                }

            },

            scales: {

                r: {

                    min: 0,

                    max: 100,

                    ticks: {

                        stepSize: 20,

                        color: "#94a3b8",

                        backdropColor: "transparent"

                    },

                    grid: {

                        color: "#334155"

                    },

                    angleLines: {

                        color: "#334155"

                    },

                    pointLabels: {

                        color: "#ffffff",

                        font: {

                            size: 14,

                            weight: "bold"

                        }

                    }

                }

            }

        }

    });

}