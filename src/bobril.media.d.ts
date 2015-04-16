declare const enum BobrilDeviceCategory {
    Mobile = 0,
    Tablet = 1,
    Desktop = 2,
    LargeDesktop = 3
}

interface IBobrilMedia {
	width: number;
	height: number;
	orientation: number;
	deviceCategory: BobrilDeviceCategory;
	portrait: boolean;
}

interface IBobrilStatic {
	getMedia?(): IBobrilMedia;
	// optionaly set new device breakpoints, always return current device breakpoints 
	accDeviceBreaks?(newBreaks?: number[][]): number[][];
}
