const fetcher = async (key: string) => {
  const res = await fetch(key, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return data;
};

export default fetcher;