import { schools } from "./schools";

export function detectSchoolFromSearch(search: string) {
  const text = search.toLowerCase();

  for (const school of schools) {
    for (const alias of school.aliases) {
      if (text.includes(alias)) {
        return school;
      }
    }
  }

  return null;
}