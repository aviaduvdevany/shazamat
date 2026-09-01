import type { ContentPack } from "../schema/pack";
import { members } from "./members";
import { stats } from "./stats";
import { stages } from "./stages";
import { spriteCatalog } from "./sprites";
import { sfxCatalog } from "./sfx";

// ── Childhood ────────────────────────────────────────────────
import { kookilidaEvent } from "./events/childhood/kookilida";
import { olaEvent } from "./events/childhood/ola";

// ── School ───────────────────────────────────────────────────
import { haverMeviHaverEvent } from "./events/school/haver-mevi-haver";
import { hayomAniLoEvent } from "./events/school/hayom-ani-lo";
import { tahushatBetenEvent } from "./events/school/tahushat-beten";
import { shevaLevAdomEvent } from "./events/school/sheva-lev-adom";
import { yeledManiacEvent } from "./events/school/yeled-maniac";
import { siahatLitufimEvent } from "./events/school/siahat-litufim";
import { maImShavatHamelech } from "./events/school/ma-im-shavat-hamelech";

// ── Army ─────────────────────────────────────────────────────
import { haydaNitzhonot } from "./events/army/hayda-nitzhonot";
import { pesekZmanEvent } from "./events/army/pesek-zman";
import { rakLitzokEvent } from "./events/army/rak-litzok";
import { hitoreinuMeuharEvent } from "./events/army/hitoreinu-meuhar";
import { ma2shazamat } from "./events/army/ma2shazamat";

// ── Trip ─────────────────────────────────────────────────────
import { tofesAvirEvent } from "./events/trip/tofes-avir";
import { destinationIndiaEvent } from "./events/trip/destination-india";
import { destinationSouthAmericaEvent } from "./events/trip/destination-south-america";
import { destinationUsaEvent } from "./events/trip/destination-usa";
import { destinationAustraliaEvent } from "./events/trip/destination-australia";
import { destinationEastAsiaEvent } from "./events/trip/destination-east-asia";
import { mayimAmukimEvent } from "./events/trip/mayim-amukim";
import { allenCarrEvent } from "./events/trip/allen-carr";
import { miYacholAlayEvent } from "./events/trip/mi-yachol-alay";
import { maImGaviaHaesh } from "./events/trip/ma-im-gavia-haesh";

// ── Home ─────────────────────────────────────────────────────
import { shiratHamitparnasimEvent } from "./events/home/shirat-hamitparnasim";
import { ashkenaziBetahanaEvent } from "./events/home/ashkenazi-betahana";
import { rakLitzokPayoffEvent } from "./events/home/rak-litzok-payoff";
import { shumDavarHadashEvent } from "./events/home/shum-davar-hadash";
import { haverimArsimEvent } from "./events/home/haverim-arsim";
import { maIm } from "./events/home/ma-im";

// ── Career ───────────────────────────────────────────────────
import { achshavZeHazmanEvent } from "./events/career/achshav-ze-hazman";
import { tohnithHaliveEvent } from "./events/career/tohnit-halive";
import { blaadenuEnMishakEvent } from "./events/career/blaadenu-en-mishak";
import { harryPotterEvent } from "./events/career/harry-potter";

// ── Shazamat ─────────────────────────────────────────────────
import { kozaNostraEvent } from "./events/shazamat/koza-nostra";
import { toskanaEvent } from "./events/shazamat/toskana";
import { habaytaEvent } from "./events/shazamat/habayta";
import { heyterimEvent } from "./events/shazamat/heyterim";
import { shevaRaotTovotEvent } from "./events/shazamat/sheva-raot-tovot";
import { loOtoDavarEvent } from "./events/shazamat/lo-oto-davar";
import { hagashemLoYavo } from "./events/shazamat/hagashem-lo-yavo";

export const pack: ContentPack = {
  version: 2,
  members,
  stats,
  stages,
  events: [
    // ── Childhood ────────────────────────────────────────────
    kookilidaEvent,
    olaEvent,

    // ── School ───────────────────────────────────────────────
    haverMeviHaverEvent,
    hayomAniLoEvent,
    tahushatBetenEvent,
    shevaLevAdomEvent,
    yeledManiacEvent,
    siahatLitufimEvent,
    maImShavatHamelech,

    // ── Army ─────────────────────────────────────────────────
    haydaNitzhonot,
    pesekZmanEvent,
    rakLitzokEvent,
    hitoreinuMeuharEvent,
    ma2shazamat,

    // ── Trip ─────────────────────────────────────────────────
    tofesAvirEvent,
    destinationIndiaEvent,
    destinationSouthAmericaEvent,
    destinationUsaEvent,
    destinationAustraliaEvent,
    destinationEastAsiaEvent,
    mayimAmukimEvent,
    allenCarrEvent,
    miYacholAlayEvent,
    maImGaviaHaesh,

    // ── Home ─────────────────────────────────────────────────
    shiratHamitparnasimEvent,
    ashkenaziBetahanaEvent,
    rakLitzokPayoffEvent,
    shumDavarHadashEvent,
    haverimArsimEvent,
    maIm,

    // ── Career ───────────────────────────────────────────────
    achshavZeHazmanEvent,
    tohnithHaliveEvent,
    blaadenuEnMishakEvent,
    harryPotterEvent,

    // ── Shazamat ─────────────────────────────────────────────
    kozaNostraEvent,
    toskanaEvent,
    habaytaEvent,
    heyterimEvent,
    shevaRaotTovotEvent,
    loOtoDavarEvent,
    hagashemLoYavo,
  ],
  sprites: spriteCatalog,
  sfx: sfxCatalog,
};
