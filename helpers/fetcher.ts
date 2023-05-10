import superjson from "superjson";

const fetcher = async <T>(key: string) => {
  const res = await fetch(key, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.text();
  const ans = superjson.parse<T>(data);
  return ans;
};

export default fetcher;