const API = "https://crime-intelligence.onrender.com";

export async function getDashboardKPIs() {
    const res = await fetch(`${API}/api/dashboard/kpis`);
    if (!res.ok) throw new Error("Failed to fetch KPIs");
    return res.json();
}



export async function getCrimeRateChart() {
    const res = await fetch(`${API}/api/dashboard/crime-rate`);
    return res.json();
}

export async function getWomenCrimeChart() {
    const res = await fetch(`${API}/api/dashboard/women-crime`);
    return res.json();
}

export async function getChargesheetChart() {
    const res = await fetch(`${API}/api/dashboard/chargesheet`);
    return res.json();
}

export async function getTotalCrimeChart() {
    const res = await fetch(`${API}/api/dashboard/total-crime`);
    return res.json();
}

