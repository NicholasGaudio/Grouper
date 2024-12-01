import React, { useEffect, useState } from "react";

//HI GRACIOUS GROUP MEMBER, TO INTEGRATE THIS FILE WITH THE PROJECT, FOLLOW THESE THREE INSTRUCTIONS

//1: ADD THIS LINE TO THE BEGINNING OF THE GROUP PAGE
//import AlgTable from "./algorithm-table";

//2: ADD THIS LINE TO THE END OF THE RETURN OF THE GROUP PAGE
//<div> <AlgTable /> </div>

//3: ADD A LINE HERE TO DOWNLOAD THE .JSON DATA FROM THE BACKEND
//--REPLACE WITH .JSON FETCH CALL--

//4: SET datapath EQUAL TO THE LOCATION OF THE DOWNLOADED DATA FOR THE GROUP RELATIVE TO THE SOURCE DIRECTORY FOR THE APP
const dataPath: string = "/newdata.json";

//Interface representing the raw root structure of the .json
interface RootData {
  total_people: number;
  availability: DataEntry[];
}

//Interface to represent the entries of the .json
interface DataEntry {
  time: string;
  busy_count: number;
  names_of_people_who_are_busy: string[];
}

//Interface for the entries of the .json after parsing
interface ParsedDataEntry {
  date: string;
  time: string;
  busyCount: number;
  names: string[];
}

//Rounds times to the nearest half hour to account for strange minute intervals
const roundToHalfHour = (time: string): string => {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  return minute < 30
    ? `${hour.toString().padStart(2, "0")}:00`
    : `${hour.toString().padStart(2, "0")}:30`;
};

//Generates the time labels for each row of the table
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

//Turns the proportion of free to busy people into a color from green to yellow to red
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

//Functional component to render the table
const AlgTable: React.FC = () => {
  //Necessary state variables
  const [data, setData] = useState<ParsedDataEntry[]>([]);
  const [groupSize, setGroupSize] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [startTime, setStartTime] = useState(9);
  const [endTime, setEndTime] = useState(17);
  
  //First generate the rows for the table
  const timeSlots = generateTimeSlots(startTime, endTime);

  //Fetch and process the JSON, once, when the component mounts
  useEffect(() => {
    fetch(dataPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((fetchedData: RootData) => {
        //Data is parsed here, after fetching
        const parsedData = fetchedData.availability.map((entry) => {
          const [date, time] = entry.time.split(" ");
          const roundedTime = roundToHalfHour(time);
          const [, month, day] = date.split("-");
          const dateWithoutYear = `${month}-${day}`;

          return {
            date: dateWithoutYear,
            time: roundedTime,
            busyCount: entry.busy_count,
            names: entry.names_of_people_who_are_busy,
          };
        });

        //Update the states with the parsed data
        setData(parsedData);
        setGroupSize(fetchedData.total_people);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching JSON:", error));
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (groupSize === null) {
    throw new Error("total_people not read from JSON correctly");
  }
  //Group the data by date and time
  const groupedData: { [date: string]: { [time: string]: ParsedDataEntry } } =
    {};
  data.forEach((entry) => {
    if (!groupedData[entry.date]) {
      groupedData[entry.date] = {};
    }
    groupedData[entry.date][entry.time] = entry;
  });

  //Extract and sort the dates for the table columns
  const dates = Object.keys(groupedData).sort();

  //Render the table and input fields for start/end time
  //I can't put any more comments below here or they will end up in the html
  return (
    <>
      <h2>Schedule Table</h2>
      <div style={{ height: "500px", overflowY: "auto" }}>
        <table style={{ width: `100%`, borderCollapse: `collapse` }}>
          <thead>
            <tr>
              <th style={{ border: `1px solid #ccc`, padding: `10px` }}>
                Time
              </th>
              {dates.map((date) => (
                <th
                  key={date}
                  style={{ border: `1px solid #ccc`, padding: `10px` }}
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
                      {busyPercentage}%
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <label>
        Start Time:
        <input
          type="number"
          value={startTime}
          onChange={(e) => setStartTime(parseInt(e.target.value, 10))}
        />
      </label>
      <label>
        End Time:
        <input
          type="number"
          value={endTime}
          onChange={(e) => setEndTime(parseInt(e.target.value, 10))}
        />
      </label>
    </>
  );
};

export default AlgTable;
