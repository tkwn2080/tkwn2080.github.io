import React, { useState, useMemo } from 'react';

const SubstrateDesigner = () => {
  const gridSize = 15; // Fixed odd number for zero-centering
  const [connections, setConnections] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [nodeType, setNodeType] = useState(null); // 'input', 'output', or null
  const [inputNodes, setInputNodes] = useState([]);
  const [outputNodes, setOutputNodes] = useState([]);

  const hiddenNodes = useMemo(() => {
    const allNodes = new Set([...inputNodes, ...outputNodes].map(node => JSON.stringify(node)));
    const hiddenSet = new Set();
    
    connections.forEach(([x1, y1, x2, y2]) => {
      const start = JSON.stringify([x1, y1]);
      const end = JSON.stringify([x2, y2]);
      if (!allNodes.has(start)) hiddenSet.add(start);
      if (!allNodes.has(end)) hiddenSet.add(end);
    });

    return Array.from(hiddenSet).map(node => JSON.parse(node));
  }, [connections, inputNodes, outputNodes]);

  const handleGridClick = (x, y) => {
    if (nodeType) {
      handleNodePlacement(x, y);
    } else if (!selectedPoint) {
      setSelectedPoint([x, y]);
    } else {
      const [x1, y1] = selectedPoint;
      const [x2, y2] = [x, y];
      
      // Prevent self-connections
      if (x1 === x2 && y1 === y2) {
        setSelectedPoint(null);
        return;
      }

      const newConnection = [x1, y1, x2, y2];
      
      const connectionIndex = connections.findIndex(
        conn => (conn[0] === x1 && conn[1] === y1 && conn[2] === x2 && conn[3] === y2) ||
                (conn[0] === x2 && conn[1] === y2 && conn[2] === x1 && conn[3] === y1)
      );

      if (connectionIndex !== -1) {
        setConnections(connections.filter((_, index) => index !== connectionIndex));
      } else {
        setConnections([...connections, newConnection]);
      }
      setSelectedPoint(null);
    }
  };

  const handleNodePlacement = (x, y) => {
    const newNode = [x, y];
    if (nodeType === 'input') {
      const index = inputNodes.findIndex(node => node[0] === x && node[1] === y);
      if (index !== -1) {
        setInputNodes(inputNodes.filter((_, i) => i !== index));
      } else {
        setInputNodes([...inputNodes, newNode]);
      }
    } else if (nodeType === 'output') {
      const index = outputNodes.findIndex(node => node[0] === x && node[1] === y);
      if (index !== -1) {
        setOutputNodes(outputNodes.filter((_, i) => i !== index));
      } else {
        setOutputNodes([...outputNodes, newNode]);
      }
    }
    setNodeType(null);
  };

  const isPointSelected = (x, y) => {
    return selectedPoint && selectedPoint[0] === x && selectedPoint[1] === y;
  };

  const isInputNode = (x, y) => inputNodes.some(node => node[0] === x && node[1] === y);
  const isOutputNode = (x, y) => outputNodes.some(node => node[0] === x && node[1] === y);
  const isHiddenNode = (x, y) => hiddenNodes.some(node => node[0] === x && node[1] === y);

  const gridItems = [];
  for (let y = Math.floor(gridSize / 2); y >= -Math.floor(gridSize / 2); y--) {
    for (let x = -Math.floor(gridSize / 2); x <= Math.floor(gridSize / 2); x++) {
      gridItems.push(
        <div
          key={`${x}-${y}`}
          className={`w-8 h-8 border flex items-center justify-center cursor-pointer
            ${(x + y) % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
            ${isPointSelected(x, y) ? 'border-4 border-blue-500' : 'border-gray-200'}
            relative`}
          onClick={() => handleGridClick(x, y)}
        >
          {isInputNode(x, y) && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
          )}
          {isOutputNode(x, y) && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            </div>
          )}
          {isHiddenNode(x, y) && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
          )}
          {x === -Math.floor(gridSize / 2) && <div className="absolute left-0 text-xs text-gray-500">{y}</div>}
          {y === -Math.floor(gridSize / 2) && <div className="absolute bottom-0 text-xs text-gray-500">{x}</div>}
        </div>
      );
    }
  }

  const renderNodeList = (nodes, title) => (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2 text-center">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {nodes.map(([x, y], index) => (
          <div key={index} className="bg-gray-100 p-1 rounded text-center text-sm">
            ({x}, {y})
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-xl font-bold mb-4">HyperNEAT Substrate Designer</h1>
      <div className="mb-4">
        <button
          onClick={() => setNodeType('input')}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Place/Remove Input Node
        </button>
        <button
          onClick={() => setNodeType('output')}
          className="bg-red-500 text-white px-4 py-2 rounded mr-2"
        >
          Place/Remove Output Node
        </button>
      </div>
      <div 
        className="grid mb-4 relative" 
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 2rem)`,
          gridTemplateRows: `repeat(${gridSize}, 2rem)`
        }}
      >
        {gridItems}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {connections.map(([x1, y1, x2, y2], index) => (
            <g key={index}>
              <line
                x1={(x1 + Math.floor(gridSize / 2) + 0.5) * 32}
                y1={(Math.floor(gridSize / 2) - y1 + 0.5) * 32}
                x2={(x2 + Math.floor(gridSize / 2) + 0.5) * 32}
                y2={(Math.floor(gridSize / 2) - y2 + 0.5) * 32}
                stroke="black"
                strokeWidth="2"
              />
              <circle
                cx={(x1 + Math.floor(gridSize / 2) + 0.5) * 32}
                cy={(Math.floor(gridSize / 2) - y1 + 0.5) * 32}
                r="4"
                fill="black"
              />
              <circle
                cx={(x2 + Math.floor(gridSize / 2) + 0.5) * 32}
                cy={(Math.floor(gridSize / 2) - y2 + 0.5) * 32}
                r="4"
                fill="black"
              />
            </g>
          ))}
        </svg>
      </div>
      <div className="w-full max-w-4xl">
        {renderNodeList(inputNodes, "Input Nodes")}
        {renderNodeList(hiddenNodes, "Hidden Nodes")}
        {renderNodeList(outputNodes, "Output Nodes")}
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2 text-center">Connections</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {connections.map(([x1, y1, x2, y2], index) => (
              <div key={index} className="bg-gray-100 p-1 rounded text-center text-sm">
                ({x1},{y1}) to ({x2},{y2})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubstrateDesigner;