import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name : "user",
    initialState: {
        // username: "",
        nameuser:"",
        emailuser:"",
        tokenuser:"",
        tokenexpire:0
    },
    reducers: {
        update: (state, action) => {
            // state.username = action.payload.username;
            state.nameuser = action.payload.nameuser;
            state.emailuser = action.payload.emailuser;
            state.tokenuser = action.payload.tokenuser;
            state.tokenexpire = action.payload.tokenexpire;
        }
    }
});

export const { update } = userSlice.actions;
export default userSlice.reducer;