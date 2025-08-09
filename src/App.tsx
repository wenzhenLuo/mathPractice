import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import History from "@/pages/History";
import ErrorCollection from "@/pages/ErrorCollection";
import MathProblemGenerator from "@/components/MathProblemGenerator";
import { useState } from "react";
import { AuthContext } from '@/contexts/authContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
         <Route path="/history" element={<History />} />
         <Route path="/errors" element={<ErrorCollection />} />
         <Route path="/practice-errors" element={<MathProblemGenerator practiceErrors={true} />} />
      </Routes>
    </AuthContext.Provider>
  );
}