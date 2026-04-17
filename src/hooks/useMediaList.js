import { useEffect, useState } from "react";

export function useMediaList() {
  const [mediaList, setMediaList] = useState([]);

  useEffect(() => {
    const savedMedia = localStorage.getItem("mediaList");

    if (!savedMedia) return;

    try {
      const parsedMedia = JSON.parse(savedMedia);
      setMediaList(Array.isArray(parsedMedia) ? parsedMedia : []);
    } catch {
      setMediaList([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mediaList", JSON.stringify(mediaList));
  }, [mediaList]);

  const normalizeTitle = (title) => title.trim().toLowerCase();

  const mediaExists = (title) => {
    const normalizedTitle = normalizeTitle(title);

    return mediaList.some(
      (item) => normalizeTitle(item.title) === normalizedTitle
    );
  };

  const createId = () => {
    if (
      typeof crypto !== "undefined" &&
      crypto &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }

    return `media-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  };

  const createMediaItem = (title) => ({
    id: createId(),
    title: title.trim(),
    status: "to-watch",
    rating: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const addMediaItem = (title) => {
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      return { ok: false, message: "Please enter a valid title." };
    }

    if (mediaExists(cleanTitle)) {
      return { ok: false, message: "That title is already in your list." };
    }

    const newItem = createMediaItem(cleanTitle);
    setMediaList((prevItems) => [newItem, ...prevItems]);

    return { ok: true };
  };

  const addMovieToWatchList = (movie) => {
    const movieTitle = movie?.title?.trim();

    if (!movieTitle) {
      return { ok: false, message: "Movie title is missing." };
    }

    if (mediaExists(movieTitle)) {
      return { ok: false, message: "That movie is already in your watch list." };
    }

    const newItem = createMediaItem(movieTitle);
    setMediaList((prevItems) => [newItem, ...prevItems]);

    return { ok: true };
  };

  const updateStatus = (id, newStatus) => {
    setMediaList((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const updateRating = (id, newRating) => {
    setMediaList((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;

        const ratingValue = Number(newRating);

        return {
          ...item,
          rating: newRating,
          status: ratingValue >= 4 ? "watch-again" : "completed",
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const updateTitle = (id, newTitle) => {
    const cleanTitle = newTitle.trim();

    if (!cleanTitle) {
      return { ok: false, message: "Please enter a valid title." };
    }

    const duplicateExists = mediaList.some(
      (item) =>
        item.id !== id &&
        normalizeTitle(item.title) === normalizeTitle(cleanTitle)
    );

    if (duplicateExists) {
      return { ok: false, message: "That title already exists in your list." };
    }

    setMediaList((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              title: cleanTitle,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    return { ok: true };
  };

  const deleteItem = (id) => {
    setMediaList((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  return {
    mediaList,
    addMediaItem,
    addMovieToWatchList,
    updateStatus,
    updateRating,
    updateTitle,
    deleteItem,
    setMediaList,
  };
}