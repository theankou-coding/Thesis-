import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../../../server/routers";
import { createContext } from "../../../../../server/_core/context";

const handler = async (req: Request) => {
  const responseHeaders = new Headers();
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext({ req, responseHeaders }),
  });

  const headers = new Headers(response.headers);
  responseHeaders.forEach((value, key) => {
    headers.append(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export { handler as GET, handler as POST };
