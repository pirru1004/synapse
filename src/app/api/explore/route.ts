import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Hash the base query to derive cluster center
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
        hash = query.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Cluster Center
    const range = 100;
    const clusterX = (Math.abs((hash * 13) % range) - range / 2);
    const clusterY = (Math.abs((hash * 17) % range) - range / 2) * 0.5; 
    const clusterZ = (Math.abs((hash * 23) % range) - range / 2) - 30;  

    // Generate 5 planets (simulating Top 5 Songs)
    const newPlanets = [];
    const songNames = ["Phantom", "Stardust", "Nebula", "Nova", "Eclipse"];

    for (let i = 0; i < 5; i++) {
      const hue = Math.abs((hash + (i * 45)) % 360);
      const size = 1.0 + (Math.abs((hash + i) % 10) / 10) * 2.5; 
      
      // Scatter them slightly around the cluster center
      const offsetX = Math.cos(i * (Math.PI * 2) / 5) * (size * 8);
      const offsetZ = Math.sin(i * (Math.PI * 2) / 5) * (size * 8);
      const offsetY = (Math.abs((hash + i * 7) % 5) - 2.5);

      newPlanets.push({
        id: `planet-${Date.now()}-${i}`,
        name: `${query.toUpperCase()} - ${songNames[i]}`,
        description: `Track ${i + 1} of ${query}`,
        position: [clusterX + offsetX, clusterY + offsetY, clusterZ + offsetZ],
        color: `hsl(${hue}, 80%, 60%)`,
        size,
      });
    }

    // Return the array of planets
    return NextResponse.json({ planets: newPlanets });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
