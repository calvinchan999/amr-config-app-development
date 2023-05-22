import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createStore } from "redux";
import { Provider } from "react-redux";
import rootReducer from "./reducers";
import "./index.css";
// import "./global.css";
// import 'bootstrap/dist/css/bootstrap.min.css';

const store = createStore(rootReducer);

const getConfig = async () => {
  const res = await fetch("/config/app-config.json");
  const data = await res.json();
  return data;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
getConfig().then((config) => {
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App config={config} />
      </Provider>
    </React.StrictMode>
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
