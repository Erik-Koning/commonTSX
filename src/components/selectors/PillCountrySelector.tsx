"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { useRouter } from "next/navigation";
import { replaceUrlDomain } from "../../utils/DOM";
import { navigateToURL } from "../../utils/url";
import { appCountryCC, getFlagSrc, supportedAppCountries, SupportedAppCountry } from "../../utils/countries";

export interface PillCountrySelectorProps {
  onChange?: (country: SupportedAppCountry) => void;
  atCC?: string;
  objectFit?: "fill" | "cover" | "contain" | "none" | "scale-down";
  fromCC?: string;
  iconClosedClassName?: string;
  iconOpenClassName?: string;
  iconImageContainerClosedClassName?: string;
  iconImageContainerOpenClassName?: string;
  countries?: SupportedAppCountry[];
}

const getCountry = (atCC: string, countries?: SupportedAppCountry[]) => {
  return Array.isArray(countries)
    ? countries.find((country) => country.code === atCC) || countries[0]
    : supportedAppCountries.find((country) => country.code === atCC) || supportedAppCountries[0];
};

export function PillCountrySelector({
  onChange,
  atCC = appCountryCC,
  objectFit = "fill",
  fromCC,
  iconClosedClassName = "",
  iconOpenClassName = "",
  iconImageContainerClosedClassName = "",
  iconImageContainerOpenClassName = "",
  countries,
}: PillCountrySelectorProps) {
  const isFirstRender = useRef(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<SupportedAppCountry>(getCountry(atCC, countries));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
  }, []);

  const router = useRouter();

  const handleCountrySelect = (country: SupportedAppCountry) => {
    setSelectedCountry(country);
    setIsOpen(false);
    onChange?.(country);

    console.info("handleCountrySelect", country, fromCC, atCC);

    if (atCC && atCC === country.code) {
      console.info("User is from same country code as the app being visited. We are already on the correct domain.");
      //User is from same country code as the app being visited. We are already on the correct domain.
      return;
    }

    const domainToNavigateTo = getCountry(country.code.toUpperCase(), countries)?.domain;
    console.info("domainToNavigateTo", domainToNavigateTo);
    const newUrl = replaceUrlDomain(window.location.href, domainToNavigateTo, true);
    console.info("newUrl", newUrl);
    navigateToURL(router, newUrl);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Featured countries to show when open (US, CA, UK)
  const featuredCountries = (countries ? countries : supportedAppCountries).filter((country) => ["US", "CA", "GB"].includes(country.code));

  return (
    <div ref={containerRef} className="relative inline-block">
      <motion.div
        className={cn(
          "bg-background rounded-full cursor-pointer transition-colors duration-200",
          !isOpen && cn("bg-black/25", iconClosedClassName),
          isOpen && cn("", iconOpenClassName),
          isFirstRender.current && "transition-none duration-0"
        )}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.97 }}
        layout
      >
        <motion.div
          className="flex items-center p-1 mx-1 px-0 gap-2.5"
          initial={{ width: isOpen ? "auto" : "2.5rem" }}
          animate={{ width: isOpen ? "auto" : "2.5rem" }}
          transition={{ duration: isFirstRender.current ? 0 : 0.18 }}
        >
          {!isOpen ? (
            <div
              className={cn(
                "opacity-80 hover:opacity-100 w-10 h-10 rounded-full overflow-hidden border border-gray-200",
                !isOpen && cn("border-darkBlue", iconImageContainerClosedClassName),
                isOpen && cn("", iconImageContainerOpenClassName)
              )}
            >
              <Image
                id="selected-country-flag"
                src={getFlagSrc(selectedCountry)}
                alt={`${selectedCountry.name} flag`}
                width={isOpen ? 40 : 40}
                height={isOpen ? 40 : 40}
                className="h-full w-full"
                style={{ objectFit: objectFit }}
              />
            </div>
          ) : (
            <>
              {supportedAppCountries.map((country) => (
                <motion.div
                  key={country.code}
                  className={cn(
                    "w-10 h-10 rounded-full overflow-hidden border",
                    selectedCountry.code === country.code ? "outline outline-2 outline-purple" : "border-gray-200",
                    isOpen && "w-12 h-12 md:w-10 md:h-10"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCountrySelect(country);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    id={`country-flag-${country.code}`}
                    src={getFlagSrc(country)}
                    alt={`${country.name} flag`}
                    width={isOpen ? 40 : 40}
                    height={isOpen ? 40 : 40}
                    className="transition-all duration-150 h-full w-full scale-y-[2] scale-x-125 hover:scale-y-[1.6] hover:scale-x-[1.1]"
                    style={{ objectFit: objectFit }}
                  />
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isOpen && false && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-2 bg-white rounded-2xl shadow-lg overflow-hidden"
            style={{ width: "280px", left: "50%", transform: "translateX(-50%)" }}
          >
            <div className="p-2 grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
              {supportedAppCountries.map((country) => (
                <motion.div
                  key={country.code}
                  className={`flex flex-col items-center p-2 cursor-pointer rounded-lg hover:bg-gray-100 ${
                    selectedCountry.code === country.code ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleCountrySelect(country)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 mb-1">
                    <Image src={getFlagSrc(country)} alt={`${country.name} flag`} width={40} height={40} className={`h-full w-full object-${objectFit}`} />
                  </div>
                  <span className="text-xs text-center">{country.code.toUpperCase()}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
