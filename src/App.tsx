import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import SearchResultPage from "./pages/SearchResultPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/search-results" element={<SearchResultPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
