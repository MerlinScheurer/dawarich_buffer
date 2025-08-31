await fetch("http://localhost:3000/api/v1/points?api_key=Bada55", {
  credentials: "omit",
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0",
    Accept: "*/*",
    "Accept-Language": "en-GB",
    "Content-Type": "application/json",
  },
  method: "POST",
  mode: "cors",
  body: JSON.stringify({
    locations: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [-122.40530871, 37.74430413],
        },
        properties: {
          battery_state: "full",
          battery_level: 0.7,
          wifi: "dawarich_home",
          timestamp: "2025-01-17T21:03:01Z",
          horizontal_accuracy: 5,
          vertical_accuracy: -1,
          altitude: 0,
          speed: 92.088,
          speed_accuracy: 0,
          course: 27.07,
          course_accuracy: 0,
          track_id: "799F32F5-89BB-45FB-A639-098B1B95B09F",
          device_id: "8D5D4197-245B-4619-A88B-2049100ADE46",
        },
      },
    ],
  }),
});
