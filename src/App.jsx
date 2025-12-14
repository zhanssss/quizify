import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ImportPage from "./pages/ImportPage.jsx";
import QuizPage from "./pages/QuizPage.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<ImportPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
