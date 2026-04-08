import categoryApi from "../api/categoryApi";
import handleApi from "../utils/handleApi";
const categoryService = {
    getCategories: ({
        keyword
    }) => handleApi(() => categoryApi.getCategories({ keyword })),
    getCategoryDetail: (id) => handleApi(() => categoryApi.getCategoryDetail(id)),
    createCategory: (data) => handleApi(() => categoryApi.createCategory(data)),
    updateCategory: (id, data) => handleApi(() => categoryApi.updateCategory(id, data)),
    deleteCategory: (id) => handleApi(() => categoryApi.deleteCategory(id))

};
export default categoryService
