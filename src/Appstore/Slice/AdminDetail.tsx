import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface AdminState {
  admin_id: number | null
  email: string
  full_name: string
  first_name: string
  last_name: string
  profile_pic: string
  country: string
  mobile_number: string
  gender: string
  dob: string
  country_short_name: string
}

const initialState: AdminState = {
  admin_id: null,
  email: '',
  full_name: '',
  first_name: '',
  last_name: '',
  profile_pic: '',
  country: '',
  mobile_number: '',
  gender: '',
  dob: '',
  country_short_name: '',
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminData: (state, action: PayloadAction<AdminState>) => {
      return { ...state, ...action.payload }
    },
    clearAdminData: () => initialState,
  },
})

export const { setAdminData, clearAdminData } = adminSlice.actions
export default adminSlice.reducer
