// ==================== Dynamic Dropdown Initialization ====================
document.addEventListener("DOMContentLoaded", async () => {
    const dropdown = document.getElementById("state");
    if (!dropdown) return;

    try {
        const response = await fetch("/states");
        const states = await response.json();
        
        dropdown.innerHTML = '<option value="">Select State</option>';
        
        states.forEach(state => {
            const option = document.createElement("option");
            option.value = state; 
            
            // Format to Title Case for visual display
            option.textContent = state.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
                
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading state list from database:", error);
    }
    if (typeof PRESELECTED_STATE !== "undefined" && PRESELECTED_STATE !== "") {
    console.log("PRESELECTED_STATE:", PRESELECTED_STATE);

    const values = [...dropdown.options].map(o => o.value);
    console.log("Dropdown contains:", values);

    console.log("Match exists?", values.includes(PRESELECTED_STATE));
    dropdown.value = PRESELECTED_STATE;

    setTimeout(() => {
        predict();
    }, 300);

}
});

// ==================== Pred
// ction & Interface Updates ====================
async function predict() {
    const stateSelect = document.getElementById("state");
    const state = stateSelect.value;

    if (!state) {
        alert("Please select a valid region from the gateway menu.");
        return;
    }

    try {
        console.log("Selected state:", state);
        
        // 1. Fetch live metrics from Neo4j database graph
        const stateResponse = await fetch(`/state/${state}`);

        const stateData = await stateResponse.json();
        console.log("State data:", stateData);

        if (stateData.error) {
            alert("Selected state could not be located in database records.");
            return;
        }

        // 2. Transmit metrics to Machine Learning pipeline for inference scoring
        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ stateData: stateData })
        });

        const data = await response.json();
        console.log("AI response:", data);
        // Fetch predictive intelligence from backend
        const predictionResponse = await fetch(`/api/predict/${state}`);
        const prediction = await predictionResponse.json();
        console.log("Prediction:", prediction);

        console.log(prediction);

        // 3. UI Presentation Updates
        const placeholderBox = document.getElementById("placeholderBox");
        const resultBox = document.getElementById("resultBox");

        // Hide default landing screen and activate the main analysis display panel
        if (placeholderBox) placeholderBox.style.display = "none";
        resultBox.classList.add("active");

        // Set Title text mapping
        document.getElementById("resState").textContent = stateSelect.options[stateSelect.selectedIndex].text;

        // Reset and apply risk tier styling classes dynamically
        const riskBadge = document.getElementById("resRisk");
        riskBadge.textContent = data.Risk_Level;
        riskBadge.className = "risk " + data.Risk_Level.toLowerCase();

        // Bind raw metrics straight into matching card slots
        document.getElementById("mRate").textContent = parseFloat(stateData.crimeRate).toFixed(2);
        document.getElementById("mChargesheet").textContent = parseFloat(stateData.chargesheetRate).toFixed(1) + "%";
        document.getElementById("mCrime").textContent = parseInt(stateData.totalCrime || stateData.crime2022 || 0).toLocaleString();
        const womenPercent = Number(stateData.womenCrimePercent);

        document.getElementById("mWomenPercent").textContent =
        isNaN(womenPercent) ? "N/A" : womenPercent.toFixed(1) + "%";

        // Render GenAI narrative response string
        document.getElementById("resRecommendation").textContent = data.Recommendation;
        document.getElementById("predictedCrime").textContent =
            Number(prediction.predictedTotalCrime).toLocaleString();

        document.getElementById("predictedGrowth").textContent =
            prediction.growthPercent + "%";

        document.getElementById("predictedTrend").textContent =
            prediction.trend;

        document.getElementById("predictedRisk").textContent =
            prediction.riskLevel;

    } catch (error) {
    console.error(error);
    alert(error.message);
}
}

// ================= Background Particle Animation Engine ===================
const canvas = document.getElementById("bg");
if (canvas) {
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2,
            dx: Math.random() - 0.5,
            dy: Math.random() - 0.5
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    animate();
}

