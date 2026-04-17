import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

function VideosPage({ mediaList = [], updateTitle, deleteItem }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [dialog, setDialog] = useState({
    isOpen: false,
    id: null,
    title: "",
  });

  const queryParams = new URLSearchParams(location.search);
  const filter = queryParams.get("filter");

  const filteredList = mediaList.filter((item) => {
    if (!filter) return true;
    return item.status === filter;
  });

  const getPageTitle = () => {
    if (filter === "to-watch") return "🎬 All To Watch";
    if (filter === "completed") return "✅ All Completed";
    if (filter === "watch-again") return "⭐ All Watch Again";
    return "All Videos";
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast({ message: "", type: "success" });
  };

  const openDeleteDialog = (id, title) => {
    setDialog({
      isOpen: true,
      id,
      title,
    });
  };

  const confirmDelete = () => {
    if (typeof deleteItem === "function") {
      deleteItem(dialog.id);
      showToast(`"${dialog.title}" deleted from your list.`);
    } else {
      showToast("Could not delete title.", "error");
    }

    setDialog({ isOpen: false, id: null, title: "" });
  };

  const cancelDelete = () => {
    setDialog({ isOpen: false, id: null, title: "" });
  };

  const handleSaveEdit = (id) => {
    if (typeof updateTitle !== "function") {
      showToast("Could not update title.", "error");
      return;
    }

    const result = updateTitle(id, editText);

    if (result && result.ok === false) {
      showToast(result.message || "Please enter a valid title.", "error");
      return;
    }

    if (result === false) {
      showToast("Please enter a valid title.", "error");
      return;
    }

    setEditingId(null);
    setEditText("");
    showToast("Title updated.");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className="videos-page-card">
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

      <h2>{getPageTitle()}</h2>
      <p>Here is the full list for this category.</p>

      <button
        type="button"
        className="videos-back-btn btn-primary"
        onClick={() => navigate("/")}
      >
        Back to StreamList
      </button>

      {filteredList.length === 0 ? (
        <p>No videos found in this category.</p>
      ) : (
        <div className="videos-list">
          {filteredList.map((item) => (
            <div key={item.id} className="videos-item">
              <div className="videos-info">
                {filter === "to-watch" && editingId === item.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  <strong>{item.title}</strong>
                )}

                {item.rating && (
                  <p>
                    Rating: {item.rating} Star
                    {Number(item.rating) > 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <div className="videos-buttons">
                {filter === "to-watch" && editingId === item.id ? (
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
                    {filter === "to-watch" && (
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
                    )}
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
        </div>
      )}
    </div>
  );
}

export default VideosPage;