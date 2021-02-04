import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {RootState} from '../store';
interface SliceState {
  mapLoaded: boolean;
  selectedZipCode: string | undefined;
  timeExtent: {
    startDate: Date | undefined,
    endDate: Date | undefined,
  }
}

const initialState: SliceState = {
  mapLoaded: false,
  selectedZipCode: undefined,
  timeExtent: {
    startDate: undefined,
    endDate: undefined
  }
};

export const mapSlice = createSlice({
  name: 'mapSlice',
  initialState,
  reducers: {
    setMapLoaded: (state, action: PayloadAction<boolean>) => {
      state.mapLoaded = action.payload;
    },
    setSelectedZipCode: (state, action: PayloadAction<string | undefined>) => {
      state.selectedZipCode = action.payload;
    },
    setStartDate: (state, action: PayloadAction<Date | undefined>) => {
      state.timeExtent.startDate = action.payload;
    },
    setEndDate: (state, action: PayloadAction<Date>) => {
      state.timeExtent.endDate = action.payload;
    }
  },
});

export const {
  setMapLoaded,
  setSelectedZipCode,
  setStartDate,
  setEndDate
} = mapSlice.actions;

export const mapLoaded = (state: RootState) => state.map.mapLoaded;
export const selectedZipCode = (state: RootState) => state.map.selectedZipCode;
export const startDate = (state: RootState) => state.map.timeExtent.startDate;
export const endDate = (state: RootState) => state.map.timeExtent.endDate;

export default mapSlice.reducer;
