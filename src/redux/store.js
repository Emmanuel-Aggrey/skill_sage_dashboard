import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  REGISTER,
  PAUSE,
  PERSIST,
  PURGE,
  FLUSH,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./Slice/slice";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = persistReducer(persistConfig, userReducer);

const store = configureStore({
  reducer: { user: rootReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;