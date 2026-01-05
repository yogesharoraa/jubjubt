import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    country_code: "",         // e.g. +91
    mobile_num: "",           // e.g. 9876543210
    country: "",              // e.g. India
    country_short_name: "",   // e.g. IN
    username: "",
    isUsernameAvailable: null,
    status: null,
    duration: "",
    gender: "",
};

const addVendorSlice = createSlice({
    name: 'addVendor',
    initialState,
    reducers: {
        // ✅ Updated to store all country-related fields
        setPhoneNumber: (state, action) => {
            state.country_code = action.payload.country_code || "";
            state.mobile_num = action.payload.mobile_num || "";
            state.country = action.payload.country || "";
            state.country_short_name = action.payload.country_short_name || "";
        },

        setUsername: (state, action) => {
            state.username = action.payload;
        },

        setUsernameAvailability: (state, action) => {
            state.isUsernameAvailable = action.payload;
        },

        setStatus: (state, action) => {
            state.status = action.payload;
        },

        setDuration: (state, action) => {
            state.duration = action.payload;
        },

        setGender: (state, action) => {
            state.gender = action.payload;
        },

        resetall: (state) => {
            state.country_code = "";
            state.mobile_num = "";
            state.country = "";
            state.country_short_name = "";
            state.username = "";
            state.isUsernameAvailable = null;
            state.status = null;
            state.duration = "";
            state.gender = "";
        },
    },
});

export const {
    setPhoneNumber,
    setUsername,
    setUsernameAvailability,
    setStatus,
    resetall,
    setDuration,
    setGender,
} = addVendorSlice.actions;

export default addVendorSlice.reducer;
