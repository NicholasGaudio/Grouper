import "./App.css";
import React, { useEffect, useState } from "react";
import AlgTable from "./algorithm-table";

//UPDATE THIS WITH API CALL
const dataPath: string = "/newdata.json";

interface RootData {
  total_people: number;
  availability: DataEntry[];
}

interface DataEntry {
  time: string;
  busy_count: number;
  names_of_people_who_are_busy: string[];
}

interface ParsedDataEntry {
  date: string;
  time: string;
  busyCount: number;
  names: string[];
}

const roundToHalfHour = (time: string): string => {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (minute < 30) {
    return `${hour.toString().padStart(2, "0")}:00`;
  } else {
    return `${hour.toString().padStart(2, "0")}:30`;
  }
};

//Returns the app
const App: React.FC = () => {
  const [processedData, setProcessedData] = useState<ParsedDataEntry[]>([]);
  const [totalPeople, setTotalPeople] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  //Fetch Data
  useEffect(() => {
    fetch(dataPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((fetchedData: RootData) => {
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
        setProcessedData(parsedData);
        setTotalPeople(fetchedData.total_people);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching JSON:", error));
  }, []); //[] means this only runs once, when the component mounts

  //While loading, just render loading
  if (loading) {
    return <p>Loading...</p>;
  }
  if (totalPeople === null) {
    throw new Error("total_people not read from Json correctly");
  }
  //render the table
  return (
    <div>
      <AlgTable data={processedData} groupSize={totalPeople} />
    </div>
  );
};

export default App;
