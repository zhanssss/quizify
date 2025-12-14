import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./rootReducer.js";

import { banksApi } from "./features/banks/banksApi.js";
import { quizzesApi } from "./features/quizzes/quizzesApi.js";
import { materialsApi } from "./features/materials/materialsApi.js";
import { aiApi } from "./features/ai/aiApi.js";

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            banksApi.middleware,
            quizzesApi.middleware,
            materialsApi.middleware,
            aiApi.middleware
        ),
});

export default store;
