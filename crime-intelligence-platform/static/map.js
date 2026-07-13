document.addEventListener("DOMContentLoaded", async () => {

    const tooltip = document.getElementById("tooltip");

    const stateMap = {
        "INAN":"Andaman and Nicobar",
        "INAP":"Andhra Pradesh",
        "INAR":"Arunachal Pradesh",
        "INAS":"Assam",
        "INBR":"Bihar",
        "INCH":"Chandigarh",
        "INCT":"Chhattisgarh",
        "INDH":"Dadra and Nagar Haveli and Daman and Diu",
        "INDL":"Delhi",
        "INGA":"Goa",
        "INGJ":"Gujarat",
        "INHP":"Himachal Pradesh",
        "INHR":"Haryana",
        "INJH":"Jharkhand",
        "INJK":"Jammu & Kashmir",
        "INKA":"Karnataka",
        "INKL":"Kerala",
        "INLA":"Ladakh",
        "INLD":"Lakshadweep",
        "INMH":"Maharashtra",
        "INML":"Meghalaya",
        "INMN":"Manipur",
        "INMP":"Madhya Pradesh",
        "INMZ":"Mizoram",
        "INNL":"Nagaland",
        "INOR":"Odisha",
        "INPB":"Punjab",
        "INPY":"Puducherry",
        "INRJ":"Rajasthan",
        "INSK":"Sikkim",
        "INTG":"Telangana",
        "INTN":"Tamil Nadu",
        "INTR":"Tripura",
        "INUP":"Uttar Pradesh",
        "INUT":"Uttarakhand",
        "INWB":"West Bengal"
    };

    const response = await fetch("/map-data");
    const data = await response.json();

    data.forEach(state => {

        console.log(state.name, state.risk);

        const svgId = Object.keys(stateMap).find(
            key => stateMap[key].toLowerCase() === state.name.toLowerCase()
        );

        console.log("Matched:", state.name, "->", svgId);

        if (!svgId) return;

        const element = document.getElementById(svgId);

        if (!element) return;

        switch (state.risk.toLowerCase()) {

    case "critical":
        element.style.fill = "#7f1d1d";   // Dark Red
        break;

    case "high":
        element.style.fill = "#ef4444";   // Red
        break;

    case "moderate":
    case "medium":
        element.style.fill = "#f59e0b";   // Orange
        break;

    case "low":
        element.style.fill = "#22c55e";   // Green
        break;

    default:
        element.style.fill = "#64748b";   // Unknown/Grey
}

        element.style.transition = "0.3s";

        element.addEventListener("mouseenter", () => {

            tooltip.innerHTML = `
                <h3>${state.name}</h3>
                <p><b>Risk:</b> ${state.risk}</p>
            `;

            element.style.opacity = "0.8";
        });

        element.addEventListener("mouseleave", () => {
            element.style.opacity = "1";
        });

        element.addEventListener("click", () => {
            window.location.href =
                "/?state=" + encodeURIComponent(state.name);
        });

    });

});