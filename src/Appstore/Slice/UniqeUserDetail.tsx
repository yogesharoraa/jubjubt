import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface UserState {
    User_id: number | null
    blocked_by_admin:boolean

}

const initialState: UserState = {
    User_id: null,
    blocked_by_admin: false, // default value added
}

const UniqeUserDetail = createSlice({
    name: 'UniqeUserDetail',
    initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<UserState>) => {
            return { ...state, ...action.payload }
        },
        clearAdminData: () => initialState,
    },
})

export const { setUserData, clearAdminData } = UniqeUserDetail.actions
export default UniqeUserDetail.reducer
