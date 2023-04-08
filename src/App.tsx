import { printCountriesJSON, printCountriesKeep } from "./assets/merging";
import Map from "./components/Map";

function App() {
	printCountriesKeep();
	printCountriesJSON(false);
	return <Map />;
}

export default App;
