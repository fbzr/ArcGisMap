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
    setTimeExtent: (state, action: PayloadAction<{start: Date, end: Date}>) => {
      state.timeExtent.startDate = action.payload.start;
      state.timeExtent.endDate = action.payload.end;
    }
  },
});

export const {
  setMapLoaded,
  setSelectedZipCode,
  setTimeExtent
} = mapSlice.actions;

export const mapLoaded = (state: RootState) => state.map.mapLoaded;
export const selectedZipCode = (state: RootState) => state.map.selectedZipCode;
export const timeExtent = (state: RootState) => state.map.timeExtent;

export default mapSlice.reducer;
