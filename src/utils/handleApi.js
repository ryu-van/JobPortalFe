const handleApi = async (apiCall) => {
    try {
    const res = await apiCall();

    return res?.data ?? null;

  } catch (error) {
    return Promise.reject(error);
  }
}
export default handleApi;
