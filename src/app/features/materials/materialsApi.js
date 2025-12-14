import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    listMaterials,
    saveLecture,
    uploadFileAsMaterial,
    deleteMaterial,
    getFileById,
} from "./materialsStorage.js";

export const materialsApi = createApi({
    reducerPath: "materialsApi",
    baseQuery: fakeBaseQuery(),
    tagTypes: ["Materials", "Material", "File"],
    endpoints: (builder) => ({
        listMaterials: builder.query({
            queryFn: async () => ({ data: await listMaterials() }),
            providesTags: (result) =>
                result
                    ? [
                        { type: "Materials", id: "LIST" },
                        ...result.map((m) => ({ type: "Material", id: m.id })),
                    ]
                    : [{ type: "Materials", id: "LIST" }],
        }),

        saveLecture: builder.mutation({
            // arg: { id, title, lectureText }
            queryFn: async (arg) => ({ data: await saveLecture(arg) }),
            invalidatesTags: [{ type: "Materials", id: "LIST" }],
        }),

        uploadFile: builder.mutation({
            // arg: { id, title, file: File }
            queryFn: async (arg) => ({ data: await uploadFileAsMaterial(arg) }),
            invalidatesTags: [{ type: "Materials", id: "LIST" }],
        }),

        deleteMaterial: builder.mutation({
            queryFn: async (id) => ({ data: await deleteMaterial(id) }),
            invalidatesTags: [{ type: "Materials", id: "LIST" }],
        }),

        getFileById: builder.query({
            queryFn: async (fileId) => ({ data: await getFileById(fileId) }),
            providesTags: (r, e, fileId) => [{ type: "File", id: fileId }],
        }),
    }),
});

export const {
    useListMaterialsQuery,
    useSaveLectureMutation,
    useUploadFileMutation,
    useDeleteMaterialMutation,
    useLazyGetFileByIdQuery,
} = materialsApi;
