import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // В будущем тут будет только token (и, возможно, минимальные флаги UI)
    token: null,

    // Пока работаем без бэка — локальный профиль (в памяти)
    user: {
        id: "local-user",
        displayName: "User",
    },

    // Настройки квиза (используются QuizCreatePage)
    settings: {
        defaultQuestionCount: 40,
        shuffleQuestions: true,
        shuffleAnswers: true,
    },
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        // JWT (на будущее)
        setToken(state, action) {
            state.token = action.payload || null;
        },
        clearToken(state) {
            state.token = null;
        },

        // UI/профиль (пока локально)
        setDisplayName(state, action) {
            state.user.displayName = String(action.payload || "").trim().slice(0, 40) || "User";
        },

        // Настройки квиза
        setDefaultQuestionCount(state, action) {
            const v = Number(action.payload);
            state.settings.defaultQuestionCount = Number.isFinite(v) ? Math.max(1, Math.min(v, 300)) : 40;
        },
        setShuffleQuestions(state, action) {
            state.settings.shuffleQuestions = !!action.payload;
        },
        setShuffleAnswers(state, action) {
            state.settings.shuffleAnswers = !!action.payload;
        },
    },
});

export const {
    setToken,
    clearToken,
    setDisplayName,
    setDefaultQuestionCount,
    setShuffleQuestions,
    setShuffleAnswers,
} = profileSlice.actions;

export default profileSlice.reducer;
