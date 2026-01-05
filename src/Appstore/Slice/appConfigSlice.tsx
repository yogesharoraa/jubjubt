import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DashBoardSettingValues } from '../../Types/Types';

interface AppConfigState {
  config: DashBoardSettingValues | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppConfigState = {
  config: null,
  loading: false,
  error: null,
};

const appConfigSlice = createSlice({
  name: 'appConfig',
  initialState,
  reducers: {
    setAppConfig(state, action: PayloadAction<DashBoardSettingValues>) {
      state.config = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setAppConfig,
} = appConfigSlice.actions;

export default appConfigSlice.reducer;
