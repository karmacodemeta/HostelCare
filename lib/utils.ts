import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateDiff(oldData: any, newData: any, fields: string[]) {
  const changes: any = {};
  fields.forEach(field => {
    if (oldData[field] !== newData[field]) {
      // Handle Dates specifically for cleaner logs
      const oldValue = oldData[field] instanceof Date ? oldData[field].toISOString().split('T')[0] : oldData[field];
      const newValue = newData[field] instanceof Date ? new Date(newData[field]).toISOString().split('T')[0] : newData[field];

      // Check again after formatting
      if (oldValue !== newValue) {
        changes[field] = { from: oldValue, to: newValue };
      }
    }
  });
  return changes;
}
