import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

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

// Update the component to accept props
interface AlgTableProps {
  groupId: string;
}

const AlgTable: React.FC<AlgTableProps> = ({ groupId }) => {
  const [data, setData] = useState<ParsedDataEntry[]>([]);
  const [groupSize, setGroupSize] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(24);

  const handleStartTimeChange = (value: number[]) => {
    const newStartTime = value[0];
    if (newStartTime >= endTime - 1) {
      setEndTime(Math.min(newStartTime + 2, 24));
    }
    setStartTime(newStartTime);
  };

  const handleEndTimeChange = (value: number[]) => {
    const newEndTime = value[0];
    if (newEndTime <= startTime + 1) {
      setStartTime(Math.max(newEndTime - 2, 0));
    }
    setEndTime(newEndTime);
  };

  //First generate the rows for the table
  const timeSlots = generateTimeSlots(startTime, endTime);

  //Fetch and process the calendar data from the API
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/group/mergedcalendar/${groupId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const fetchedData: RootData = await response.json();
        
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
      } catch (error) {
        console.error("Error fetching calendar data:", error);
        setLoading(false);
      }
    };

    if (groupId) {
      fetchCalendarData();
    }
  }, [groupId]);

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

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="relative w-full border rounded-md">
          <ScrollArea className="h-[500px]">
            <div className="w-full pr-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-background font-bold border-r">Time</TableHead>
                    {dates.map((date, index) => (
                      <TableHead 
                        key={date} 
                        className={`sticky top-0 bg-background font-bold ${index !== dates.length - 1 ? 'border-r' : ''}`}
                      >
                        {date}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeSlots.map((time) => (
                    <TableRow key={time}>
                      <TableCell className="font-medium border-r">{time}</TableCell>
                      {dates.map((date, index) => {
                        const cellData = groupedData[date]?.[time];
                        const busyPercentage =
                          cellData && groupSize > 0
                            ? Math.round((cellData.busyCount / groupSize) * 100)
                            : 0;
                        const cellColor = calculateColor(busyPercentage);
                        const busyPeople = cellData?.names || [];
                        
                        return (
                          <Tooltip key={date}>
                            <TooltipTrigger asChild>
                              <TableCell
                                style={{ backgroundColor: cellColor }}
                                className={`text-center text-black cursor-default ${index !== dates.length - 1 ? 'border-r' : ''}`}
                              >
                                {busyPercentage}%
                              </TableCell>
                            </TooltipTrigger>
                            <TooltipContent className="bg-zinc-900 text-white border-zinc-800">
                              {busyPeople.length > 0 ? (
                                <div>
                                  <p className="font-semibold">Busy:</p>
                                  <ul className="list-disc pl-4">
                                    {busyPeople.map((name, index) => (
                                      <li key={index}>{name}</li>
                                    ))}
                                  </ul>
                                </div>
                              ) : (
                                <p>Everyone is available</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Start Time: {startTime}:00
            </label>
            <Slider
              value={[startTime]}
              min={0}
              max={23}
              step={1}
              onValueChange={handleStartTimeChange}
              className="w-[60%]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              End Time: {endTime}:00
            </label>
            <Slider
              value={[endTime]}
              min={1}
              max={24}
              step={1}
              onValueChange={handleEndTimeChange}
              className="w-[60%]"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AlgTable;