// Database esteso dei comuni italiani (Capoluoghi di provincia e principali città)
export interface ComuneItem {
  nome: string;
  provincia: string;
  cap: string;
  codiceCatastale: string;
}

export const COMUNI_PRINCIPALI: ComuneItem[] = [
  // Grandi Metropoli
  { nome: 'Roma', provincia: 'RM', cap: '00100', codiceCatastale: 'H501' },
  { nome: 'Milano', provincia: 'MI', cap: '20100', codiceCatastale: 'F205' },
  { nome: 'Napoli', provincia: 'NA', cap: '80100', codiceCatastale: 'F839' },
  { nome: 'Torino', provincia: 'TO', cap: '10100', codiceCatastale: 'L219' },
  { nome: 'Palermo', provincia: 'PA', cap: '90100', codiceCatastale: 'G273' },
  { nome: 'Genova', provincia: 'GE', cap: '16100', codiceCatastale: 'D969' },
  { nome: 'Bologna', provincia: 'BO', cap: '40100', codiceCatastale: 'A944' },
  { nome: 'Firenze', provincia: 'FI', cap: '50100', codiceCatastale: 'D612' },
  { nome: 'Bari', provincia: 'BA', cap: '70100', codiceCatastale: 'A662' },
  { nome: 'Catania', provincia: 'CT', cap: '95100', codiceCatastale: 'C351' },
  { nome: 'Verona', provincia: 'VR', cap: '37100', codiceCatastale: 'L781' },
  { nome: 'Venezia', provincia: 'VE', cap: '30100', codiceCatastale: 'L736' },
  { nome: 'Messina', provincia: 'ME', cap: '98100', codiceCatastale: 'F158' },
  { nome: 'Padova', provincia: 'PD', cap: '35100', codiceCatastale: 'G224' },
  { nome: 'Trieste', provincia: 'TS', cap: '34100', codiceCatastale: 'L424' },
  { nome: 'Brescia', provincia: 'BS', cap: '25100', codiceCatastale: 'B157' },
  { nome: 'Taranto', provincia: 'TA', cap: '74100', codiceCatastale: 'L049' },
  { nome: 'Parma', provincia: 'PR', cap: '43100', codiceCatastale: 'G337' },
  { nome: 'Prato', provincia: 'PO', cap: '59100', codiceCatastale: 'G999' },
  { nome: 'Modena', provincia: 'MO', cap: '41100', codiceCatastale: 'F257' },
  { nome: 'Reggio Calabria', provincia: 'RC', cap: '89100', codiceCatastale: 'H224' },
  { nome: 'Reggio Emilia', provincia: 'RE', cap: '42100', codiceCatastale: 'H223' },
  { nome: 'Perugia', provincia: 'PG', cap: '06100', codiceCatastale: 'G478' },
  { nome: 'Ravenna', provincia: 'RA', cap: '48100', codiceCatastale: 'H199' },
  { nome: 'Livorno', provincia: 'LI', cap: '57100', codiceCatastale: 'E625' },
  { nome: 'Cagliari', provincia: 'CA', cap: '09100', codiceCatastale: 'B354' },
  { nome: 'Foggia', provincia: 'FG', cap: '71100', codiceCatastale: 'D643' },
  { nome: 'Rimini', provincia: 'RN', cap: '47900', codiceCatastale: 'H294' },
  { nome: 'Salerno', provincia: 'SA', cap: '84100', codiceCatastale: 'H703' },
  { nome: 'Ferrara', provincia: 'FE', cap: '44100', codiceCatastale: 'D548' },
  { nome: 'Sassari', provincia: 'SS', cap: '07100', codiceCatastale: 'I452' },
  { nome: 'Latina', provincia: 'LT', cap: '04100', codiceCatastale: 'E472' },
  { nome: 'Giugliano in Campania', provincia: 'NA', cap: '80014', codiceCatastale: 'E054' },
  { nome: 'Monza', provincia: 'MB', cap: '20900', codiceCatastale: 'F704' },
  { nome: 'Siracusa', provincia: 'SR', cap: '96100', codiceCatastale: 'I754' },
  { nome: 'Pescara', provincia: 'PE', cap: '65100', codiceCatastale: 'G482' },
  { nome: 'Bergamo', provincia: 'BG', cap: '24100', codiceCatastale: 'A794' },
  { nome: 'Forlì', provincia: 'FC', cap: '47100', codiceCatastale: 'D704' },
  { nome: 'Trento', provincia: 'TN', cap: '38100', codiceCatastale: 'L378' },
  { nome: 'Vicenza', provincia: 'VI', cap: '36100', codiceCatastale: 'L840' },
  { nome: 'Terni', provincia: 'TR', cap: '05100', codiceCatastale: 'L117' },
  { nome: 'Bolzano', provincia: 'BZ', cap: '39100', codiceCatastale: 'A952' },
  { nome: 'Novara', provincia: 'NO', cap: '28100', codiceCatastale: 'F952' },
  { nome: 'Piacenza', provincia: 'PC', cap: '29100', codiceCatastale: 'G535' },
  { nome: 'Ancona', provincia: 'AN', cap: '60100', codiceCatastale: 'A271' },
  { nome: 'Andria', provincia: 'BT', cap: '76123', codiceCatastale: 'A285' },
  { nome: 'Arezzo', provincia: 'AR', cap: '52100', codiceCatastale: 'A390' },
  { nome: 'Udine', provincia: 'UD', cap: '33100', codiceCatastale: 'L483' },
  { nome: 'Cesena', provincia: 'FC', cap: '47521', codiceCatastale: 'C573' },
  { nome: 'Lecce', provincia: 'LE', cap: '73100', codiceCatastale: 'E506' },
  { nome: 'Pesaro', provincia: 'PU', cap: '61100', codiceCatastale: 'G479' },
  { nome: 'Barletta', provincia: 'BT', cap: '76121', codiceCatastale: 'A669' },
  { nome: 'Alessandria', provincia: 'AL', cap: '15100', codiceCatastale: 'A182' },
  { nome: 'La Spezia', provincia: 'SP', cap: '19100', codiceCatastale: 'E463' },
  { nome: 'Pisa', provincia: 'PI', cap: '56100', codiceCatastale: 'G702' },
  { nome: 'Pistoia', provincia: 'PT', cap: '51100', codiceCatastale: 'G713' },
  { nome: 'Lucca', provincia: 'LU', cap: '55100', codiceCatastale: 'E715' },
  { nome: 'Catanzaro', provincia: 'CZ', cap: '88100', codiceCatastale: 'C352' },
  { nome: 'Treviso', provincia: 'TV', cap: '31100', codiceCatastale: 'L407' },
  { nome: 'Brindisi', provincia: 'BR', cap: '72100', codiceCatastale: 'B180' },
  { nome: 'Como', provincia: 'CO', cap: '22100', codiceCatastale: 'C933' },
  { nome: 'Grosseto', provincia: 'GR', cap: '58100', codiceCatastale: 'E202' },
  { nome: 'Busto Arsizio', provincia: 'VA', cap: '21052', codiceCatastale: 'B300' },
  { nome: 'Varese', provincia: 'VA', cap: '21100', codiceCatastale: 'L682' },
  { nome: 'Sesto San Giovanni', provincia: 'MI', cap: '20099', codiceCatastale: 'I690' },
  { nome: 'Caserta', provincia: 'CE', cap: '81100', codiceCatastale: 'B963' },
  { nome: 'Asti', provincia: 'AT', cap: '14100', codiceCatastale: 'A479' },
  { nome: 'Ragusa', provincia: 'RG', cap: '97100', codiceCatastale: 'H163' },
  { nome: 'Cremona', provincia: 'CR', cap: '26100', codiceCatastale: 'D150' },
  { nome: 'Pavia', provincia: 'PV', cap: '27100', codiceCatastale: 'G388' },
  { nome: 'Trapani', provincia: 'TP', cap: '91100', codiceCatastale: 'L331' },
  { nome: 'Cosenza', provincia: 'CS', cap: '87100', codiceCatastale: 'D086' },
  { nome: 'Caltanissetta', provincia: 'CL', cap: '93100', codiceCatastale: 'B429' },
  { nome: 'Potenza', provincia: 'PZ', cap: '85100', codiceCatastale: 'G942' },
  { nome: 'Matera', provincia: 'MT', cap: '75100', codiceCatastale: 'F052' },
  { nome: 'L’Aquila', provincia: 'AQ', cap: '67100', codiceCatastale: 'A345' },
  { nome: 'Benevento', provincia: 'BN', cap: '82100', codiceCatastale: 'A783' },
  { nome: 'Campobasso', provincia: 'CB', cap: '86100', codiceCatastale: 'B519' },
  { nome: 'Isernia', provincia: 'IS', cap: '86170', codiceCatastale: 'E335' },
  { nome: 'Avellino', provincia: 'AV', cap: '83100', codiceCatastale: 'A509' },
  { nome: 'Chieti', provincia: 'CH', cap: '66100', codiceCatastale: 'C632' },
  { nome: 'Teramo', provincia: 'TE', cap: '64100', codiceCatastale: 'L103' },
  { nome: 'Crotone', provincia: 'KR', cap: '88900', codiceCatastale: 'D122' },
  { nome: 'Vibo Valentia', provincia: 'VV', cap: '89900', codiceCatastale: 'F537' },
  { nome: 'Enna', provincia: 'EN', cap: '94100', codiceCatastale: 'C342' },
  { nome: 'Agrigento', provincia: 'AG', cap: '92100', codiceCatastale: 'A089' },
  { nome: 'Oristano', provincia: 'OR', cap: '09170', codiceCatastale: 'G113' },
  { nome: 'Nuoro', provincia: 'NU', cap: '08100', codiceCatastale: 'F979' },
  { nome: 'Siena', provincia: 'SI', cap: '53100', codiceCatastale: 'I726' },
  { nome: 'Massa', provincia: 'MS', cap: '54100', codiceCatastale: 'F023' },
  { nome: 'Carrara', provincia: 'MS', cap: '54033', codiceCatastale: 'B832' },
  { nome: 'Viterbo', provincia: 'VT', cap: '01100', codiceCatastale: 'M082' },
  { nome: 'Rieti', provincia: 'RI', cap: '02100', codiceCatastale: 'H282' },
  { nome: 'Frosinone', provincia: 'FR', cap: '03100', codiceCatastale: 'D810' },
  { nome: 'Macerata', provincia: 'MC', cap: '62100', codiceCatastale: 'E783' },
  { nome: 'Ascoli Piceno', provincia: 'AP', cap: '63100', codiceCatastale: 'A462' },
  { nome: 'Fermo', provincia: 'FM', cap: '63900', codiceCatastale: 'D542' },
  { nome: 'Rovigo', provincia: 'RO', cap: '45100', codiceCatastale: 'H620' },
  { nome: 'Belluno', provincia: 'BL', cap: '32100', codiceCatastale: 'A757' },
  { nome: 'Pordenone', provincia: 'PN', cap: '33170', codiceCatastale: 'G888' },
  { nome: 'Gorizia', provincia: 'GO', cap: '34170', codiceCatastale: 'E098' },
  { nome: 'Biella', provincia: 'BI', cap: '13900', codiceCatastale: 'A859' },
  { nome: 'Vercelli', provincia: 'VC', cap: '13100', codiceCatastale: 'L750' },
  { nome: 'Cuneo', provincia: 'CN', cap: '12100', codiceCatastale: 'D205' },
  { nome: 'Verbania', provincia: 'VB', cap: '28921', codiceCatastale: 'L746' },
  { nome: 'Aosta', provincia: 'AO', cap: '11100', codiceCatastale: 'A326' },
  { nome: 'Lecco', provincia: 'LC', cap: '23900', codiceCatastale: 'E507' },
  { nome: 'Lodi', provincia: 'LO', cap: '26900', codiceCatastale: 'E648' },
  { nome: 'Sondrio', provincia: 'SO', cap: '23100', codiceCatastale: 'I829' },
  { nome: 'Mantova', provincia: 'MN', cap: '46100', codiceCatastale: 'E897' },
  { nome: 'Imperia', provincia: 'IM', cap: '18100', codiceCatastale: 'E290' },
  { nome: 'Savona', provincia: 'SV', cap: '17100', codiceCatastale: 'I480' }
];

export function findComune(query: string): ComuneItem[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return COMUNI_PRINCIPALI.filter(
    c => c.nome.toLowerCase().includes(q) || c.cap.startsWith(q) || c.provincia.toLowerCase() === q
  );
}

export function findComuneByName(name: string): ComuneItem | undefined {
  if (!name) return undefined;
  const q = name.trim().toLowerCase();
  return COMUNI_PRINCIPALI.find(c => c.nome.toLowerCase() === q);
}

export function getCodiceCatastale(comuneName: string): string | null {
  const match = findComuneByName(comuneName);
  return match ? match.codiceCatastale : null;
}
