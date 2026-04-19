import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navigationbar";
import StreamList from "./pages/StreamList";
import Movies from "./pages/Movies";
import Cart from "./pages/Cart";
import About from "./pages/About";
import VideosPage from "./pages/VideosPage";
import Subscriptions from "./pages/Subscriptions";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import CreditCards from "./pages/CreditCards";
import Login from "./pages/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useCart } from "./hooks/useCart";
import { useMediaList } from "./hooks/useMediaList";
import { useOrders } from "./hooks/useOrders";
import { useCards } from "./hooks/useCards";

function App() {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  } = useCart();

  const {
    mediaList,
    addMediaItem,
    addMovieToWatchList,
    updateStatus,
    updateRating,
    updateTitle,
    deleteItem,
  } = useMediaList();

  const { orders, addOrder } = useOrders();
  const { cards, addCard,updateCard, deleteCard } = useCards();

  const cartCount = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  return (
    <div className="app">
      <Navbar cartCount={cartCount} />

      <div className="page-container">
        <Routes>
          <Route path="/" element={<Navigate to="/movies" replace />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/movies"
            element={
              <Movies
                addToCart={addToCart}
                addMovieToWatchList={addMovieToWatchList}
              />
            }
          />

          <Route
            path="/streamlist"
            element={
              <ProtectedRoute>
                <StreamList
                  mediaList={mediaList}
                  addMediaItem={addMediaItem}
                  updateStatus={updateStatus}
                  updateRating={updateRating}
                  updateTitle={updateTitle}
                  deleteItem={deleteItem}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <Subscriptions addToCart={addToCart} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart
                  cartItems={cartItems}
                  removeFromCart={removeFromCart}
                  updateCartQuantity={updateCartQuantity}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout
                  cartItems={cartItems}
                  clearCart={clearCart}
                  addOrder={addOrder}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders orders={orders} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cards"
            element={
              <ProtectedRoute>
                <CreditCards
                  cards={cards}
                  addCard={addCard}
                  updateCard={updateCard}
                  deleteCard={deleteCard}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />

          <Route
            path="/videos"
            element={
              <ProtectedRoute>
                <VideosPage
                  mediaList={mediaList}
                  updateTitle={updateTitle}
                  deleteItem={deleteItem}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;