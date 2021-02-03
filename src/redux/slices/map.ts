import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {RootState} from '../store';
interface SliceState {
  mapLoaded: boolean;
  selectedZipCode: string | undefined;
}

const initialState: SliceState = {
  mapLoaded: false,
  selectedZipCode: undefined,
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
  },
});

export const {
  setMapLoaded,
  setSelectedZipCode
} = mapSlice.actions;

export const mapLoaded = (state: RootState) => state.map.mapLoaded;
export const selectedZipCode = (state: RootState) => state.map.selectedZipCode;

export default mapSlice.reducer;
