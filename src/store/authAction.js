import { loginSuccess,logout} from "./userSlice";
import authService from "../services/authService";
export const fetchCurrentUser = () => async (dispatch) => {
    try{
        const res = await authService.getCurrentUser();
        console.log("fetchCurrentUser result:", res);
        dispatch(loginSuccess({ user: res }));
    }catch(err){
        console.error(err);
        dispatch(logout());
    }
};
