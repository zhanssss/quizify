import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { getActiveBank, saveBank } from "./banksStorage.js";

export const banksApi = createApi({
    reducerPath: "banksApi",
    baseQuery: fakeBaseQuery(),
    tagTypes: ["Bank"],
    endpoints: (builder) => ({
        getActiveBank: builder.query({
            queryFn: async () => {
                const bank = await getActiveBank();
                return { data: bank };
            },
            providesTags: ["Bank"],
        }),

        saveActiveBank: builder.mutation({
            // payload: { bank }
            queryFn: async (payload) => {
                const saved = await saveBank(payload);
                return { data: saved };
            },
            invalidatesTags: ["Bank"],
        }),
    }),
});

export const { useGetActiveBankQuery, useSaveActiveBankMutation } = banksApi;
