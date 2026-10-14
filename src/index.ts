// Define the structure of your Cloudflare KV binding
interface Env {
  SHARED_DATA_STORE: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Endpoint for your mobile app: GET /data
    if (url.pathname === "/data") {
      try {
        // Retrieve the cached JSON string using the correct binding name!
        const cachedData = await env.SHARED_DATA_STORE.get("latest_json");

        // If no data has been fetched yet
        if (!cachedData) {
          return new Response(
            JSON.stringify({ error: "Data is still initializing. Please check back shortly." }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Return the JSON data back to your mobile app
        return new Response(cachedData, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });

      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: "Internal Server Error", details: err.message }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Default response for any other URL path
    return new Response("Not Found", { status: 404 });
  },
};