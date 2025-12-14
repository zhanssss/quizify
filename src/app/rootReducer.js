import { combineReducers } from "@reduxjs/toolkit";
import profileReducer from "./features/profile/profileSlice.js";

import { banksApi } from "./features/banks/banksApi.js";
import { quizzesApi } from "./features/quizzes/quizzesApi.js";
import { materialsApi } from "./features/materials/materialsApi.js";
import { aiApi } from "./features/ai/aiApi.js";

export const rootReducer = combineReducers({
    profile: profileReducer,

    [banksApi.reducerPath]: banksApi.reducer,
    [quizzesApi.reducerPath]: quizzesApi.reducer,
    [materialsApi.reducerPath]: materialsApi.reducer,
    [aiApi.reducerPath]: aiApi.reducer,
});
