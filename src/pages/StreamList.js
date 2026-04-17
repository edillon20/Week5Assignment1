import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StreamList.css";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

function StreamList({
  mediaList = [],
  addMediaItem,
  updateStatus,
  updateRating,
  updateTitle,
  deleteItem,
}) {
  const [mediaTitle, setMediaTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [dialog, setDialog] = useState({
    isOpen: false,
    id: null,
    title: "",
  });

  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast({ message: "", type: "success" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (typeof addMediaItem !== "function") {
      showToast("Could not add media item.", "error");
      return;
    }

    const result = addMediaItem(mediaTitle);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    setMediaTitle("");
    showToast("Media item added.");
  };

  const handleSaveEdit = (id) => {
    if (typeof updateTitle !== "function") {
      showToast("Could not update title.", "error");
      return;
    }

    const result = updateTitle(id, editText);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    setEditingId(null);
    setEditText("");
    showToast("Title updated.");
  };

  const openDeleteDialog = (id, title) => {
    setDialog({
      isOpen: true,
      id,
      title,
    });
  };

  const confirmDelete = () => {
    deleteItem(dialog.id);
    setDialog({ isOpen: false, id: null, title: "" });
    showToast(`"${dialog.title}" removed from your list.`);
  };

  const cancelDelete = () => {
    setDialog({ isOpen: false, id: null, title: "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const toWatchItems = mediaList.filter((item) => item.status === "to-watch");
  const completedItems = mediaList.filter((item) => item.status === "completed");
  const watchAgainItems = mediaList.filter((item) => item.status === "watch-again");

  const visibleToWatch = toWatchItems.slice(0, 5);
  const visibleCompleted = completedItems.slice(0, 5);
  const visibleWatchAgain = watchAgainItems.slice(0, 5);

  return (
    <div className="streamlist-card">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />

      <ConfirmDialog
        isOpen={dialog.isOpen}
        title="Delete title?"
        message={`Are you sure you want to delete "${dialog.title}" from your list?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <h1>StreamList</h1>
      <p>Add movies or shows to your list.</p>

      <form className="streamlist-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter media title"
          value={mediaTitle}
          onChange={(e) => setMediaTitle(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Add
        </button>
      </form>

      <div className="sections-container">
        <div className="category-section">
          <h2>🎬 To Watch</h2>
          {toWatchItems.length === 0 ? (
            <p>No videos to watch yet.</p>
          ) : (
            <>
              {visibleToWatch.map((item) => (
                <div key={item.id} className="media-item">
                  <div>
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                    ) : (
                      <strong>{item.title}</strong>
                    )}
                  </div>

                  <div className="media-actions">
                    {editingId === item.id ? (
                      <>
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => handleSaveEdit(item.id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setEditingId(item.id);
                            setEditText(item.title);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => updateStatus(item.id, "completed")}
                        >
                          Complete
                        </button>
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => updateStatus(item.id, "watch-again")}
                        >
                          Watch Again
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => openDeleteDialog(item.id, item.title)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {toWatchItems.length > 5 && (
                <button
                  type="button"
                  className="view-button btn-primary"
                  onClick={() => navigate("/videos?filter=to-watch")}
                >
                  View All To Watch
                </button>
              )}
            </>
          )}
        </div>

        <div className="category-section">
          <h2>✅ Completed</h2>
          {completedItems.length === 0 ? (
            <p>No completed videos yet.</p>
          ) : (
            <>
              {visibleCompleted.map((item) => (
                <div key={item.id} className="media-item">
                  <div className="media-info">
                    <strong>{item.title}</strong>
                    <div className="rating-row">
                      <label htmlFor={`rating-${item.id}`}>Rating:</label>
                      <select
                        id={`rating-${item.id}`}
                        value={item.rating}
                        onChange={(e) => updateRating(item.id, e.target.value)}
                      >
                        <option value="">Select Rating</option>
                        <option value="1">1 Star</option>
                        <option value="2">2 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="5">5 Stars</option>
                      </select>
                    </div>
                  </div>

                  <div className="media-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => updateStatus(item.id, "to-watch")}
                    >
                      Move Back
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => updateStatus(item.id, "watch-again")}
                    >
                      Watch Again
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => openDeleteDialog(item.id, item.title)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {completedItems.length > 5 && (
                <button
                  type="button"
                  className="view-button btn-primary"
                  onClick={() => navigate("/videos?filter=completed")}
                >
                  View All Completed
                </button>
              )}
            </>
          )}
        </div>

        <div className="category-section">
          <h2>⭐ Watch Again</h2>
          {watchAgainItems.length === 0 ? (
            <p>No watch again videos yet.</p>
          ) : (
            <>
              {visibleWatchAgain.map((item) => (
                <div key={item.id} className="media-item">
                  <div>
                    <strong>{item.title}</strong>
                    <p className="rating-text">
                      Rating:{" "}
                      {item.rating
                        ? `${item.rating} Star${Number(item.rating) > 1 ? "s" : ""}`
                        : "Not rated"}
                    </p>
                  </div>

                  <div className="media-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => updateStatus(item.id, "completed")}
                    >
                      Remove from Watch Again
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => openDeleteDialog(item.id, item.title)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {watchAgainItems.length > 5 && (
                <button
                  type="button"
                  className="view-button btn-primary"
                  onClick={() => navigate("/videos?filter=watch-again")}
                >
                  View All Watch Again
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StreamList;