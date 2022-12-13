import { atom } from "recoil";
import { ICountry } from "../schema/country";

export const countryAtom = atom<ICountry>({
	key: "country",
	default: undefined,
});
