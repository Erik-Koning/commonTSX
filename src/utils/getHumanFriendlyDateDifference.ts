export function getHumanFriendlyDateDifference(
  startDate?: Date | null,
  endDate?: Date | null,
  includePastFutureWords: boolean = false,
  roundToNearest?: "second" | "minute" | "hour" | "day" | "week" | "month" | "year",
  maxUnitSize?: "millisecond" | "second" | "minute" | "hour" | "day" | "week" | "month" | "year" //The max unit size to round to, exclusive of the unit size
): string {
  if (!startDate && !endDate) return "Unknown";
  if (!startDate) startDate = new Date();
  if (!endDate) endDate = new Date();
  const millisecondsInSecond = 1000;
  const millisecondsInMinute = 60000;
  const millisecondsInHour = 3600000;
  const millisecondsInDay = 86400000;
  const millisecondsInWeek = 604800000;
  const millisecondsInMonth = 2628000000;
  const millisecondsIn2Months = 5256000000;
  const millisecondsInYear = 31536000000;

  const isStartBeforeEnd = new Date(endDate).getTime() - new Date(startDate).getTime() > 0;
  const timeDifference = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());

  const getFinalResult = (result: string) => {
    if (includePastFutureWords) {
      if (isStartBeforeEnd) {
        return "in " + result;
      } else {
        return result + " ago";
      }
    }
    return result;
  };

  // Helper function to check if a unit is smaller or equal to maxUnitSize
  const unitBiggerThanMax = (unit: "second" | "minute" | "hour" | "day" | "week" | "month" | "year"): boolean => {
    if (!maxUnitSize) return true;

    const unitOrder = ["millisecond", "second", "minute", "hour", "day", "week", "month", "year"];
    //Get the index of each unit
    const unitIndex = unitOrder.indexOf(unit);
    const maxUnitIndex = unitOrder.indexOf(maxUnitSize);

    if (unitIndex === -1 || maxUnitIndex === -1) return false;

    return unitIndex > maxUnitIndex;
  };

  //Check if the time difference is smaller than the next unit size or one size below the maxUnitSize
  if (
    (timeDifference < millisecondsInSecond && !(roundToNearest === "second") && (!maxUnitSize || !unitBiggerThanMax("second"))) ||
    (maxUnitSize && unitBiggerThanMax("second")) //true if second is bigger than maxUnitSize
  ) {
    const milliseconds = timeDifference;
    return getFinalResult(`${milliseconds} millisecond${milliseconds !== 1 ? "s" : ""}`);
  }
  if (
    (timeDifference < millisecondsInMinute && !(roundToNearest === "minute") && (!maxUnitSize || !unitBiggerThanMax("second"))) ||
    (maxUnitSize && unitBiggerThanMax("minute"))
  ) {
    const seconds = Math.floor(timeDifference / millisecondsInSecond);
    return getFinalResult(`${seconds} second${seconds !== 1 ? "s" : ""}`);
  } else if (
    (timeDifference < millisecondsInHour && !(roundToNearest === "hour") && (!maxUnitSize || !unitBiggerThanMax("minute"))) ||
    (maxUnitSize && unitBiggerThanMax("hour"))
  ) {
    const minutes = Math.floor(timeDifference / millisecondsInMinute);
    return getFinalResult(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  } else if (
    (timeDifference < millisecondsInDay && !(roundToNearest === "day") && (!maxUnitSize || !unitBiggerThanMax("hour"))) ||
    (maxUnitSize && unitBiggerThanMax("day"))
  ) {
    const hours = Math.floor(timeDifference / millisecondsInHour);
    return getFinalResult(`${hours} hour${hours !== 1 ? "s" : ""}`);
  } else if (
    (timeDifference < millisecondsInWeek && !(roundToNearest === "week") && (!maxUnitSize || !unitBiggerThanMax("day"))) ||
    (maxUnitSize && unitBiggerThanMax("week"))
  ) {
    const days = Math.floor(timeDifference / millisecondsInDay);
    return getFinalResult(`${days} day${days !== 1 ? "s" : ""}`);
  } else if (
    (timeDifference < millisecondsIn2Months && !(roundToNearest === "month") && (!maxUnitSize || !unitBiggerThanMax("week"))) ||
    (maxUnitSize && unitBiggerThanMax("month"))
  ) {
    const weeks = Math.floor(timeDifference / millisecondsInWeek);
    return getFinalResult(`${weeks} week${weeks !== 1 ? "s" : ""}`);
  } else if (
    (timeDifference < millisecondsInYear && !(roundToNearest === "year") && (!maxUnitSize || !unitBiggerThanMax("month"))) ||
    (maxUnitSize && unitBiggerThanMax("year"))
  ) {
    const months = Math.floor(timeDifference / millisecondsInMonth);
    return getFinalResult(`${months} month${months !== 1 ? "s" : ""}`);
  } else {
    const years = Math.floor(timeDifference / millisecondsInYear);
    return getFinalResult(`${years} year${years !== 1 ? "s" : ""}`);
  }
}
