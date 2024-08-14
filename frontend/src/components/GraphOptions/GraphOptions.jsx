import { useState, useEffect, useRef, useMemo } from "react";
import "./styles.css";

const GraphOptions = ({ graph, editGraph, graphDataCount }) => {
  const { id, index, color, name } = graph;
  const arr = Array.from(Array(graphDataCount).keys());
  return (
    <div id={`graph-${id}-options`} className="graph-options">
      <div>
        <label htmlFor={`graph-index-${id}-select`}>Choose a range:</label>
        <select
          id={`graph-index-${id}-select`}
          onChange={(ev) => editGraph({ ...graph, index: ev.target.value })}
        >
          <option value="">--Choose an option--</option>
          {arr.map((_, ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`graph-index-${id}-name`}>Enter a name:</label>
        <input
          type="text"
          id={`graph-index-${id}-name`}
          onChange={(ev) => editGraph({ ...graph, name: ev.target.value })}
        />
      </div>
      <div>
        <label htmlFor={`graph-index-${id}-color`}>Choose a color:</label>
        <input
          type="color"
          id={`graph-index-${id}-color`}
          onChange={(ev) => editGraph({ ...graph, color: ev.target.value })}
        />
      </div>{" "}
      <div>
        <label htmlFor={`graph-index-${id}-unit`}>Choose a unit:</label>
        <select
          type="select"
          id={`graph-index-${id}-unit`}
          onChange={(ev) => editGraph({ ...graph, yaxis: ev.target.value })}
        >
          <option value="y">Давление</option>
          <option value="y2">Расход</option>
          <option value="y3">Концентрация</option>
          <option value="y4">Температура</option>
        </select>
      </div>
    </div>
  );
};

export default GraphOptions;
