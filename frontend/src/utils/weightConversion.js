import { KG_TO_LBS, LBS_TO_KG } from "./constants";

export const kgToLbs = (kg) => {
  return kg * KG_TO_LBS;
};

export const lbsToKg = (lbs) => {
  return lbs * LBS_TO_KG;
};

// Anzeige-Gewicht (mit Einheit)
export const formatWeight = (weight, unit) => {
  if (weight === null || weight === undefined || weight === "") return "";
  const displayWeight = unit === "lbs" ? kgToLbs(weight) : weight;
  return `${displayWeight} ${unit}`;
};

// Für Input-Felder: DB-Wert → Anzeige-Wert
export const displayWeight = (dbWeight, unit) => {
  if (dbWeight === null || dbWeight === undefined || dbWeight === "") return "";
  return unit === "lbs" ? kgToLbs(dbWeight) : dbWeight;
};

// Für Speichern: Input-Wert → DB-Wert (immer kg)
export const toDbWeight = (inputWeight, unit) => {
  if (inputWeight === null || inputWeight === undefined || inputWeight === "")
    return null;
  return unit === "lbs" ? lbsToKg(inputWeight) : parseFloat(inputWeight);
};

// Anzeige für Gewicht (behandelt 0 speziell)
export const displayWeightWithLabel = (weight, unit) => {
  if (
    weight === null ||
    weight === undefined ||
    weight === "" ||
    weight === 0
  ) {
    return "Körpergewicht";
  }
  const displayWeight = unit === "lbs" ? kgToLbs(weight) : weight;
  return `${displayWeight} ${unit}`;
};
