import { useEffect, useState } from "react";

export function useCards() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const savedCards = localStorage.getItem("creditCards");
    if (!savedCards) return;

    try {
      const parsed = JSON.parse(savedCards);
      setCards(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCards([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("creditCards", JSON.stringify(cards));
  }, [cards]);

  const addCard = (card) => {
    if (!card.cardHolder.trim()) {
      return { ok: false, message: "Card holder name is required." };
    }

    if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(card.cardNumber)) {
      return {
        ok: false,
        message: "Card number must follow 1234 5678 9012 3456 format.",
      };
    }

    const newCard = {
      id: crypto.randomUUID(),
      ...card,
      last4: card.cardNumber.slice(-4),
      createdAt: new Date().toISOString(),
    };

    setCards((prev) => [newCard, ...prev]);
    return { ok: true };
  };

  const deleteCard = (id) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  return { cards, addCard, deleteCard };
}