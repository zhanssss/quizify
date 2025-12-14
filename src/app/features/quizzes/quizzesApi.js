import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { listQuizzes, getQuiz, saveQuiz, deleteQuiz } from "./quizzesStorage.js";

export const quizzesApi = createApi({
    reducerPath: "quizzesApi",
    baseQuery: fakeBaseQuery(),
    tagTypes: ["Quizzes", "Quiz"],
    endpoints: (builder) => ({
        getQuizzes: builder.query({
            queryFn: async () => ({ data: await listQuizzes() }),
            providesTags: (result) =>
                result
                    ? [
                        { type: "Quizzes", id: "LIST" },
                        ...result.map((q) => ({ type: "Quiz", id: q.id })),
                    ]
                    : [{ type: "Quizzes", id: "LIST" }],
        }),

        getQuizById: builder.query({
            queryFn: async (id) => ({ data: await getQuiz(id) }),
            providesTags: (r, e, id) => [{ type: "Quiz", id }],
        }),

        createQuiz: builder.mutation({
            queryFn: async (session) => ({ data: await saveQuiz(session) }),
            invalidatesTags: [{ type: "Quizzes", id: "LIST" }],
        }),

        updateQuiz: builder.mutation({
            queryFn: async ({ id, patch }) => {
                const current = await getQuiz(id);
                if (!current) return { error: { message: "Quiz not found" } };
                const next = { ...current, ...patch, updatedAt: Date.now() };
                return { data: await saveQuiz(next) };
            },
            invalidatesTags: (r, e, arg) => [{ type: "Quiz", id: arg.id }],
        }),

        deleteQuiz: builder.mutation({
            queryFn: async (id) => ({ data: await deleteQuiz(id) }),
            invalidatesTags: [{ type: "Quizzes", id: "LIST" }],
        }),
    }),
});

export const {
    useGetQuizzesQuery,
    useGetQuizByIdQuery,
    useCreateQuizMutation,
    useUpdateQuizMutation,
    useDeleteQuizMutation,
} = quizzesApi;
