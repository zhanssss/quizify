import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout.jsx";

import AboutPage from "./pages/AboutPage.jsx";
import ImportPage from "./pages/banks/ImportPage.jsx";

import QuizCreatePage from "./pages/quizzes/QuizCreatePage.jsx";
import QuizPage from "./pages/quizzes/QuizPage.jsx";
import QuizArchivePage from "./pages/quizzes/QuizArchivePage.jsx";
import QuizzesHomePage from "./pages/quizzes/QuizzesHomePage.jsx";

import MaterialsArchivePage from "./pages/materials/MaterialsArchivePage.jsx";
import UploadPage from "./pages/materials/UploadPage.jsx";

import ProfilePage from "./pages/profile/ProfilePage.jsx";
import AiLabPage from "./pages/AI/AiLabPage.jsx";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<AboutPage />} />

                <Route path="/import" element={<ImportPage />} />

                <Route path="/quizzes" element={<QuizzesHomePage />} />
                <Route path="/quizzes/create" element={<QuizCreatePage />} />
                <Route path="/quizzes/:id" element={<QuizPage />} />
                <Route path="/archive/quizzes" element={<QuizArchivePage />} />

                <Route path="/archive/materials" element={<MaterialsArchivePage />} />
                <Route path="/upload" element={<UploadPage />} />

                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/ai" element={<AiLabPage />} />
            </Route>
        </Routes>
    );
}
