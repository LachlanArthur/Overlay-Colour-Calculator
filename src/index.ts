import Alpine from 'alpinejs';

type RgbaArray = [ number, number, number, number ];

document.addEventListener( 'DOMContentLoaded', () => {
	Alpine.start();
} );

document.addEventListener( 'alpine:init', () => {

	Alpine.data( 'colourCalculator', () => ( {
		final: '#bed6c6',
		background: '#ebebeb',
		candidates: [] as RgbaArray[],

		init() {
			this.$watch( 'final', () => this.buildCandidates() );
			this.$watch( 'background', () => this.buildCandidates() );

			this.buildCandidates();
		},

		buildCandidates() {
			this.candidates = this.findOverlayCandidates( this.background, this.final );
		},

		hex2rgba( colour: string ): RgbaArray {
			colour = colour.replace( '#', '' );
			switch ( colour.length ) {
				default:
					throw new Error( 'Invalid colour' );
				case 3:
					colour += 'f';
				// fallthrough
				case 4:
					colour = colour.replace( /(\d)(\d)(\d)(\d)/, '$1$1$2$2$3$3$4$4' );
					break;
				case 6:
					colour += 'ff';
				// fallthrough
				case 8:
					// do nothing
					break;
			}
			return colour.match( /.{2}/g )!
				.map( hex => parseInt( hex, 16 ) ) as RgbaArray;
		},

		clampRgb( value: number ) {
			return Math.min( Math.max( 0, value ), 255 );
		},

		rgba2hex( rgba: RgbaArray ): string {
			return '#' + rgba.map( decimal => {
				decimal = Math.round( this.clampRgb( decimal ) );
				return ( decimal < 16 ? '0' : '' ) + decimal.toString( 16 );
			} ).join( '' );
		},

		calcOverlay( background: RgbaArray, final: RgbaArray, alpha: number ): RgbaArray {
			const a1 = alpha;
			const [ r2, g2, b2 ] = background;
			const [ r3, g3, b3 ] = final;

			const r1 = ( r3 - r2 + r2 * a1 ) / a1;
			const g1 = ( g3 - g2 + g2 * a1 ) / a1;
			const b1 = ( b3 - b2 + b2 * a1 ) / a1;

			return [ r1, g1, b1, a1 ];

		},

		findOverlayCandidates( background: string | RgbaArray, final: string | RgbaArray, alphaInterval = 0.1 ) {
			if ( typeof background === 'string' ) {
				background = this.hex2rgba( background );
			}
			if ( typeof final === 'string' ) {
				final = this.hex2rgba( final );
			}
			const overlays = [];
			for ( let alpha = alphaInterval; alpha < 1; alpha = this.round( alpha + alphaInterval, 4 ) ) {
				const overlay = this.calcOverlay( background, final, alpha );
				if ( !isFinite( overlay[ 0 ] ) || !isFinite( overlay[ 1 ] ) || !isFinite( overlay[ 2 ] ) ) {
					continue;
				}
				overlays.push( overlay );
			}
			return overlays;
		},

		checkColour( [ r, g, b ]: RgbaArray ) {
			return r >= 0 && g >= 0 && b >= 0 && r <= 255 && g <= 255 && b <= 255;
		},

		rgba2css( rgba: RgbaArray ) {
			const [ r, g, b, a ] = rgba.map( this.clampRgb );
			return `rgba( ${r.toFixed( 2 )}, ${g.toFixed( 2 )}, ${b.toFixed( 2 )}, ${a.toFixed( 2 )} )`;
		},

		gamutWarning( rgba: RgbaArray ) {
			return this.checkColour( rgba ) ? '' : '💥 Clamped, out of gamut!';
		},

		round( value: number, precision: number ) {
			const muliplier = 10 ** precision;
			return Math.round( value * muliplier ) / muliplier;
		},

	} ) );

} );
