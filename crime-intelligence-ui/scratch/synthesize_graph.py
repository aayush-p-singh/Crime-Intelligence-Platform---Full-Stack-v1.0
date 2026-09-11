import re
import os

def replace_in_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
        else:
            print(f"Warning: Could not find '{old}' in {filepath}")
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

old_query = '''  const {
    data: graphData,
    isLoading: isGraphLoading,
    error: graphError,
  } = useQuery({
    queryKey: ["knowledge-graph", selectedState],
    queryFn: () => api.getKnowledgeGraph(selectedState),
    enabled: !!selectedState,
  });'''

new_query = '''  const {
    data: graphData,
    isLoading: isGraphLoading,
    error: graphError,
  } = useQuery({
    queryKey: ["knowledge-graph-synthesized", selectedState],
    queryFn: async () => {
      const [stateData, predictionData] = await Promise.all([
        api.getStateDetails(selectedState),
        api.getPrediction(selectedState).catch(() => null) // graceful fallback
      ]);

      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];

      const stateId = selectedState.toLowerCase();
      
      // 1. Anchor Node (State)
      nodes.push({
        id: stateId,
        label: selectedState,
        group: "State",
        type: "jurisdiction",
        ...stateData
      });

      // 2. Metrics (Total, Rate, Women, Chargesheet)
      if (stateData.totalCrime) {
        nodes.push({
          id: `${stateId}-total`,
          label: "Total Incidents",
          group: "Metric",
          type: "metric",
          value: stateData.totalCrime.toLocaleString(),
          raw_value: stateData.totalCrime
        });
        links.push({ source: stateId, target: `${stateId}-total`, type: "has_metric" });
      }

      if (stateData.crimeRate) {
        nodes.push({
          id: `${stateId}-rate`,
          label: "Crime Rate",
          group: "Metric",
          type: "metric",
          value: stateData.crimeRate.toString(),
          raw_value: stateData.crimeRate
        });
        links.push({ source: stateId, target: `${stateId}-rate`, type: "has_metric" });
      }

      if (stateData.womenCrime) {
        nodes.push({
          id: `${stateId}-women`,
          label: "Crimes Against Women",
          group: "Metric",
          type: "metric",
          value: stateData.womenCrime.toLocaleString(),
          raw_value: stateData.womenCrime
        });
        links.push({ source: stateId, target: `${stateId}-women`, type: "has_metric" });
      }

      if (stateData.chargesheetRate) {
        nodes.push({
          id: `${stateId}-chargesheet`,
          label: "Chargesheet Rate",
          group: "Metric",
          type: "metric",
          value: `${stateData.chargesheetRate}%`,
          raw_value: stateData.chargesheetRate
        });
        links.push({ source: stateId, target: `${stateId}-chargesheet`, type: "has_metric" });
      }
      
      // 3. AI / Intelligence Nodes
      if (predictionData) {
        if (predictionData.riskLevel || stateData.risk) {
          nodes.push({
            id: `${stateId}-risk`,
            label: "AI Threat Level",
            group: "AI",
            type: "prediction",
            value: predictionData.riskLevel || stateData.risk,
            risk_score: predictionData.riskScore
          });
          links.push({ source: stateId, target: `${stateId}-risk`, type: "assessed_as" });
        }
        
        if (predictionData.trend) {
          nodes.push({
            id: `${stateId}-trend`,
            label: "Forecast Trend",
            group: "AI",
            type: "prediction",
            value: predictionData.trend,
            growth_percent: `${predictionData.growthPercent}%`,
            predicted_incidents: predictionData.predictedTotalCrime
          });
          links.push({ source: stateId, target: `${stateId}-trend`, type: "forecasts" });
        }
      }

      return { nodes, links };
    },
    enabled: !!selectedState,
  });'''

replacements = [
    (old_query, new_query)
]

filepath = r"C:\IILM UNIVERSITY DATA\crime-intel-full-stack\crime-intelligence-ui\src\routes\knowledge-graph.tsx"

if os.path.exists(filepath):
    replace_in_file(filepath, replacements)
    print(f"Updated {filepath}")
else:
    print(f"File not found: {filepath}")
