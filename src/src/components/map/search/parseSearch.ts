export type ParsedSearch = {
    school?: string;
    category?: string;
    maxPrice?: number;
  };
  
  export function parseSearch(input: string): ParsedSearch {
    const text = input.toLowerCase();
  
    const result: ParsedSearch = {};
  
    // Detect school
    if (text.includes("esut")) result.school = "esut";
    if (text.includes("unn")) result.school = "unn";
    if (text.includes("imt")) result.school = "imt";
    if (text.includes("unec")) result.school = "unec";
  
    // Detect category
    if (text.includes("hostel")) result.category = "hostel";
    if (text.includes("apartment")) result.category = "apartment";
    if (text.includes("self contain")) result.category = "self contain";
    if (text.includes("hotels")) result.category = "hotels";
  
    // Detect price like 300k / 450k
    const priceMatch = text.match(/(\d+)\s?k/);
    if (priceMatch) {
      result.maxPrice = Number(priceMatch[1]) * 1000;
    }
  
    return result;
  }