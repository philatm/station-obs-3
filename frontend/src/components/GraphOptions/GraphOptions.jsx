import { useState, useEffect, useRef, useMemo } from "react";

const GraphOptions = ({ graph, editGraph, optionsCount }) => {
  const { id, index, color } = graph;
  const arr = Array.from(Array(optionsCount).keys());
  return (
    <>
      <label htmlFor={`graph-index-${id}-select`}>Choose a range:</label>
      <select
        id={`graph-index-${id}-select`}
        onChange={(ev) => editGraph({ ...graph, index: ev.target.value })}
      >
        <option value="">--Please choose an option--</option>
        {arr.map((_, ind) => (
          <option key={ind} value={ind}>
            {ind}
          </option>
        ))}
      </select>
    </>
  );
};

export default GraphOptions;
