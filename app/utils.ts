import { startOfDay } from "date-fns";
import { UTCDate } from "@date-fns/utc";

/**
 * Returns the current date as a unix timestamp
 * (i.e. seconds since Jan 1 1970).
 * Uses the current *UTC* date, and the timestamp
 * comes from the start of the day.
 */
export function getTodaysTimestamp() {
  return startOfDay(new UTCDate()).getTime() / 1000;
}
