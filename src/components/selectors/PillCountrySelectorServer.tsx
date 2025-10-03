import { PillCountrySelector, PillCountrySelectorProps } from "./PillCountrySelector";
import { supportedAppCountries } from "../../utils/countries";

export async function getCountriesWithSvg() {
  return Promise.all(
    supportedAppCountries.map(async (country) => {
      console.log("**country**", country);
      try {
        const response = await fetch(country.flagUrl, { next: { revalidate: 3600 * 24 } }); // Revalidate once a day
        if (!response.ok) {
          console.error(`Failed to fetch flag for ${country.name}`);
          return { ...country, flagSvg: "" };
        }
        const svgText = await response.text();
        return { ...country, flagSvg: Buffer.from(svgText).toString("base64") };
      } catch (error) {
        console.error(`Error fetching flag for ${country.name}:`, error);
        return { ...country, flagSvg: "" };
      }
    })
  );
}

export async function PillCountrySelectorServer(props: Omit<PillCountrySelectorProps, "countries">) {
  //const countries = await getCountriesWithSvg();
  ///console.log("countries", countries);

  return <PillCountrySelector {...props} />;
}
