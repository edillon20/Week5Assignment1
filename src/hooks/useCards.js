import { useEffect, useState } from "react";

export function useCards() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const savedCards = localStorage.getItem("creditCards");

    if (!savedCards) return;

    try {
      const parsedCards = JSON.parse(savedCards);
      setCards(Array.isArray(parsedCards) ? parsedCards : []);
    } catch {
      setCards([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("creditCards", JSON.stringify(cards));
  }, [cards]);

  const validateCard = (card) => {
    if (!card.cardHolder.trim()) {
      return { ok: false, message: "Card holder name is required." };
    }

    if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(card.cardNumber)) {
      return {
        ok: false,
        message: "Card number must follow 1234 5678 9012 3456 format.",
      };
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiration)) {
      return {
        ok: false,
        message: "Expiration date must be in MM/YY format.",
      };
    }

    const [month, year] = card.expiration.split("/");
    const expirationDate = new Date(`20${year}`, month);
    const currentDate = new Date();

    if (expirationDate <= currentDate) {
      return {
        ok: false,
        message: "Card expiration date must be in the future.",
      };
    }

    if (!/^\d{3,4}$/.test(card.cvv)) {
      return {
        ok: false,
        message: "CVV must be 3 or 4 digits.",
      };
    }

    return { ok: true };
  };

  const addCard = (card) => {
    const validation = validateCard(card);

    if (!validation.ok) {
      return validation;
    }

    const newCard = {
      id: crypto.randomUUID(),
      ...card,
      last4: card.cardNumber.slice(-4),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCards((prev) => [newCard, ...prev]);
    return { ok: true };
  };

  const updateCard = (id, updatedCard) => {
    const validation = validateCard(updatedCard);

    if (!validation.ok) {
      return validation;
    }

    setCards((prev) =>
      prev.map((card) =>
        card.id === id
          ? {
              ...card,
              ...updatedCard,
              last4: updatedCard.cardNumber.slice(-4),
              updatedAt: new Date().toISOString(),
            }
          : card
      )
    );

    return { ok: true };
  };

  const deleteCard = (id) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  return {
    cards,
    addCard,
    updateCard,
    deleteCard,
  };
}