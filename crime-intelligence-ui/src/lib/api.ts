// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crime-intelligence.onrender.com';

// --- Type Definitions ---

export interface DashboardKPIs {
  totalCrime: number;
  averageCrimeRate: number;
  averageChargesheetRate: number;
  totalWomenCrime: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface PredictionResult {
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendation: string;
  confidence: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  [key: string]: any;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface StateData {
  name: string; // Changed from 'state' to 'name'
  crimeRate: number;
  womenCrime: number;
  chargesheetRate: number;
  totalCrime: number;
  risk?: string;
}

export interface ForecastRequest {
  Crime_Rate_2022: number;
  Women_Crimes_2022: number;
  Chargesheet_Rate_2022: number;
}

export interface ForecastResponse {
  status: string;
  forecasted_threat_level: string;
}

// The backend returns an array of StateData for the comparison endpoint


export interface ComparisonData {
  state1: StateData;
  state2: StateData;
  differences: Record<string, number>;
}

export interface OfficerMessageRequest {
  message: string;
}

export interface OfficerReply {
  reply: string;
}

// --- Core Fetch Utility ---

/**
 * Reusable fetch wrapper with standard error handling.
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `API Error: ${response.status} ${response.statusText}`
      );
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[API Error] -> ${endpoint}:`, error);
    throw error;
  }
}

// --- API Service Methods ---

export const api = {
  // Dashboard APIs
  getDashboardKPIs: () => apiFetch<DashboardKPIs>('/api/dashboard/kpis'),
  getCrimeRateChart: () => apiFetch<ChartDataPoint[]>('/api/dashboard/crime-rate'),
  getWomenCrimeChart: () => apiFetch<ChartDataPoint[]>('/api/dashboard/women-crime'),
  getChargesheetChart: () => apiFetch<ChartDataPoint[]>('/api/dashboard/chargesheet'),
  getTotalCrimeChart: () => apiFetch<ChartDataPoint[]>('/api/dashboard/total-crime'),
  getRiskDistribution: () => apiFetch<ChartDataPoint[]>('/api/dashboard/risk-distribution'),
  getTrend: () => apiFetch<ChartDataPoint[]>('/api/dashboard/trend'),

  // State & Map APIs
  getStates: () => apiFetch<string[]>('/states'),
  getMapData: () => apiFetch<StateData[]>('/map-data'),
  getStateDetails: (state: string) => apiFetch<StateData>(`/api/state/${encodeURIComponent(state)}`),
  compareStates: (state1: string, state2: string) => 
    apiFetch<ComparisonData>(`/compare/${encodeURIComponent(state1)}/${encodeURIComponent(state2)}`),

  // Prediction & Knowledge Graph
  getPrediction: (state: string) => apiFetch<PredictionResult>(`/api/predict/${encodeURIComponent(state)}`),
  getKnowledgeGraph: (state: string) => apiFetch<KnowledgeGraphData>(`/api/graph/${encodeURIComponent(state)}`),

  // AI Officer API
  chatWithOfficer: (data: OfficerMessageRequest) => 
    apiFetch<OfficerReply>('/api/officer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

// AI Forecasting
  getThreatForecast: (data: ForecastRequest) => 
    apiFetch<ForecastResponse>('/api/forecast', {
      method: 'POST',
      body: JSON.stringify(data),
    }),    
};