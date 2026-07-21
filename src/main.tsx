import React from "react";
import ReactDOM from "react-dom/client";
import { RecoilRoot } from "recoil";
import "leaflet/dist/leaflet.css";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<RecoilRoot>
			<App />
		</RecoilRoot>
	</React.StrictMode>
);
