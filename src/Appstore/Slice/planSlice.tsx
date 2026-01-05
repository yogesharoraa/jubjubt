import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Plan {
  plan_id: number;
  plan_name: string;
  coins: number;
  corresponding_money: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  status: boolean;
  transaction_type: string;
}

interface PlanState {
  plan: Plan | null;
}

const initialState: PlanState = {
  plan: null,
};

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    fetchPlanSuccess(state, action: PayloadAction<Plan>) {
      state.plan = action.payload;
    },
  },
});

export const { fetchPlanSuccess } = planSlice.actions;
export default planSlice.reducer;
