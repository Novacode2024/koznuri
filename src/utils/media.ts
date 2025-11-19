export const buildYoutubeEmbedUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (host.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }

      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        const params = new URLSearchParams();
        const start =
          parsed.searchParams.get("start") ?? parsed.searchParams.get("t");
        if (start) {
          params.set("start", start.replace(/[^0-9]/g, ""));
        }
        const playlist = parsed.searchParams.get("list");
        if (playlist) {
          params.set("list", playlist);
        }
        const paramString = params.toString();
        return `https://www.youtube.com/embed/${videoId}${
          paramString ? `?${paramString}` : ""
        }`;
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[media] Failed to build YouTube embed url:", error);
    }
  }

  return url;
};


