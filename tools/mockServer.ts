const server = Bun.serve({
  port: 3001,
  routes: {
    "/api/v1/health": async (req) => {
      console.log(req.url, await req.body?.json());
      return new Response("OK");
    },

    "/api/v1/stats": async (req) => {
      console.log(req.url, await req.body?.json());
      return Response.json({
        totalDistanceKm: 0,
        totalPointsTracked: 0,
        totalReverseGeocodedPoints: 0,
        totalCountriesVisited: 0,
        totalCitiesVisited: 0,
        yearlyStats: [
          {
            year: 0,
            totalDistanceKm: 0,
            totalCountriesVisited: 0,
            totalCitiesVisited: 0,
            monthlyDistanceKm: {
              january: 0,
              february: 0,
              march: 0,
              april: 0,
              may: 0,
              june: 0,
              july: 0,
              august: 0,
              september: 0,
              october: 0,
              november: 0,
              december: 0,
            },
          },
        ],
      });
    },

    "/api/v1/points": async (req) => {
      const body = await req.body?.json();
      console.log(req.url, body);
      return new Response("OK");
    },

    "/api/v1/owntracks/points": {
      POST: async (req) => {
        console.log(req.url, await req.body?.json());
        return new Response("OK");
      },
    },
  },

  fetch(req) {
    console.log("⚠️ Tried to Request: ", req.url, req.body);
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
