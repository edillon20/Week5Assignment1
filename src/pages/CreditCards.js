import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function CreditCards({ cards = [], addCard, updateCard, deleteCard }) {
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.returnTo || "/checkout";

  const [toast, setToast] = useState({ message: "", type: "success" });
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    cardHolder: "",
    cardNumber: "",
    expiration: "",
    cvv: "",
  });

  const [dialog, setDialog] = useState({
    isOpen: false,
    id: null,
    cardName: "",
  });

  const closeToast = () => setToast({ message: "", type: "success" });

  const resetForm = () => {
    setFormData({
      cardHolder: "",
      cardNumber: "",
      expiration: "",
      cvv: "",
    });
    setEditingId(null);
  };

  const openDeleteDialog = (card) => {
    setDialog({
      isOpen: true,
      id: card.id,
      cardName: card.cardHolder,
    });
  };

  const confirmDelete = () => {
    deleteCard(dialog.id);

    setToast({
      message: `${dialog.cardName}'s card was deleted.`,
      type: "success",
    });

    setDialog({
      isOpen: false,
      id: null,
      cardName: "",
    });

    if (editingId === dialog.id) {
      resetForm();
    }
  };

  const cancelDelete = () => {
    setDialog({
      isOpen: false,
      id: null,
      cardName: "",
    });
  };

  const handleUseSavedCard = (card) => {
    localStorage.setItem("selectedCheckoutCard", JSON.stringify(card));
    navigate(returnTo);
  };

  const handleEditCard = (card) => {
    setEditingId(card.id);
    setFormData({
      cardHolder: card.cardHolder || "",
      cardNumber: card.cardNumber || "",
      expiration: card.expiration || "",
      cvv: card.cvv || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = formatCardNumber(value);
    }

    if (name === "expiration") {
      const digits = value.replace(/\D/g, "").slice(0, 4);

      if (digits.length === 1) {
        const firstDigit = Number(digits);
        formattedValue = firstDigit > 1 ? `0${firstDigit}` : digits;
      } else if (digits.length >= 2) {
        let month = Number(digits.slice(0, 2));

        if (month < 1) month = 1;
        if (month > 12) month = 12;

        const formattedMonth = month.toString().padStart(2, "0");
        const year = digits.slice(2);

        formattedValue = year
          ? `${formattedMonth}/${year}`
          : formattedMonth;
      } else {
        formattedValue = digits;
      }
    }

    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = editingId
      ? updateCard(editingId, formData)
      : addCard(formData);

    if (!result.ok) {
      setToast({ message: result.message, type: "error" });
      return;
    }

    setToast({
      message: editingId
        ? "Card updated successfully."
        : "Card saved successfully.",
      type: "success",
    });

    resetForm();
  };

  return (
    <div className="card">
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />

      <ConfirmDialog
        isOpen={dialog.isOpen}
        title="Delete card?"
        message={`Are you sure you want to delete the saved card for "${dialog.cardName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <h2>Saved Cards</h2>
      <p>Add and manage your saved cards.</p>

      <form onSubmit={handleSubmit} className="checkout-form">
        <input
          type="text"
          name="cardHolder"
          placeholder="Card Holder Name"
          value={formData.cardHolder}
          onChange={handleChange}
        />

        <input
          type="text"
          name="cardNumber"
          placeholder="1234 5678 9012 3456"
          value={formData.cardNumber}
          onChange={handleChange}
          maxLength={19}
        />

        <input
          type="text"
          name="expiration"
          placeholder="MM/YY"
          value={formData.expiration}
          onChange={handleChange}
          maxLength={5}
        />

        <input
          type="text"
          name="cvv"
          placeholder="CVV"
          value={formData.cvv}
          onChange={handleChange}
          maxLength={4}
        />

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button type="submit" className="btn-primary">
            {editingId ? "Update Card" : "Save Card"}
          </button>

          {editingId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div style={{ marginTop: "24px" }}>
        <h3>Saved Cards</h3>

        {cards.length === 0 ? (
          <p>No saved cards yet.</p>
        ) : (
          cards.map((card) => (
            <div key={card.id} className="order-card">
              <p><strong>{card.cardHolder}</strong></p>
              <p>**** **** **** {card.last4}</p>
              <p>Expiration: {card.expiration}</p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleUseSavedCard(card)}
                >
                  Use This Card
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleEditCard(card)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => openDeleteDialog(card)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CreditCards;