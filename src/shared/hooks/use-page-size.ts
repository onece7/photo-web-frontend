import { useEffect, useState } from "react";

export function usePageSize(): number {
  const [pageSize, setPageSize] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches
      ? 12
      : 24,
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = () => setPageSize(media.matches ? 12 : 24);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return pageSize;
}
