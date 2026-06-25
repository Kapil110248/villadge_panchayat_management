exports.getMapLocations = async (req, res) => {
  res.json([
    { name: "Panchayat Bhawan", type: "building", lat: 24.5372, lng: 81.3031, details: "Sarahi Main administrative office" },
    { name: "Govt School", type: "school", lat: 24.5385, lng: 81.3045, details: "Primary and secondary educational center" },
    { name: "Water Storage Tank", type: "water", lat: 24.5360, lng: 81.3020, details: "Capacity: 15k Liters" },
    { name: "Sanitation Health Center", type: "health", lat: 24.5390, lng: 81.3015, details: "First-aid and weekly clinics" }
  ]);
};
