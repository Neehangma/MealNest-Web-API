export const OPENING_TIME = "10:00";
export const CLOSING_TIME = "22:00";
export const SLOT_INTERVAL = 30;

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function generateReservationTimeSlots(
  openingTime = OPENING_TIME,
  closingTime = CLOSING_TIME,
  interval = SLOT_INTERVAL,
) {
  const openingMinutes = toMinutes(openingTime);
  const closingMinutes = toMinutes(closingTime);
  const slots: string[] = [];

  for (let minutes = openingMinutes; minutes <= closingMinutes; minutes += interval) {
    slots.push(formatTime(minutes));
  }

  return slots;
}

export const RESERVATION_TIME_SLOTS = generateReservationTimeSlots();
