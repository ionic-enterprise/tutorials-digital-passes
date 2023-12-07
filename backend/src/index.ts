import { PKPass } from "passkit-generator";
import { Buffer } from "node:buffer";

/** Assets are handled by Wrangler by specifying the rule inside wrangler.toml */
import icon from "../models/icon.png";
import icon2x from "../models/icon@2x.png";
import footer from "../models/footer.png";
import footer2x from "../models/footer@2x.png";
import background2x from "../models/background@2x.png";

export interface Env {
	/**
	 * "var" (instead of let and cost) is required here
	 * to make typescript mark that these global variables
	 * are available also in globalThis.
	 *
	 * These are secrets we have defined through `wrangler secret put <var name>`.
	 * @see https://developers.cloudflare.com/workers/platform/environment-variables
	 */

	WWDR: string;
	/** Pass signerCert */
	SIGNER_CERT: string;
	/** Pass signerKey */
	SIGNER_KEY: string;
	SIGNER_PASSPHRASE: string;
}

/**
 * Request entry point
 */

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		if (request.method == 'OPTIONS') {
			return handleOptions(request);
		}
		return generatePass(env);
	},
};

async function generatePass(env: Env) {
	console.log(`Generating pass`);
	const pass = new PKPass(
		{
			"icon.png": Buffer.from(icon),
			"icon@2x.png": Buffer.from(icon2x),
			"footer.png": Buffer.from(footer),
			"footer@2x.png": Buffer.from(footer2x),
			"background@2x.png": Buffer.from(background2x),
		},
		{
			signerCert: env.SIGNER_CERT,
			signerKey: env.SIGNER_KEY,
			signerKeyPassphrase: env.SIGNER_PASSPHRASE,
			wwdr: env.WWDR,
		},
		{
			description: "Ionic Pass",
			serialNumber: "81592CQ7838",
			passTypeIdentifier: "pass.io.ionic.example",
			teamIdentifier: "N3B3WKDZND",
			organizationName: "Apple Inc.",
			foregroundColor: "rgb(255, 255, 255)",
			backgroundColor: "rgb(60, 65, 76)",
		},
	);

	pass.setBarcodes("1276451828321");
	pass.type = "boardingPass";
	pass.transitType = "PKTransitTypeAir";

	pass.headerFields.push(
		{
			key: "header1",
			label: "Date",
			value: "14th Nov",
			textAlignment: "PKTextAlignmentCenter",
		},
		{
			key: "header2",
			label: "UID",
			value: "EZY997",
			textAlignment: "PKTextAlignmentCenter",
		},
	);

	pass.primaryFields.push(
		{
			key: "IATA-source",
			value: "LAS",
			label: "Las Vegas",
			textAlignment: "PKTextAlignmentLeft",
		},
		{
			key: "IATA-destination",
			value: "LAX",
			label: "Los Angeles",
			textAlignment: "PKTextAlignmentRight",
		},
	);

	pass.secondaryFields.push(
		{
			key: "secondary1",
			label: "Boarding",
			value: "18:40",
			textAlignment: "PKTextAlignmentCenter",
		},
		{
			key: "sec2",
			label: "Departing",
			value: "19:10",
			textAlignment: "PKTextAlignmentCenter",
		},
		{
			key: "sec3",
			label: "Group",
			value: "A",
			textAlignment: "PKTextAlignmentCenter",
		},
		{
			key: "sec4",
			label: "Special",
			value: "1 Carry On",
			textAlignment: "PKTextAlignmentCenter",
		},
	);

	pass.auxiliaryFields.push(
		{
			key: "aux1",
			label: "Passenger",
			value: "John Smith",
			textAlignment: "PKTextAlignmentLeft",
		},
		{
			key: "aux2",
			label: "Seat",
			value: "1A",
			textAlignment: "PKTextAlignmentCenter",
		},
	);

	pass.backFields.push(
		{
			key: "document number",
			label: "Numero documento:",
			value: "- -",
			textAlignment: "PKTextAlignmentLeft",
		},
		{
			key: "You're checked in, what next",
			label: "Hai effettuato il check-in, Quali sono le prospettive",
			value: "",
			textAlignment: "PKTextAlignmentLeft",
		},
		{
			key: "Check In",
			label: "1. check-in✓",
			value: "",
			textAlignment: "PKTextAlignmentLeft",
		},
		{
			key: "checkIn",
			label: "",
			value: "Le uscite d'imbarco chiudono 30 minuti prima della partenza, quindi sii puntuale. In questo aeroporto puoi utilizzare la corsia Fast Track ai varchi di sicurezza.",
			textAlignment: "PKTextAlignmentLeft",
		},
		{
			key: "2. Bags",
			label: "2. Bagaglio",
			value: "",
			textAlignment: "PKTextAlignmentLeft",
		},
		{
			key: "Require special assistance",
			label: "Assistenza speciale",
			value: "Se hai richiesto assistenza speciale, presentati a un membro del personale nell'area di Consegna bagagli almeno 90 minuti prima del volo.",
			textAlignment: "PKTextAlignmentLeft",
		},
		{
			key: "3. Departures",
			label: "3. Partenze",
			value: "",
			textAlignment: "PKTextAlignmentLeft",
		},
		{
			key: "photoId",
			label: "Un documento d’identità corredato di fotografia",
			value: "è obbligatorio su TUTTI i voli. Per un viaggio internazionale è necessario un passaporto valido o, dove consentita, una carta d’identità.",
			textAlignment: "PKTextAlignmentLeft",
		},
		{
			key: "yourSeat",
			label: "Il tuo posto:",
			value: "verifica il tuo numero di posto nella parte superiore. Durante l’imbarco utilizza le scale anteriori e posteriori: per le file 1-10 imbarcati dalla parte anteriore; per le file 11-31 imbarcati dalla parte posteriore. Colloca le borse di dimensioni ridotte sotto il sedile davanti a te.",
			textAlignment: "PKTextAlignmentLeft",
		},
		{
			key: "Pack safely",
			label: "Bagaglio sicuro",
			value: "Fai clic http://easyjet.com/it/articoli-pericolosi per maggiori informazioni sulle merci pericolose oppure visita il sito CAA http://www.caa.co.uk/default.aspx?catid=2200",
			textAlignment: "PKTextAlignmentLeft",
		},
		{
			key: "Thank you for travelling easyJet",
			label: "Grazie per aver viaggiato con easyJet",
			value: "",
			textAlignment: "PKTextAlignmentLeft",
		},
	);

	console.log(`Returning pass object`);
	return new Response(pass.getAsBuffer(), {
		headers: {
			"Content-type": pass.mimeType,
			"Content-disposition": `attachment; filename=myPass.pkpass`,
			...corsHeaders()
		},
	});
}

function handleOptions(request: Request): Response {
	const origin = request.headers.get('Referer')!;
	return new Response('OK', {
		headers:
		{
			...corsHeaders()
		}
	});
}

function corsHeaders(): any {
	return {
		'Access-Control-Allow-Origin': "*",
		"Access-Control-Allow-Methods": "GET,HEAD,POST,DELETE,OPTIONS",
		"Access-Control-Allow-Headers": "*",
		"Access-Control-Max-Age": "86400",
	};
}
