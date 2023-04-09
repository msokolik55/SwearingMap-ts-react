import {
	printNewBorders,
	printCountriesJSON,
	printCountriesKeep,
} from "./assets/merging";
import Map from "./components/Map";

function App() {
	printNewBorders();
	return <Map />;
}

export default App;
