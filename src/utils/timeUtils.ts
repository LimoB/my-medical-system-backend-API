export function generateSlots(
  hours: string[],
  slotDuration: number // in minutes
): string[] {
  const slots: string[] = [];

  for (const hour of hours) {
    const [baseHour, baseMin] = hour.split(":").map(Number);
    const baseDate = new Date();
    baseDate.setHours(baseHour, baseMin, 0, 0);

    const slotsPerHour = 60 / slotDuration;
    for (let i = 0; i < slotsPerHour; i++) {
      const slot = new Date(baseDate.getTime() + i * slotDuration * 60000);
      const formatted = slot.toTimeString().slice(0, 5); // "HH:MM"
      slots.push(formatted);
    }
  }

  return slots;
}
