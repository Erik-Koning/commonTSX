// world-countries-mod.d.ts
// had to be added to the project because the world-countries package does not have a types declaration file.

declare module "world-countries" {
  export interface Country {
    cca2: string; // 2-letter country code
    name: {
      common: string; // Common name of the country
      official: string; // Official name of the country
    };
    flag: string; // Unicode or emoji flag
    latlng: [number, number]; // Latitude and longitude
    region: string; // Geographical region
    subregion?: string; // Optional subregion
    population?: number; // Optional population
    borders?: string[]; // Optional array of neighboring country codes
    // Add any other fields as necessary
  }

  const countries: Country[];

  export default countries;
}
