import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navigationbar";
import StreamList from "./pages/StreamList";
import Movies from "./pages/Movies";
import Cart from "./pages/Cart";
import About from "./pages/About";
import VideosPage from "./pages/VideosPage";
import Subscriptions from "./pages/Subscriptions";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import { useCart } from "./hooks/useCart";
import { useMediaList } from "./hooks/useMediaList";
import { useOrders } from "./hooks/useOrders";

function App() {
  const {
    mediaList,
    addMediaItem,
    addMovieToWatchList,
    updateStatus,
    updateRating,
    updateTitle,
    deleteItem,
  } = useMediaList();

  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  } = useCart();

  const { orders, addOrder } = useOrders();

  const cartCount = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  return (
    <div className="app">
      <Navbar cartCount={cartCount} />

      <div className="page-container">
        <Routes>
          <Route
            path="/"
            element={
              <StreamList
                mediaList={mediaList}
                addMediaItem={addMediaItem}
                updateStatus={updateStatus}
                updateRating={updateRating}
                updateTitle={updateTitle}
                deleteItem={deleteItem}
              />
            }
          />

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
            path="/subscriptions"
            element={<Subscriptions addToCart={addToCart} />}
          />

          <Route
            path="/cart"
            element={
              <Cart
                cartItems={cartItems}
                removeFromCart={removeFromCart}
                updateCartQuantity={updateCartQuantity}
              />
            }
          />

          <Route
            path="/checkout"
            element={
              <Checkout
                cartItems={cartItems}
                clearCart={clearCart}
                addOrder={addOrder}
              />
            }
          />

          <Route
            path="/orders"
            element={<Orders orders={orders} />}
          />

          <Route path="/about" element={<About />} />

          <Route
            path="/videos"
            element={
              <VideosPage
                mediaList={mediaList}
                updateTitle={updateTitle}
                deleteItem={deleteItem}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;