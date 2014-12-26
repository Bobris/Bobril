interface IBobrilMedia {
	width: number;
	height: number;
	orientation: number;
	// 0-mobile 1-tablet 2-desktop 3-large desktop
	deviceCategory: number;
	portrait: boolean;
}

interface IBobrilStatic {
	getMedia?(): IBobrilMedia;
	// optionaly set new device breakpoints, always return current device breakpoints 
	accDeviceBreaks?(newBreaks?: number[][]): number[][];
}
