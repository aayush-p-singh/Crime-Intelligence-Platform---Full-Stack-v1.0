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

replacements = [
    (
'''const NODE_SIZES: Record<string, number> = {
  State: 8,
  Metric: 5,
  AI: 6,
  Unknown: 4,
};''',
'''const NODE_SIZES: Record<string, number> = {
  State: 20,
  Metric: 12,
  AI: 14,
  Unknown: 10,
};'''
    ),
    (
'''      fgRef.current.d3Force("charge").strength(-250);
      fgRef.current.d3Force("link").distance(60);
      setTimeout(() => {
        fgRef.current?.zoomToFit(800, 50); // animate fit
      }, 600);''',
'''      // Tighter physics to make sparse graphs feel dense and intentional
      fgRef.current.d3Force("charge").strength(-100);
      fgRef.current.d3Force("link").distance(100);
      // Wait for physics to settle then tightly fit the graph
      setTimeout(() => {
        fgRef.current?.zoomToFit(1000, 100); 
      }, 1000);'''
    ),
    (
'''    const showLabel = isSelected || isHovered || (!activeNode && globalScale >= 1.5) || (isNeighbor && globalScale >= 1.2);
    if (showLabel && !isDimmed) {
      const fontSize = Math.max(12 / globalScale, 3);
      ctx.font = `500 ${fontSize}px "Inter", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = isSelected ? "#fff" : "rgba(255,255,255,0.85)";
      ctx.fillText(node.label, node.x, node.y + radius + (3 / globalScale));
    }''',
'''    // Display labels prominently to fill empty space and provide immediate context
    const isStateNode = node.group === "State";
    const showLabel = isStateNode || isSelected || isHovered || (!activeNode) || isNeighbor;
    if (showLabel && !isDimmed) {
      const fontSize = isStateNode ? Math.max(14 / globalScale, 6) : Math.max(11 / globalScale, 4);
      ctx.font = `600 ${fontSize}px "Inter", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = isSelected ? "#fff" : isStateNode ? "#fff" : "rgba(255,255,255,0.7)";
      ctx.fillText(node.label, node.x, node.y + radius + (6 / globalScale));
      
      // If the node has a 'value' property, display it under the label
      if (node.value !== undefined && node.value !== null) {
        ctx.font = `500 ${fontSize * 0.8}px "JetBrains Mono", monospace`;
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText(String(node.value), node.x, node.y + radius + (6 / globalScale) + fontSize + (2 / globalScale));
      }
    }'''
    )
]

filepath = r"C:\IILM UNIVERSITY DATA\crime-intel-full-stack\crime-intelligence-ui\src\routes\knowledge-graph.tsx"

if os.path.exists(filepath):
    replace_in_file(filepath, replacements)
    print(f"Updated {filepath}")
else:
    print(f"File not found: {filepath}")
