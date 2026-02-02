import axiosClient from "./axiosClient";
const categoryApi = {
    getCategories:({
        keyword
    }) =>{
        return axiosClient.get("/categories",{
            params:{keyword}
        })
    },
    getCategoryDetail:(id)=>{
        return axiosClient.get(`/categories/${id}`)
    },
    createCategory:(data)=>{
        return axiosClient.post("/categories",data)
    },
    updateCategory:(id,data)=>{
        return axiosClient.put(`/categories/${id}`,data)
    },
    deleteCategory:(id)=>{
        return axiosClient.delete(`/categories/${id}`)
    }
};
export default categoryApi;