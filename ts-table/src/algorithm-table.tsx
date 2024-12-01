//useEffect: data fetching
//useState: Allows variables within a component that change the rendering
import React, { useEffect, useState } from "react";

//Define the type for the data from the json
interface ParsedDataEntry {
  date: string;
  time: string;
  busyCount: number;
  names: string[];
}

//Props for the component, data is an array of DataEntry objects
interface AlgTableProps {
  data: ParsedDataEntry[];
  groupSize: number;
}

const generateTimeSlots = (startTime: number, endTime: number): string[] => {
  const slots: string[] = [];
  for (let hour = startTime; hour <= endTime; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour !== endTime) {
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }
  return slots;
};

const calculateColor = (value: number): string => {
  value /= 100;
  let red = 0;
  let green = 0;

  if (value <= 0.5) {
    red = Math.round(255 * (value / 0.5));
    green = 255;
  } else {
    red = 255;
    green = Math.round(255 * ((1 - value) / 0.5));
  }

  return `rgb(${red}, ${green}, 0)`;
};

//functional component
const AlgTable: React.FC<AlgTableProps> = ({ data, groupSize }) => {
  const [startTime, setStartTime] = useState(9);
  const [endTime, setEndTime] = useState(17);
  const timeSlots = generateTimeSlots(startTime, endTime);

  const groupedData: { [date: string]: { [time: string]: ParsedDataEntry } } =
    {};
  data.forEach((entry) => {
    if (!groupedData[entry.date]) {
      groupedData[entry.date] = {};
    }
    groupedData[entry.date][entry.time] = entry;
  });

  //Extract unique dates for table columns
  const dates = Object.keys(groupedData).sort();

  const handleStartTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStartTime(parseInt(event.target.value, 10));
  };

  const handleEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(parseInt(event.target.value, 10));
  };

  useEffect(() => {
    console.log(
      `Table rendered with group size: ${groupSize}, number of data entries: ${data.length}`
    );
  }, [groupSize, data]);

  return (
    <>
      <h2>Schedule Table</h2>
      <div style={{ height: "500px", overflowY: "auto" }}>
        <table style={{ width: `100%`, borderCollapse: `collapse` }}>
          <thead>
            <tr>
              <th
                style={{
                  border: `1px solid #ccc`,
                  padding: `10px`,
                  textAlign: `left`,
                }}
              >
                Time
              </th>
              {dates.map((date) => (
                <th
                  key={date}
                  style={{
                    border: `1px solid #ccc`,
                    padding: `10px`,
                    textAlign: `left`,
                  }}
                >
                  {date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => (
              <tr key={time}>
                <td style={{ border: `1px solid #ccc`, padding: `10px` }}>
                  {time}
                </td>
                {dates.map((date) => {
                  const cellData = groupedData[date]?.[time];
                  const busyPercentage =
                    cellData && groupSize > 0
                      ? Math.round((cellData.busyCount / groupSize) * 100)
                      : 0;
                  const cellColor = calculateColor(busyPercentage);
                  return (
                    <td
                      key={date}
                      style={{
                        border: `1px solid #ccc`,
                        padding: `10px`,
                        backgroundColor: cellColor,
                        color: "black",
                      }}
                    >
                      0.{busyPercentage}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      Enter time range:
      <span style={{ width: "20px", display: "inline-block" }}></span>
      <input
        type="number"
        value={startTime}
        onChange={handleStartTimeChange}
        placeholder="Start Time"
      />
      <input
        type="number"
        value={endTime}
        onChange={handleEndTimeChange}
        placeholder="End Time"
      />
    </>
  );
};

export default AlgTable;

//Read the data from the json CHECK
//parse the data form the json
//Display the table
