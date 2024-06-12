import { useState, useEffect, useRef, useMemo } from "react";
import Plot from "react-plotly.js";
import "./styles.css";
import GraphOptions from "../GraphOptions/GraphOptions";

const plotSettings = {
  layout: {
    width: 720,
    height: 480,
    title: "A Plot",
  },
  frames: [],
  config: { scrollZoom: true },
};

function MyPlot() {
  const wsRef = useRef();
  const idRef = useRef(0);
  const [serverData, setServerData] = useState([]);
  const [graphs, setGraphs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const optionsCount = serverData[0] ? serverData[0].sensorData.length : 0;

  // const plotData = [
  //   {
  //     x: serverData.map((sd) => sd.date),
  //     y: serverData.map((sd) => sd.sensorData[range]),
  //     type: "scatter",
  //     mode: "markers",
  //     marker: { color: "red" },
  //   },
  // ];

  const plotData = graphs.map((graph) => ({
    x: serverData.map((sd) => sd.date),
    y: serverData.map((sd) => sd.sensorData[graph.index]),
    type: "scatter",
    mode: "markers",
    marker: { color: graph.color },
  }));

  const addGraphOption = () => {
    const newGraph = {
      id: idRef.current++,
      index: 0,
      color: "red",
      //unit: "",
    };
    setGraphs([...graphs, newGraph]);
  };

  const editGraph = (graph) => {
    const newGraphs = graphs.map((gr) => {
      if (gr.id === graph.id) {
        return graph;
      } else {
        return gr;
      }
    });
    setGraphs(newGraphs);
  };
  useEffect(() => {
    //Send request to our websocket server using the "/request" path
    {
      /*wsRef.current = new WebSocket("ws://localhost:8080/request");
    wsRef.current.onmessage = (ev) => {
      const message = JSON.parse(ev.data);
      console.log(Array.isArray(message));
      //console.log(`Received message :: ${message}`);
      // Upon receiving websocket message then add it to the list of data that we are displaying
      if (!Array.isArray(message)) {
        setServerData((prevServerData) => [...prevServerData, message]); // Return the updated data to be set in the state
      } else {
        setServerData(message);
      }
    };
    wsRef.current.onclose = (ev) => {
      console.log("Client socket close!");
    };*/
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        console.log("Cleaning up WebSocket connection");
      }
    };
  }, []);

  const startDataGeneration = () => {
    if (isConnected) return; // Prevent multiple connections

    wsRef.current = new WebSocket("ws://localhost:8080/request");

    wsRef.current.onopen = () => {
      setIsConnected(true);
      wsRef.current.send(JSON.stringify({ action: "start" }));
    };

    wsRef.current.onmessage = (ev) => {
      const message = JSON.parse(ev.data);
      if (!Array.isArray(message)) {
        setServerData((prevServerData) => [...prevServerData, message]);
      } else {
        setServerData(message);
      }
    };

    wsRef.current.onclose = () => {
      console.log("Client socket close!");
      setIsConnected(false);
    };
  };

  const stopDataGeneration = () => {
    if (!isConnected || !wsRef.current) return;

    wsRef.current.send(JSON.stringify({ action: "stop" }));
    wsRef.current.close();
  };

  return (
    <div className="plot_div">
      <Plot
        data={plotData}
        layout={plotSettings.layout}
        config={plotSettings.config}
      />

      <div className="button-container">
        <button className="btn btn-start" onClick={startDataGeneration}>
          Start Data Generation
        </button>
        &nbsp; &nbsp; &nbsp;
        <button className="btn btn-stop" onClick={stopDataGeneration}>
          Stop Data Generation
        </button>
      </div>
      <button onClick={addGraphOption}>+</button>
      <div className="graphs-container">
        {graphs.map((graph) => (
          <GraphOptions
            key={graph.id}
            graph={graph}
            editGraph={editGraph}
            optionsCount={optionsCount}
          />
        ))}
      </div>
    </div>
  );
}

export default MyPlot;
