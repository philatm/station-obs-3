import { useState, useEffect, useRef, useMemo } from "react";
import Plot from "react-plotly.js";
import "./styles.css";
import GraphOptions from "../GraphOptions/GraphOptions";

const plotSettings = {
  layout: {
    width: 1400,
    height: 480,
    title: "A Plot",
    xaxis: { domain: [0.05, 0.95] },
    yaxis: {
      title: "Давление, атм",
      titlefont: { color: "#1f77b4" },
      tickfont: { color: "#1f77b4" },
    },
    yaxis2: {
      title: "Расход, куб/мин",
      titlefont: { color: "#ff7f0e" },
      tickfont: { color: "#ff7f0e" },
      anchor: "free",
      overlaying: "y",
      side: "left",
      position: 0,
    },
    yaxis3: {
      title: "Концентрация, кг/м3",
      titlefont: { color: "#d62728" },
      tickfont: { color: "#d62728" },
      anchor: "x",
      overlaying: "y",
      side: "right",
    },
    yaxis4: {
      title: "Температура, °C",
      titlefont: { color: "#9467bd" },
      tickfont: { color: "#9467bd" },
      anchor: "free",
      overlaying: "y",
      side: "right",
      position: 1,
    },
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

  const graphDataCount = serverData[0] ? serverData[0].sensorData.length : 0;

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
    name: graph.name,
    yaxis: graph.yaxis,
    marker: { color: graph.color },
  }));

  const addGraphOption = () => {
    const newGraph = {
      id: idRef.current++,
      index: 0,
      color: "black",
      yaxis: "y",
      // name: "Hello",
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
            graphDataCount={graphDataCount}
          />
        ))}
      </div>
    </div>
  );
}

export default MyPlot;
