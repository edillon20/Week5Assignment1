import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { useCards } from "../hooks/useCards";
import ConfirmDialog from "../components/ConfirmDialog";

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function CreditCards() {
  const { cards, addCard, deleteCard } = useCards();
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.returnTo || "/checkout";

  const [toast, setToast] = useState({ message: "", type: "success" });

  const [formData, setFormData] = useState({
    cardHolder: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [dialog, setDialog] = useState({
    isOpen: false,
    id: null,
    cardName: "",
  });

  const closeToast = () => setToast({ message: "", type: "success" });

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "cardNumber" ? formatCardNumber(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = addCard(formData);

    if (!result.ok) {
      setToast({ message: result.message, type: "error" });
      return;
    }

    setToast({ message: "Card saved successfully.", type: "success" });
    setFormData({
      cardHolder: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    });
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

      <h2>Credit Card Management</h2>
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
          name="expiry"
          placeholder="MM/YY"
          value={formData.expiry}
          onChange={handleChange}
        />

        <input
          type="text"
          name="cvv"
          placeholder="CVV"
          value={formData.cvv}
          onChange={handleChange}
        />

        <button type="submit" className="btn-primary">
          Save Card
        </button>
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
              <p>Expiry: {card.expiry}</p>

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