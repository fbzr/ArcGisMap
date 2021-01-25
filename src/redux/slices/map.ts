import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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

export default mapSlice.reducer;
