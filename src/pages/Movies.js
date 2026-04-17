import React, { useEffect, useState } from "react";
import Toast from "../components/Toast";

function Movies({ addToCart, addMovieToWatchList }) {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const apiKey = process.env.REACT_APP_TMDB_API_KEY;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast({ message: "", type: "success" });
  };

  const getSavedResults = () => {
    const savedResults = localStorage.getItem("movieResults");

    if (!savedResults) return null;

    try {
      const parsedResults = JSON.parse(savedResults);
      return Array.isArray(parsedResults) ? parsedResults : null;
    } catch {
      localStorage.removeItem("movieResults");
      return null;
    }
  };

  const showSavedResults = (message) => {
    const savedResults = getSavedResults();

    if (savedResults && savedResults.length > 0) {
      setMovies(savedResults);
      setError(message);
      return true;
    }

    setMovies([]);
    setError(message);
    return false;
  };

  const saveResults = (results, currentSearchTerm = searchTerm) => {
    setMovies(results);
    localStorage.setItem("movieResults", JSON.stringify(results));
    localStorage.setItem("movieSearchTerm", currentSearchTerm);
  };

  const fetchMoviesFromApi = async (url) => {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch movies.");
    }

    const data = await response.json();
    return data.results || [];
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast("You are back online.");
    };

    const handleOffline = () => {
      setIsOffline(true);
      showToast("You are offline. Saved movie results will be shown.", "error");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const savedSearch = localStorage.getItem("movieSearchTerm");
    const savedResults = getSavedResults();

    if (savedSearch) {
      setSearchTerm(savedSearch);
    }

    if (!navigator.onLine) {
      if (savedResults && savedResults.length > 0) {
        setMovies(savedResults);
        setError("You are offline. Showing saved movie results.");
      } else {
        setError("You are offline and no saved movie results are available.");
      }
      return;
    }

    if (savedResults && savedResults.length > 0) {
      setMovies(savedResults);
    }

    const loadNowPlayingMovies = async () => {
      setLoading(true);
      setError("");

      try {
        const results = await fetchMoviesFromApi(
          `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}`
        );

        setMovies(results);
        localStorage.setItem("movieResults", JSON.stringify(results));

        if (!savedSearch) {
          localStorage.removeItem("movieSearchTerm");
        }
      } catch {
        showSavedResults(
          "Could not fetch new movies. Showing saved movie results if available."
        );
      } finally {
        setLoading(false);
      }
    };

    loadNowPlayingMovies();
  }, [apiKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanSearchTerm = searchTerm.trim();

    if (!cleanSearchTerm) return;

    if (!navigator.onLine) {
      showSavedResults(
        "You are offline. Search is unavailable, showing saved results."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const results = await fetchMoviesFromApi(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
          cleanSearchTerm
        )}`
      );

      saveResults(results, cleanSearchTerm);
    } catch {
      showSavedResults(
        "Search failed. Showing saved movie results if available."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = async () => {
    setSearchTerm("");
    setError("");
    localStorage.removeItem("movieSearchTerm");

    const previousResults = getSavedResults();

    if (!navigator.onLine) {
      if (previousResults && previousResults.length > 0) {
        setMovies(previousResults);
        setError("You are offline. Showing your previously saved movie results.");
      } else {
        setMovies([]);
        setError("You are offline and no saved movie results are available.");
      }
      return;
    }

    setLoading(true);

    try {
      const results = await fetchMoviesFromApi(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}`
      );

      setMovies(results);
      localStorage.setItem("movieResults", JSON.stringify(results));
    } catch {
      if (previousResults && previousResults.length > 0) {
        setMovies(previousResults);
        setError("Could not refresh movies. Showing your previously saved results.");
      } else {
        setMovies([]);
        setError("Could not refresh movies and no saved results are available.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchList = (movie) => {
    if (typeof addMovieToWatchList !== "function") {
      showToast("Could not add movie to watch list.", "error");
      return;
    }

    const result = addMovieToWatchList(movie);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    showToast(`"${movie.title}" added to your watch list.`);
  };

  const handleAddToCart = (movie) => {
    if (typeof addToCart !== "function") {
      showToast("Could not add movie to cart.", "error");
      return;
    }

    const result = addToCart({
      id: `movie-${movie.id}`,
      name: movie.title,
      description: movie.overview || "Movie rental",
      price: Math.floor(Math.random() * (25 - 10 + 1)) + 10,
      image: movie.poster_path
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
        : "",
      quantity: 1,
      type: "movie",
    });

    if (result?.success === false) {
      showToast(result.message || "Could not add movie to cart.", "error");
      return;
    }

    showToast(`"${movie.title}" added to cart.`);
  };

  return (
    <div className="card">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />

      <h2>Search for fun new movies.</h2>
      <p>Enter a key term to find new movies to add to your watch list!</p>

      {isOffline && (
        <p className="offline-message">
          You are offline. Search is disabled and saved results may be shown.
        </p>
      )}

      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search for a movie"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isOffline}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={isOffline}
        >
          Search
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={clearSearch}
        >
          Clear Search
        </button>
      </form>

      {loading && <p>Loading movies...</p>}
      {error && <p>{error}</p>}

      <div className="movie-grid">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            {movie.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                className="movie-poster"
              />
            )}

            <h3>{movie.title}</h3>
            <p><strong>Release Date:</strong> {movie.release_date}</p>
            <p><strong>TMDB Rating:</strong> {movie.vote_average}</p>
            <p>{movie.overview}</p>

            <button
              type="button"
              className="btn-primary"
              onClick={() => handleAddToWatchList(movie)}
            >
              Add to Watch List
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleAddToCart(movie)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Movies;