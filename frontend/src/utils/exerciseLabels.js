export const getEquipmentLabel = (type) => {
  switch (type) {
    case "BARBELL":
      return "Langhantel";
    case "DUMBBELL":
      return "Kurzhantel";
    case "MACHINE":
      return "Maschine";
    case "CABLE":
      return "Seilzug";
    case "PLATE_LOADED":
      return "Plate Loaded";
    case "BODYWEIGHT":
      return "Körpergewicht";
    case "OTHER":
      return "Sonstiges";
    default:
      return type;
  }
};

export const getMuscleGroupLabel = (group) => {
  switch (group) {
    case "CHEST":
      return "Brust";
    case "BACK":
      return "Rücken";
    case "SHOULDERS":
      return "Schultern";
    case "BICEPS":
      return "Bizeps";
    case "TRICEPS":
      return "Trizeps";
    case "LEGS":
      return "Beine";
    case "ABS":
      return "Bauch";
    case "GLUTES":
      return "Gesäß";
    case "CALVES":
      return "Waden";
    case "FOREARMS":
      return "Unterarme";
    default:
      return group;
  }
};
