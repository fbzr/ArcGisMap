import {combineReducers} from '@reduxjs/toolkit';
import mapReducer from './slices/map';

const rootReducer = combineReducers({
  map: mapReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
