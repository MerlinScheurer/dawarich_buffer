await fetch("http://localhost:3000/api/v1/stats?api_key=Bada55", {
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
});
