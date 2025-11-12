import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authServices from "../../services/authServices";
const initialState = {
  user: null, 
  isAuthenticated: false,
  status: "idle", 
  error: null, 
};

export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      
      const userData = await authServices.getProfile();
      console.log("------User data fetched successfully-------:", userData);
      return userData.user; 
    } catch (error) {
      console.error(
      "Error fetching user data:",
        error.response?.data || error.message
      );
      return rejectWithValue(error.response?.data || error.message); 
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      
      state.user = action.payload; 
      state.isAuthenticated = true;
      
    },
    clearUser: (state) => {
      state.user = null; 
      state.isAuthenticated = false;
      
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
        
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload; 
        state.isAuthenticated = true;
       
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        console.error("Error setting user data in state:", action.payload);
      });
  },
});


export const { setUser, clearUser } = userSlice.actions;
export const selectUser = (state) => {
  console.log("select user called", state.user);
  return state.user.user;
};
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;

export default userSlice.reducer;
