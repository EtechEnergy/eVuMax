import { createStore, applyMiddleware } from "redux";
import thunk, { ThunkMiddleware } from "redux-thunk";
import { AppActions } from "../actions/appActions";
import { rootReducer } from "../reducers/rootReducer";
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';




const persistConfig = {
    key: 'root',
    storage,
}



export type AppState = ReturnType<typeof rootReducer>
const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = createStore(persistedReducer, composeWithDevTools(applyMiddleware(thunk as ThunkMiddleware<AppState, AppActions>)));
export const persistor = persistStore(store);

