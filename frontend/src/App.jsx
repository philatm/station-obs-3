import { useState, useEffect, useRef } from "react";
import MyPlot from "./components/MyPlot/MyPlot.jsx";
import Plot from "react-plotly.js";

function App() {
  const ws = useRef();
  const [data, setData] = useState([]);
  const [visiblePos, setVisiblePos] = useState(0);

  const [xTimeSeries, setXTimeSeries] = useState([]);
  const [yValues, setYValues] = useState([]);
  const [settings, updateSettings] = useState({
    data: [
      {
        x: { xTimeSeries },
        y: { yValues },
        type: "scatter",
        mode: "markers",
        marker: { color: "red" },
      },
    ],
    layout: {
      width: 720,
      height: 480,
      title: "A Fancy Plot",
    },
    frames: [],
    config: { scrollZoom: true },
  });

  useEffect(() => {
    //Send request to our websocket server using the "/request" path
    ws.current = new WebSocket("ws://localhost:8080/request");
    ws.current.onmessage = (ev) => {
      const message = JSON.parse(ev.data);
      //console.log(`Received message :: ${message.sensorData}`);
      // Upon receiving websocket message then add it to the list of data that we are displaying

      setData((currentData) => {
        const newData = updateData(currentData, message);
        updatePlot(currentData);
        return newData; // Return the updated data to be set in the state
      });
    };
    ws.current.onclose = (ev) => {
      console.log("Client socket close!");
    };

    function updatePlot(data) {
      setXTimeSeries(data.map((mes) => mes.id));
      const newYValues = data.map((mes) => mes.sensorData[visiblePos]);
      setYValues(newYValues);
  
    }

    //We update the number of reads
    function updateData(currentData, message) {
      //console.log(message);
      return [
        ...currentData,
        {
          id: message.date,
          sensorData: message.sensorData,
        },
      ];
    }

    return () => {
      console.log("Cleaning up! ");
      ws.current.close();
    };
  }, [visiblePos]);

  useEffect(() => {
    updateSettings((settings) => ({
      ...settings,
      data: [{ ...settings.data[0], x: xTimeSeries, y: yValues }],
    }));
  }, [xTimeSeries, yValues]);


  return (
    <div className="main">
      <Plot
        data={settings.data}
        layout={settings.layout}
        config={settings.config}
      />
      <label htmlFor="range-select">Choose an index: </label>

      <select 
        value={visiblePos}
        name="ranges" id="range-select"
        onChange={ev => {
          setVisiblePos(ev.target.value);
          
        }}
      >
        {data[0] && data[0].sensorData.map((el, ind) =>
          <option key={ind} value={ind}>{ind}</option>
        )}
      </select>
    </div>
  );
}

export default App;
