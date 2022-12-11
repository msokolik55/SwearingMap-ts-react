export interface ICountry {
	region: string;
	words?: string[];
}

// export interface ICountry {
// 	AFG: Country;
// 	ALA: Country;
// 	ALB: Country;
// 	DZA: Country;
// 	ASM: Country;
// 	AND: Country;
// 	AGO: Country;
// 	AIA: Country;
// 	ATA: Country;
// 	ATG: Country;
// 	ARG: Country;
// 	ARM: Country;
// 	ABW: Country;
// 	AUS: Country;
// 	AUT: Country;
// 	AZE: Country;
// 	BHS: Country;
// 	BHR: Country;
// 	BGD: Country;
// 	BRB: Country;
// 	BLR: Country;
// 	BEL: Country;
// 	BLZ: Country;
// 	BEN: Country;
// 	BMU: Country;
// 	BTN: Country;
// 	BOL: Country;
// 	BES: Country;
// 	BIH: Country;
// 	BWA: Country;
// 	BVT: Country;
// 	BRA: Country;
// 	IOT: Country;
// 	BRN: Country;
// 	BGR: Country;
// 	BFA: Country;
// 	BDI: Country;
// 	CPV: Country;
// 	KHM: Country;
// 	CMR: Country;
// 	CAN: Country;
// 	CYM: Country;
// 	CAF: Country;
// 	TCD: Country;
// 	CHL: Country;
// 	CHN: Country;
// 	CXR: Country;
// 	CCK: Country;
// 	COL: Country;
// 	COM: Country;
// 	COG: Country;
// 	COD: Country;
// 	COK: Country;
// 	CRI: Country;
// 	CIV: Country;
// 	HRV: Country;
// 	CUB: Country;
// 	CUW: Country;
// 	CYP: Country;
// 	CZE: Country;
// 	DNK: Country;
// 	DJI: Country;
// 	DMA: Country;
// 	DOM: Country;
// 	ECU: Country;
// 	EGY: Country;
// 	SLV: Country;
// 	GNQ: Country;
// 	ERI: Country;
// 	EST: Country;
// 	SWZ: Country;
// 	ETH: Country;
// 	FLK: Country;
// 	FRO: Country;
// 	FJI: Country;
// 	FIN: Country;
// 	FRA: Country;
// 	GUF: Country;
// 	PYF: Country;
// 	ATF: Country;
// 	GAB: Country;
// 	GMB: Country;
// 	GEO: Country;
// 	DEU: Country;
// 	GHA: Country;
// 	GIB: Country;
// 	GRC: Country;
// 	GRL: Country;
// 	GRD: Country;
// 	GLP: Country;
// 	GUM: Country;
// 	GTM: Country;
// 	GGY: Country;
// 	GIN: Country;
// 	GNB: Country;
// 	GUY: Country;
// 	HTI: Country;
// 	HMD: Country;
// 	VAT: Country;
// 	HND: Country;
// 	HKG: Country;
// 	HUN: Country;
// 	ISL: Country;
// 	IND: Country;
// 	IDN: Country;
// 	IRN: Country;
// 	IRQ: Country;
// 	IRL: Country;
// 	IMN: Country;
// 	ISR: Country;
// 	ITA: Country;
// 	JAM: Country;
// 	JPN: Country;
// 	JEY: Country;
// 	JOR: Country;
// 	KAZ: Country;
// 	KEN: Country;
// 	KIR: Country;
// 	PRK: Country;
// 	KOR: Country;
// 	KWT: Country;
// 	KGZ: Country;
// 	LAO: Country;
// 	LVA: Country;
// 	LBN: Country;
// 	LSO: Country;
// 	LBR: Country;
// 	LBY: Country;
// 	LIE: Country;
// 	LTU: Country;
// 	LUX: Country;
// 	MAC: Country;
// 	MDG: Country;
// 	MWI: Country;
// 	MYS: Country;
// 	MDV: Country;
// 	MLI: Country;
// 	MLT: Country;
// 	MHL: Country;
// 	MTQ: Country;
// 	MRT: Country;
// 	MUS: Country;
// 	MYT: Country;
// 	MEX: Country;
// 	FSM: Country;
// 	MDA: Country;
// 	MCO: Country;
// 	MNG: Country;
// 	MNE: Country;
// 	MSR: Country;
// 	MAR: Country;
// 	MOZ: Country;
// 	MMR: Country;
// 	NAM: Country;
// 	NRU: Country;
// 	NPL: Country;
// 	NLD: Country;
// 	NCL: Country;
// 	NZL: Country;
// 	NIC: Country;
// 	NER: Country;
// 	NGA: Country;
// 	NIU: Country;
// 	NFK: Country;
// 	MKD: Country;
// 	MNP: Country;
// 	NOR: Country;
// 	OMN: Country;
// 	PAK: Country;
// 	PLW: Country;
// 	PSE: Country;
// 	PAN: Country;
// 	PNG: Country;
// 	PRY: Country;
// 	PER: Country;
// 	PHL: Country;
// 	PCN: Country;
// 	POL: Country;
// 	PRT: Country;
// 	PRI: Country;
// 	QAT: Country;
// 	REU: Country;
// 	ROU: Country;
// 	RUS: Country;
// 	RWA: Country;
// 	BLM: Country;
// 	SHN: Country;
// 	KNA: Country;
// 	LCA: Country;
// 	MAF: Country;
// 	SPM: Country;
// 	VCT: Country;
// 	WSM: Country;
// 	SMR: Country;
// 	STP: Country;
// 	SAU: Country;
// 	SEN: Country;
// 	SRB: Country;
// 	SYC: Country;
// 	SLE: Country;
// 	SGP: Country;
// 	SXM: Country;
// 	SVK: Country;
// 	SVN: Country;
// 	SLB: Country;
// 	SOM: Country;
// 	ZAF: Country;
// 	SGS: Country;
// 	SSD: Country;
// 	ESP: Country;
// 	LKA: Country;
// 	SDN: Country;
// 	SUR: Country;
// 	SJM: Country;
// 	SWE: Country;
// 	CHE: Country;
// 	SYR: Country;
// 	TWN: Country;
// 	TJK: Country;
// 	TZA: Country;
// 	THA: Country;
// 	TLS: Country;
// 	TGO: Country;
// 	TKL: Country;
// 	TON: Country;
// 	TTO: Country;
// 	TUN: Country;
// 	TUR: Country;
// 	TKM: Country;
// 	TCA: Country;
// 	TUV: Country;
// 	UGA: Country;
// 	UKR: Country;
// 	ARE: Country;
// 	GBR: Country;
// 	USA: Country;
// 	UMI: Country;
// 	URY: Country;
// 	UZB: Country;
// 	VUT: Country;
// 	VEN: Country;
// 	VNM: Country;
// 	VGB: Country;
// 	VIR: Country;
// 	WLF: Country;
// 	ESH: Country;
// 	YEM: Country;
// 	ZMB: Country;
// 	ZWE: Country;
// }
