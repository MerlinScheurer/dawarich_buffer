const server = Bun.serve({
  port: 3001,
  routes: {
    "/api/v1/health": async (req) => {
      console.log(req.url, await req.body?.json());
      return new Response("OK");
    },

    "/api/v1/stats": async (req) => {
      console.log(req.url, await req.body?.json());
      return Response.json({});
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
