import Tree from "react-d3-tree";
import { usePeople } from "@/hooks/use-people";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useState } from "react";

// Helper to transform flat data to tree structure
// In a real app this would be more complex or handled by backend
const transformData = (people: any[]) => {
  if (!people || people.length === 0) return null;
  // Mock tree structure for visualization demonstration
  // Real implementation requires graph traversal logic
  return {
    name: "Falohun Family",
    attributes: {
      generation: "Root"
    },
    children: people.slice(0, 5).map(p => ({
      name: p.fullName,
      attributes: {
        city: p.currentCity,
      }
    }))
  };
};

export default function TreeView() {
  const { data: people, isLoading } = usePeople();
  const [zoom, setZoom] = useState(1);

  if (isLoading) return <div className="h-[80vh] flex items-center justify-center">Loading Tree...</div>;

  const data = transformData(people || []);

  if (!data) return <div className="p-8 text-center">No data to display</div>;

  return (
    <div className="h-[calc(100vh-100px)] relative border rounded-xl overflow-hidden shadow-2xl bg-white">
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white/90 p-2 rounded-lg shadow-sm border backdrop-blur">
        <Button size="icon" variant="ghost" onClick={() => setZoom(z => z + 0.2)}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setZoom(z => Math.max(0.2, z - 0.2))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setZoom(1)}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <Tree 
        data={data} 
        orientation="vertical"
        pathFunc="step"
        zoom={zoom}
        separation={{ siblings: 2, nonSiblings: 2 }}
        nodeSize={{ x: 200, y: 100 }}
        renderCustomNodeElement={(rd3tProps) => (
          <g>
            <rect width="180" height="80" x="-90" y="-40" rx="10" ry="10" fill="white" stroke="hsl(35, 90%, 45%)" strokeWidth="2" />
            <text x="0" y="-10" textAnchor="middle" style={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'var(--font-display)' }}>
              {rd3tProps.nodeDatum.name}
            </text>
            <text x="0" y="10" textAnchor="middle" style={{ fontSize: '12px', fill: '#666' }}>
              {rd3tProps.nodeDatum.attributes?.city}
            </text>
          </g>
        )}
      />
    </div>
  );
}
