const getTimestamp = () => {
  const d = new Date();

  return d.toISOString();
};

const RequestTypes = {
  OwnTracks: "owntracks",
  Dawarich: "dawarich",
};

type RequestCached = {
  url: string;
  apiKey: string;
  type: string;
  body: Record<string, unknown>;
};

const POINTS_CACHE = "./cache/points_cache.json";

const save = async (pointsCacheParsed: RequestCached[]) => {
  return Bun.write(POINTS_CACHE, JSON.stringify(pointsCacheParsed));
};

const load = async (): Promise<RequestCached[]> => {
  let pointsCache = Bun.file(POINTS_CACHE, { type: "application/json" });

  if (!(await pointsCache.exists())) {
    await Bun.write(POINTS_CACHE, JSON.stringify([]));

    pointsCache = Bun.file(POINTS_CACHE, { type: "application/json" });
  }

  return (await pointsCache.json()) || [];
};

const checkIfDawarichIsOnline = async () => {
  let dawarichIsOnline = false;

  try {
    const response = await fetch(`${Bun.env.DAWARICH_URL}/api/v1/health`);

    dawarichIsOnline = response.status === 200;
  } catch (err: any) {
    dawarichIsOnline = false;

    console.log(`${getTimestamp()}: Dawarich seems offline...`);
    if (err.code !== "ConnectionRefused") {
      console.log(`${getTimestamp()}: ${err}`);
    }
  }

  console.log(`${getTimestamp()}: dawarichIsOnline`, dawarichIsOnline);

  return dawarichIsOnline;
};

function getApiKeyFromRequest(req: Bun.BunRequest) {
  const url = req.url;
  const headers = req.headers;

  const authHeader = (
    headers.get("Authorization") || headers.get("authorization")
  )
    ?.split(" ")
    .pop();

  const urlparsed = new URL(url);

  const params = new URLSearchParams(urlparsed.searchParams);
  const apiKey = params.get("api_key");

  return apiKey || authHeader;
}

const getCachesRequests = async (): Promise<RequestCached[]> => {
  let pointsCache = await load();

  return pointsCache;
};

const cacheRequest = async (pointsCacheParsed: RequestCached[]) => {
  console.log(`${getTimestamp()}: Storing ${pointsCacheParsed.length}`);

  save(pointsCacheParsed);

  console.log(`${getTimestamp()}: Done Storing`);

  return "ok";
};

const forwardRequests = async (pointsCacheParsed: RequestCached[]) => {
  console.log(
    `${getTimestamp()}: Forwarding ${pointsCacheParsed.length} requests.`
  );

  let pointsNotSend = [...pointsCacheParsed];

  let iterations = 0;

  for (const point of pointsCacheParsed) {
    const { apiKey, type, body } = point;
    const currentIndex = pointsNotSend.indexOf(point);
    console.log(`${getTimestamp()}: Forwarding ${JSON.stringify(body)}`);

    let targetUrl = "";
    if (type === RequestTypes.OwnTracks) {
      targetUrl = "/api/v1/owntracks/points";
    } else if (type === RequestTypes.Dawarich) {
      targetUrl = "/api/v1/points";
    }

    const response = await fetch(`${Bun.env.DAWARICH_URL}${targetUrl}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      console.log(
        `${getTimestamp()}: Something went wrong, trying to exit!`,
        response.status
      );
      break;
    }

    if (currentIndex > -1) {
      pointsNotSend.splice(currentIndex, 1);
    }

    iterations++;
  }

  if (pointsNotSend.length !== pointsCacheParsed.length) {
    await cacheRequest(pointsNotSend);
  }

  if (iterations == 0) {
    return "error";
  }

  console.log(`${getTimestamp()}: Done Forwarding.`);

  return "ok";
};

const handleRequest = async (req: Bun.BunRequest, type: string) => {
  let pointsCacheParsed = await getCachesRequests();

  console.log(`${getTimestamp()}: Points in queue: `, pointsCacheParsed.length);

  const apiKey = getApiKeyFromRequest(req);

  const body: any = await req.json();
  const newPoint: RequestCached = {
    url: req.url,
    apiKey: apiKey || "unknwon",
    type: type,
    body: body,
  };

  pointsCacheParsed.push(newPoint);

  let dawarichIsOnline = await checkIfDawarichIsOnline();

  let status = "error";
  if (dawarichIsOnline) {
    status = await forwardRequests(pointsCacheParsed);
  } else {
    status = await cacheRequest(pointsCacheParsed);
  }

  return status;
};

const server = Bun.serve({
  port: 3000,
  routes: {
    "/api/v1/health": async (req) => {
      console.log(`${getTimestamp()}: Serving ${req.url}`);

      return Response.json({
        status: "ok",
      });

      return new Response("Internal Server Error", { status: 500 });
    },

    "/api/v1/stats": async (req) => {
      console.log(`${getTimestamp()}: Serving ${req.url}`);

      const dawarichIsOnline = await checkIfDawarichIsOnline();

      if (dawarichIsOnline) {
        const apiKey = getApiKeyFromRequest(req);

        const body = await req.body?.json();

        const response = await fetch(`${Bun.env.DAWARICH_URL}/api/v1/stats`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify(body),
        });

        if (response.status === 401) {
          console.log(
            `${getTimestamp()}: Unauthorized`,
            response.status,
            apiKey,
            req.url
          );

          return new Response("Unauthorized!", { status: 401 });
        }

        if (response.status !== 200) {
          console.log(
            `${getTimestamp()}: Something went wrong, trying to exit!`,
            response.status
          );

          return new Response("Internal Server Error", { status: 500 });
        }

        return Response.json(await response.json());
      }

      return Response.json({ status: "OK" });
    },

    "/api/v1/points": async (req) => {
      console.log(`${getTimestamp()}: Serving ${req.url}`);

      await handleRequest(req, RequestTypes.Dawarich);

      return new Response("OK");
    },

    "/api/v1/owntracks/points": {
      POST: async (req) => {
        console.log(`${getTimestamp()}: Serving ${req.url}`);

        await handleRequest(req, RequestTypes.OwnTracks);

        return new Response("OK");
      },
    },
  },

  fetch(req) {
    console.log(`${getTimestamp()}: ⚠️ Tried to Request: `, req.url, req.body);
    return new Response("Not Found", { status: 404 });
  },
});

console.log(
  `${getTimestamp()}: Listening on http://localhost:${server.port} ...`
);
