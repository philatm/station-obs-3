import { useState, useEffect, useRef, useMemo } from "react";
import Plot from "react-plotly.js";

const plotSettings = {
  layout: {
    width: 720,
    height: 480,
    title: "A Fancy Plot",
  },
  frames: [],
  config: { scrollZoom: true },
};

function MyPlot() {
  const wsRef = useRef();
  const [serverData, setServerData] = useState([]);

  const plotData = [
    {
      x: serverData.map((sd) => sd.date),
      y: serverData.map((sd) => sd.sensorData[0]),
      type: "scatter",
      mode: "markers",
      marker: { color: "red" },
    },
  ];

  useEffect(() => {
    //Send request to our websocket server using the "/request" path
    wsRef.current = new WebSocket("ws://localhost:8080/request");
    wsRef.current.onmessage = (ev) => {
      const message = JSON.parse(ev.data);
      //console.log(`Received message :: ${message.sensorData}`);
      // Upon receiving websocket message then add it to the list of data that we are displaying

      setServerData((prevServerData) => [...prevServerData, message]); // Return the updated data to be set in the state
    };
    wsRef.current.onclose = (ev) => {
      console.log("Client socket close!");
    };

    return () => {
      console.log("Cleaning up! ");
      wsRef.current.close();
    };
  }, []);

  return (
    <div className="plot_div">
      <Plot
        data={plotData}
        layout={plotSettings.layout}
        config={plotSettings.config}
      />
    </div>
  );
}

export default MyPlot;
