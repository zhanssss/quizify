import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { listThreads, getThread, saveThread, deleteThread } from "./aiStorage.js";
import { generateQuestionsFromTextMock } from "../../..//lib/aiMock.js";

export const aiApi = createApi({
    reducerPath: "aiApi",
    baseQuery: fakeBaseQuery(),
    tagTypes: ["AIThreads", "AIThread"],
    endpoints: (builder) => ({
        listThreads: builder.query({
            queryFn: async () => ({ data: await listThreads() }),
            providesTags: (result) =>
                result
                    ? [{ type: "AIThreads", id: "LIST" }, ...result.map((t) => ({ type: "AIThread", id: t.id }))]
                    : [{ type: "AIThreads", id: "LIST" }],
        }),

        getThreadById: builder.query({
            queryFn: async (id) => ({ data: await getThread(id) }),
            providesTags: (r, e, id) => [{ type: "AIThread", id }],
        }),

        saveThread: builder.mutation({
            queryFn: async (thread) => ({ data: await saveThread(thread) }),
            invalidatesTags: [{ type: "AIThreads", id: "LIST" }],
        }),

        deleteThread: builder.mutation({
            queryFn: async (id) => ({ data: await deleteThread(id) }),
            invalidatesTags: [{ type: "AIThreads", id: "LIST" }],
        }),

        /**
         * ВАЖНО: это НЕ создаёт квиз — только генерирует "parsedQuestions".
         * Сохранение квиза — через quizzesApi.createQuiz (чтобы не смешивать слои).
         */
        generateQuestionsMock: builder.mutation({
            // arg: { text, count }
            queryFn: async ({ text, count }) => {
                const parsedQuestions = generateQuestionsFromTextMock({ text, count });
                return { data: { parsedQuestions } };
            },
        }),
    }),
});

export const {
    useListThreadsQuery,
    useGetThreadByIdQuery,
    useSaveThreadMutation,
    useDeleteThreadMutation,
    useGenerateQuestionsMockMutation,
} = aiApi;
