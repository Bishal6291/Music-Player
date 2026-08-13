import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Home-Page";
import PlayerPage from "./Player-Page"; // React component name must start with capital.or it will treat is like html tag.


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/player" element={<PlayerPage />} />
      </Routes>
    </Router>
  );
}