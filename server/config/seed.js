/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

// var Department = require('../api/department/department.model');
var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var Module = require('../api/module/module.model');
var Lecture = require('../api/lecture/lecture.model');
var Session = require('../api/session/session.model');

// USED FOR QR GENERATION
var fs = require('fs');
var path = require('path');

var qrEncoder = require('qr-image');

var moment = require('moment');


function genKey(length) {
	var key = '';
	var randomchar = function() {
		var num = Math.floor(Math.random() * 62);
		if (num < 10)
			return num; //1-10
		if (num < 36)
			return String.fromCharCode(num + 55); //A-Z
		return String.fromCharCode(num + 61); //a-z
	};
	while (length--)
		key += randomchar();
	return key;
}
//
function isKeyUnique(altAccess, callback) {
	Lecture.find({
		altAccess: altAccess
	}, function(err, lecture) {
		// if authenticated user exists (find returns back an empty set,
		// so check to see if it has any elements)
		if (!lecture[0]) {
			// if it does, go to next middleware
			callback(true);
			return true;
		} else {
			// if it doesn't, send back error
			callback(false);
		}
	});
}
//
function createUniqueAccKey(altAccKeyLen, callback) {
	var altAccess = genKey(altAccKeyLen);
	isKeyUnique(altAccess, function(unique) {
		if (unique)
			callback(altAccess);
		else
			createUniqueAccKey();
	});
}

Thing.find({}).remove(function() {
	Thing.create({
		name: 'uniName',
		content: 'Sheffield Hallam'
	}, {
		name: 'uniEmail',
		content: '@shu.ac.uk'
	}, {
		name: 'uniTimePeriods',
		content: {
			'2016-2017': [moment.utc([2016, 09, 26, 23, 59, 59]).toISOString(), moment.utc([2017, 09, 25, 23, 59, 59]).toISOString()],
			'2015-2016': [moment.utc([2015, 09, 24, 23, 59, 59]).toISOString(), moment.utc([2016, 09, 23, 23, 59, 59]).toISOString()]
		}
	}, {
		name: 'userRoles',
		content: ['admin', 'student']
	}, {
		name: 'accessCodeLen',
		content: 6
	}, {
		name: 'minPassLength',
		content: 8
	}, {
		name: 'lectureTypes',
		content: ["URL", "Powerpoint"]
	}, {
		name: 'explicitWords',
		content: ["abbo", "abortion", "alla", "allah", "alligatorbait", "anal", "analannie", "analsex", "anus", "arab", "arabs", "areola", "aroused", "arse", "arsehole", "asian", "ass", "assassin", "assassinate", "assassination", "assault", "assbagger", "assblaster", "assclown", "asscowboy", "asses", "assfuck", "assfucker", "asshat", "asshole", "assholes", "asshore", "assjockey", "asskiss", "asskisser", "assklown", "asslick", "asslicker", "asslover", "assman", "assmonkey", "assmunch", "assmuncher", "asspacker", "asspirate", "asspuppies", "assranger", "asswhore", "asswipe", "athletesfoot", "attack", "australian", "babe", "babies", "backdoor", "backdoorman", "backseat", "badfuck", "balllicker", "balls", "ballsack", "banging", "baptist", "barelylegal", "barf", "barface", "barfface", "bast", "bastard", "bazongas", "bazooms", "beaner", "beast", "beastality", "beastial", "beastiality", "beatoff", "beat-off", "beatyourmeat", "beaver", "bestial", "bestiality", "bi", "biatch", "bible", "bicurious", "bigass", "bigbastard", "bigbutt", "bigger", "bisexual", "bi-sexual", "bitch", "bitcher", "bitches", "bitchez", "bitchin", "bitching", "bitchslap", "bitchy", "biteme", "black", "blackman", "blackout", "blacks", "blind", "blow", "blowjob", "boang", "bogan", "bohunk", "bollick", "bollock", "bomb", "bombers", "bombing", "bombs", "bomd", "bondage", "boner", "bong", "boob", "boobies", "boobs", "booby", "boody", "boom", "boong", "boonga", "boonie", "booty", "bootycall", "bountybar", "bra", "brea5t", "breast", "breastjob", "breastlover", "breastman", "brothel", "bugger", "buggered", "buggery", "bullcrap", "bulldike", "bulldyke", "bullshit", "bumblefuck", "bumfuck", "bunga", "bunghole", "buried", "burn", "butchbabes", "butchdike", "butchdyke", "butt", "buttbang", "butt-bang", "buttface", "buttfuck", "butt-fuck", "buttfucker", "butt-fucker", "buttfuckers", "butt-fuckers", "butthead", "buttman", "buttmunch", "buttmuncher", "buttpirate", "buttplug", "buttstain", "byatch", "cacker", "cameljockey", "cameltoe", "canadian", "cancer", "carpetmuncher", "carruth", "catholic", "catholics", "cemetery", "chav", "cherrypopper", "chickslick", "childrens", "chin", "chinaman", "chinamen", "chinese", "chink", "chinky", "choad", "chode", "christ", "christian", "church", "cigarette", "cigs", "clamdigger", "clamdiver", "clit", "clitoris", "clogwog", "cocaine", "cock", "cockblock", "cockblocker", "cockcowboy", "cockfight", "cockhead", "cockknob", "cocklicker", "cocklover", "cocknob", "cockqueen", "cockrider", "cocksman", "cocksmith", "cocksmoker", "cocksucer", "cocksuck", "cocksucked", "cocksucker", "cocksucking", "cocktail", "cocktease", "cocky", "cohee", "coitus", "color", "colored", "coloured", "commie", "communist", "condom", "conservative", "conspiracy", "coolie", "cooly", "coon", "coondog", "copulate", "cornhole", "corruption", "cra5h", "crabs", "crack", "crackpipe", "crackwhore", "crack-whore", "crap", "crapola", "crapper", "crappy", "crash", "creamy", "crime", "crimes", "criminal", "criminals", "crotch", "crotchjockey", "crotchmonkey", "crotchrot", "cum", "cumbubble", "cumfest", "cumjockey", "cumm", "cummer", "cumming", "cumquat", "cumqueen", "cumshot", "cunilingus", "cunillingus", "cunn", "cunnilingus", "cunntt", "cunt", "cunteyed", "cuntfuck", "cuntfucker", "cuntlick", "cuntlicker", "cuntlicking", "cuntsucker", "cybersex", "cyberslimer", "dago", "dahmer", "dammit", "damn", "damnation", "damnit", "darkie", "darky", "datnigga", "dead", "deapthroat", "death", "deepthroat", "defecate", "dego", "demon", "deposit", "desire", "destroy", "deth", "devil", "devilworshipper", "dick", "dickbrain", "dickforbrains", "dickhead", "dickless", "dicklick", "dicklicker", "dickman", "dickwad", "dickweed", "diddle", "die", "died", "dies", "dike", "dildo", "dingleberry", "dink", "dipshit", "dipstick", "dirty", "disease", "diseases", "disturbed", "dive", "dix", "dixiedike", "dixiedyke", "doggiestyle", "doggystyle", "dong", "doodoo", "doo-doo", "doom", "dope", "dragqueen", "dragqween", "dripdick", "drug", "drunk", "drunken", "dumb", "dumbass", "dumbbitch", "dumbfuck", "dyefly", "dyke", "easyslut", "eatballs", "eatme", "eatpussy", "ecstacy", "ejaculate", "ejaculated", "ejaculating", "ejaculation", "enema", "enemy", "erect", "erection", "ero", "escort", "ethiopian", "ethnic", "european", "evl", "excrement", "execute", "executed", "execution", "executioner", "explosion", "facefucker", "faeces", "fag", "fagging", "faggot", "fagot", "failed", "failure", "fairies", "fairy", "faith", "fannyfucker", "fart", "farted", "farting", "farty", "fastfuck", "fat", "fatah", "fatass", "fatfuck", "fatfucker", "fatso", "fckcum", "fear", "feces", "felatio", "felch", "felcher", "felching", "fellatio", "feltch", "feltcher", "feltching", "fetish", "fight", "filipina", "filipino", "fingerfood", "fingerfuck", "fingerfucked", "fingerfucker", "fingerfuckers", "fingerfucking", "fire", "firing", "fister", "fistfuck", "fistfucked", "fistfucker", "fistfucking", "fisting", "flange", "flasher", "flatulence", "floo", "flydie", "flydye", "fok", "fondle", "footaction", "footfuck", "footfucker", "footlicker", "footstar", "fore", "foreskin", "forni", "fornicate", "foursome", "fourtwenty", "fraud", "freakfuck", "freakyfucker", "freefuck", "fu", "fubar", "fuc", "fucck", "fuck", "fucka", "fuckable", "fuckbag", "fuckbuddy", "fucked", "fuckedup", "fucker", "fuckers", "fuckface", "fuckfest", "fuckfreak", "fuckfriend", "fuckhead", "fuckher", "fuckin", "fuckina", "fucking", "fuckingbitch", "fuckinnuts", "fuckinright", "fuckit", "fuckknob", "fuckme", "fuckmehard", "fuckmonkey", "fuckoff", "fuckpig", "fucks", "fucktard", "fuckwhore", "fuckyou", "fudgepacker", "fugly", "fuk", "fuks", "funeral", "funfuck", "fungus", "fuuck", "gangbang", "gangbanged", "gangbanger", "gangsta", "gatorbait", "gay", "gaymuthafuckinwhore", "gaysex", "geez", "geezer", "geni", "genital", "german", "getiton", "gin", "ginzo", "gipp", "girls", "givehead", "glazeddonut", "gob", "god", "godammit", "goddamit", "goddammit", "goddamn", "goddamned", "goddamnes", "goddamnit", "goddamnmuthafucker", "goldenshower", "gonorrehea", "gonzagas", "gook", "gotohell", "goy", "goyim", "greaseball", "gringo", "groe", "gross", "grostulation", "gubba", "gummer", "gun", "gyp", "gypo", "gypp", "gyppie", "gyppo", "gyppy", "hamas", "handjob", "hapa", "harder", "hardon", "harem", "headfuck", "headlights", "hebe", "heeb", "hell", "henhouse", "heroin", "herpes", "heterosexual", "hijack", "hijacker", "hijacking", "hillbillies", "hindoo", "hiscock", "hitler", "hitlerism", "hitlerist", "hiv", "ho", "hobo", "hodgie", "hoes", "hole", "holestuffer", "homicide", "homo", "homobangers", "homosexual", "honger", "honk", "honkers", "honkey", "honky", "hook", "hooker", "hookers", "hooters", "hore", "hork", "horn", "horney", "horniest", "horny", "horseshit", "hosejob", "hoser", "hostage", "hotdamn", "hotpussy", "hottotrot", "hummer", "husky", "hussy", "hustler", "hymen", "hymie", "iblowu", "idiot", "ikey", "illegal", "incest", "insest", "intercourse", "interracial", "intheass", "inthebuff", "israel", "israeli", "israels", "italiano", "itch", "jackass", "jackoff", "jackshit", "jacktheripper", "jade", "jap", "japanese", "japcrap", "jebus", "jeez", "jerkoff", "jesus", "jesuschrist", "jew", "jewish", "jiga", "jigaboo", "jigg", "jigga", "jiggabo", "jigger", "jiggy", "jihad", "jijjiboo", "jimfish", "jism", "jiz", "jizim", "jizjuice", "jizm", "jizz", "jizzim", "jizzum", "joint", "juggalo", "jugs", "junglebunny", "kaffer", "kaffir", "kaffre", "kafir", "kanake", "kid", "kigger", "kike", "kill", "killed", "killer", "killing", "kills", "kink", "kinky", "kissass", "kkk", "knife", "knockers", "kock", "kondum", "koon", "kotex", "krap", "krappy", "kraut", "kum", "kumbubble", "kumbullbe", "kummer", "kumming", "kumquat", "kums", "kunilingus", "kunnilingus", "kunt", "ky", "kyke", "lactate", "laid", "lapdance", "latin", "lesbain", "lesbayn", "lesbian", "lesbin", "lesbo", "lez", "lezbe", "lezbefriends", "lezbo", "lezz", "lezzo", "liberal", "libido", "licker", "lickme", "lies", "limey", "limpdick", "limy", "lingerie", "liquor", "livesex", "loadedgun", "lolita", "looser", "loser", "lotion", "lovebone", "lovegoo", "lovegun", "lovejuice", "lovemuscle", "lovepistol", "loverocket", "lowlife", "lsd", "lubejob", "lucifer", "luckycammeltoe", "lugan", "lynch", "macaca", "mad", "mafia", "magicwand", "mams", "manhater", "manpaste", "marijuana", "mastabate", "mastabater", "masterbate", "masterblaster", "mastrabator", "masturbate", "masturbating", "mattressprincess", "meatbeatter", "meatrack", "meth", "mexican", "mgger", "mggor", "mickeyfinn", "mideast", "milf", "minority", "mockey", "mockie", "mocky", "mofo", "moky", "moles", "molest", "molestation", "molester", "molestor", "moneyshot", "mooncricket", "mormon", "moron", "moslem", "mosshead", "mothafuck", "mothafucka", "mothafuckaz", "mothafucked", "mothafucker", "mothafuckin", "mothafucking", "mothafuckings", "motherfuck", "motherfucked", "motherfucker", "motherfuckin", "motherfucking", "motherfuckings", "motherlovebone", "muff", "muffdive", "muffdiver", "muffindiver", "mufflikcer", "mulatto", "muncher", "munt", "murder", "murderer", "muslim", "naked", "narcotic", "nasty", "nastybitch", "nastyho", "nastyslut", "nastywhore", "nazi", "necro", "negro", "negroes", "negroid", "negros", "nig", "niger", "nigerian", "nigerians", "nigg", "nigga", "niggah", "niggaracci", "niggard", "niggarded", "niggarding", "niggardliness", "niggardlinesss", "niggardly", "niggards", "niggards", "niggaz", "nigger", "niggerhead", "niggerhole", "niggers", "niggers", "niggle", "niggled", "niggles", "niggling", "nigglings", "niggor", "niggur", "niglet", "nignog", "nigr", "nigra", "nigre", "nip", "nipple", "nipplering", "nittit", "nlgger", "nlggor", "nofuckingway", "nook", "nookey", "nookie", "noonan", "nooner", "nude", "nudger", "nuke", "nutfucker", "nymph", "ontherag", "oral", "orga", "orgasim", "orgasm", "orgies", "orgy", "osama", "paki", "palesimian", "palestinian", "pansies", "pansy", "panti", "panties", "payo", "pearlnecklace", "peck", "pecker", "peckerwood", "pee", "peehole", "pee-pee", "peepshow", "peepshpw", "pendy", "penetration", "peni5", "penile", "penis", "penises", "penthouse", "period", "perv", "phonesex", "phuk", "phuked", "phuking", "phukked", "phukking", "phungky", "phuq", "pi55", "picaninny", "piccaninny", "pickaninny", "piker", "pikey", "piky", "pimp", "pimped", "pimper", "pimpjuic", "pimpjuice", "pimpsimp", "pindick", "piss", "pissed", "pisser", "pisses", "pisshead", "pissin", "pissing", "pissoff", "pistol", "pixie", "pixy", "playboy", "playgirl", "pocha", "pocho", "pocketpool", "pohm", "polack", "pom", "pommie", "pommy", "poo", "poon", "poontang", "poop", "pooper", "pooperscooper", "pooping", "poorwhitetrash", "popimp", "porchmonkey", "porn", "pornflick", "pornking", "porno", "pornography", "pornprincess", "pot", "poverty", "premature", "pric", "prick", "prickhead", "primetime", "propaganda", "pros", "prostitute", "protestant", "pu55i", "pu55y", "pube", "pubic", "pubiclice", "pud", "pudboy", "pudd", "puddboy", "puke", "puntang", "purinapricness", "puss", "pussie", "pussies", "pussy", "pussycat", "pussyeater", "pussyfucker", "pussylicker", "pussylips", "pussylover", "pussypounder", "pusy", "quashie", "queef", "queer", "quickie", "quim", "ra8s", "rabbi", "racial", "racist", "radical", "radicals", "raghead", "randy", "rape", "raped", "raper", "rapist", "rearend", "rearentry", "rectum", "redlight", "redneck", "reefer", "reestie", "refugee", "reject", "remains", "rentafuck", "republican", "rere", "retard", "retarded", "ribbed", "rigger", "rimjob", "rimming", "roach", "robber", "roundeye", "rump", "russki", "russkie", "sadis", "sadom", "samckdaddy", "sandm", "sandnigger", "satan", "scag", "scallywag", "scat", "schlong", "screw", "screwyou", "scrotum", "scum", "semen", "seppo", "servant", "sex", "sexed", "sexfarm", "sexhound", "sexhouse", "sexing", "sexkitten", "sexpot", "sexslave", "sextogo", "sextoy", "sextoys", "sexual", "sexually", "sexwhore", "sexy", "sexymoma", "sexy-slim", "shag", "shaggin", "shagging", "shat", "shav", "shawtypimp", "sheeney", "shhit", "shinola", "shit", "shitcan", "shitdick", "shite", "shiteater", "shited", "shitface", "shitfaced", "shitfit", "shitforbrains", "shitfuck", "shitfucker", "shitfull", "shithapens", "shithappens", "shithead", "shithouse", "shiting", "shitlist", "shitola", "shitoutofluck", "shits", "shitstain", "shitted", "shitter", "shitting", "shitty", "shoot", "shooting", "shortfuck", "showtime", "sick", "sissy", "sixsixsix", "sixtynine", "sixtyniner", "skank", "skankbitch", "skankfuck", "skankwhore", "skanky", "skankybitch", "skankywhore", "skinflute", "skum", "skumbag", "slant", "slanteye", "slapper", "slaughter", "slav", "slave", "slavedriver", "sleezebag", "sleezeball", "slideitin", "slime", "slimeball", "slimebucket", "slopehead", "slopey", "slopy", "slut", "sluts", "slutt", "slutting", "slutty", "slutwear", "slutwhore", "smack", "smackthemonkey", "smut", "snatch", "snatchpatch", "snigger", "sniggered", "sniggering", "sniggers", "sniggers", "sniper", "snot", "snowback", "snownigger", "sob", "sodom", "sodomise", "sodomite", "sodomize", "sodomy", "sonofabitch", "sonofbitch", "sooty", "sos", "soviet", "spaghettibender", "spaghettinigger", "spank", "spankthemonkey", "sperm", "spermacide", "spermbag", "spermhearder", "spermherder", "spic", "spick", "spig", "spigotty", "spik", "spit", "spitter", "splittail", "spooge", "spreadeagle", "spunk", "spunky", "squaw", "stagg", "stiffy", "strapon", "stringer", "stripclub", "stroke", "stroking", "stupid", "stupidfuck", "stupidfucker", "suck", "suckdick", "sucker", "suckme", "suckmyass", "suckmydick", "suckmytit", "suckoff", "suicide", "swallow", "swallower", "swalow", "swastika", "sweetness", "syphilis", "taboo", "taff", "tampon", "tang", "tantra", "tarbaby", "tard", "teat", "terror", "terrorist", "teste", "testicle", "testicles", "thicklips", "thirdeye", "thirdleg", "threesome", "threeway", "timbernigger", "tinkle", "tit", "titbitnipply", "titfuck", "titfucker", "titfuckin", "titjob", "titlicker", "titlover", "tits", "tittie", "titties", "titty", "tnt", "toilet", "tongethruster", "tongue", "tonguethrust", "tonguetramp", "tortur", "torture", "tosser", "towelhead", "trailertrash", "tramp", "trannie", "tranny", "transexual", "transsexual", "transvestite", "triplex", "trisexual", "trojan", "trots", "tuckahoe", "tunneloflove", "turd", "turnon", "twat", "twink", "twinkie", "twobitwhore", "uck", "unfuckable", "upskirt", "uptheass", "upthebutt", "urinary", "urinate", "urine", "usama", "uterus", "vagina", "vaginal", "vatican", "vibr", "vibrater", "vibrator", "vietcong", "violence", "virgin", "virginbreaker", "vomit", "vulva", "wab", "wank", "wanker", "wanking", "waysted", "weapon", "weenie", "weewee", "welcher", "welfare", "wetb", "wetback", "wetspot", "whacker", "whash", "whigger", "whiskey", "whiskeydick", "whiskydick", "whit", "whitenigger", "whites", "whitetrash", "whitey", "whiz", "whop", "whore", "whorefucker", "whorehouse", "wigger", "willie", "williewanker", "willy", "wn", "wog", "womens", "wop", "wtf", "wuss", "wuzzie", "xtc", "xxx", "yankee", "yellowman", "zigabo", "zipperhead"]
	}, function() {
		// console.log('finished populating things');
	});
});

User.find({}).remove(function() {
	User.create({
		_id: '56a7d95746b9e7db57417309',
		role: 'admin',
		name: 'Joshua Bates',
		email: 'JoBa@uniqa.co.uk',
		teachingArea: 'Software Engineering',
		password: 'Josh1992'
	}, {
		_id: '56cb76ebd5b3f4b6be5d7dd4',
		role: 'admin',
		name: 'Andrew Dearden',
		email: 'ande@shu.ac.uk',
		teachingArea: 'Software Engineering',
		password: 'tutor'
	}, {
		_id: '56cb76ebd5b3f4b6be5d7dd5',
		role: 'admin',
		name: 'Andrew Stratton',
		email: 'anst@shu.ac.uk',
		teachingArea: 'Software Engineering',
		password: 'tutor'
	}, {
		_id: '56cb76ebd5b3f4b6be5d7dd6',
		role: 'admin',
		name: 'Mehmet Özcan',
		email: 'meoz@shu.ac.uk',
		teachingArea: 'Software Engineering',
		password: 'tutor'
	}, {
		_id: '56cb76ebd5b3f4b6be5d7dd7',
		role: 'admin',
		name: 'Chris Bates',
		email: 'chba@shu.ac.uk',
		teachingArea: 'Software Engineering',
		password: 'tutor'
	}, {
		_id: '56cb76ebd5b3f4b6be5d7dd8',
		role: 'admin',
		name: "Peter O'Neill",
		email: 'peon@shu.ac.uk',
		teachingArea: 'Software Engineering',
		password: 'tutor'
	}, {
		_id: '56cb76ebd5b3f4b6be5d7dd9',
		role: 'admin',
		name: 'Andrew Bisset',
		email: 'anbi@shu.ac.uk',
		teachingArea: 'Software Engineering',
		password: 'tutor'
	}, {
		_id: '56cb76ebd5b3f4b6be5d7dda',
		role: 'admin',
		name: 'Ivan Phelan',
		email: 'ivph@shu.ac.uk',
		teachingArea: 'Software Engineering',
		password: 'tutor'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7ddb',
		role: 'admin',
		name: 'Martin Cooper',
		email: 'maco@shu.ac.uk',
		teachingArea: 'Software Engineering',
		password: 'mcooper'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7ddc',
		role: 'admin',
		name: 'Adrian Oram',
		email: 'ador@shu.ac.uk',
		teachingArea: 'Software Engineering',
		password: 'tutor'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7ddd',
		role: 'admin',
		name: 'Pascale Vacher',
		email: 'pava@shu.ac.uk',
		teachingArea: 'Software Engineering',
		password: 'tutor'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7dde',
		role: 'admin',
		name: 'Mark Featherstone',
		email: 'mafe@shu.ac.uk',
		teachingArea: 'Software Engineering',
		password: 'tutor'
	}, {
		_id: '56c86c25099777e930372eb7',
		name: 'Test Student',
		role: 'student',
		email: 'student@shu.ac.uk',
		course: 'Software Engineering',
		password: 'student'
	}, {
		_id: '56a7bf8a800c479155488fcb',
		name: 'Joshua Bates',
		role: 'student',
		email: 'b2006241@my.shu.ac.uk',
		course: 'Software Engineering',
		password: 'password'
	}, {
		_id: '56a7bf8a800c479155488fce',
		name: 'Jonathon Dickson',
		role: 'student',
		email: 'b2011327@my.shu.ac.uk',
		course: 'Software Engineering',
		password: 'password'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7ddf',
		name: 'Jack McGlone',
		role: 'student',
		email: 'jack@shu.ac.uk',
		course: 'Software Engineering',
		password: 'password'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7de0',
		name: 'Chad Simpson',
		role: 'student',
		email: 'chad@shu.ac.uk',
		course: 'Software Engineering',
		password: 'password'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7de1',
		name: 'Daniel Haswell',
		role: 'student',
		email: 'dan.has@shu.ac.uk',
		course: 'Software Engineering',
		password: 'Chad'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7de2',
		name: 'Elizabeth Athanasiadi',
		role: 'student',
		email: 'liz.ath@shu.ac.uk',
		course: 'Software Engineering',
		password: 'Chad'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7de3',
		name: 'Rowell Heria',
		role: 'student',
		email: 'row.her@shu.ac.uk',
		course: 'Software Engineering',
		password: 'Chad'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7de4',
		name: 'Kyle Bingham',
		role: 'student',
		email: 'kyl.bin@shu.ac.uk',
		course: 'Software Engineering',
		password: 'Chad'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7de5',
		name: 'Cameron Chalmers',
		role: 'student',
		email: 'cam.cha@shu.ac.uk',
		course: 'Software Engineering',
		password: 'Chad'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7de6',
		name: 'Ryan Robinson',
		role: 'student',
		email: 'rya.rob@shu.ac.uk',
		course: 'Software Engineering',
		password: 'Chad'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7de7',
		name: 'Brandon Murdoch',
		role: 'student',
		email: 'bra.mur@shu.ac.uk',
		course: 'Software Engineering',
		password: 'Chad'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7de8',
		name: 'Tom McGurrin',
		role: 'student',
		email: 'tom.mcg@shu.ac.uk',
		course: 'Software Engineering',
		password: 'Chad'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7de9',
		name: 'Matt Bizley',
		role: 'student',
		email: 'mat.biz@shu.ac.uk',
		course: 'Software Engineering',
		password: 'Chad'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7dea',
		name: 'Latir Cole-Etti',
		role: 'student',
		email: 'lat.col@shu.ac.uk',
		course: 'Software Engineering',
		password: 'Chad'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7deb',
		name: 'Luke Ward',
		role: 'student',
		email: 'luk.war@shu.ac.uk',
		course: 'Software Engineering',
		password: 'Chad'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7dec',
		name: 'Shaun Webb',
		role: 'student',
		email: 'sha.web@shu.ac.uk',
		course: 'Software Engineering',
		password: 'Chad'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7ded',
		name: 'Michael Crowther',
		role: 'student',
		email: 'mic.cro@shu.ac.uk',
		course: 'Software Engineering',
		password: 'Chad'
	}, {
		_id: '56a7afd3259ef46f559880c9',
		name: 'Alexis Parks',
		role: 'student',
		email: 'ap@shu.ac.uk',
		course: 'Software Engineering',
		passcode: 9493265230
	}, {
		_id: "56a7886405ab050a54d4eaa5",
		name: 'Jeff',
		role: 'student',
		email: 'jeff@shu.ac.uk',
		course: 'Computer Science',
		passcode: 9493265230
	}, {
		_id: "56a7886405ab050a54d4eaa6",
		name: 'Bill Gates',
		role: 'student',
		email: 'Bill@shu.ac.uk',
		course: 'Computer Science',
		password: 'Bill'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7dee',
		name: 'Alex',
		role: 'student',
		email: 'alexs@shu.ac.uk',
		course: 'Computer Science',
		passcode: 9493265230
	}, {
		_id: '56cb76ecd5b3f4b6be5d7def',
		name: 'Ben Parnell',
		role: 'student',
		email: 'be.pa@shu.ac.uk',
		course: 'Computer Science',
		password: 'password'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7df0',
		name: 'Jacob Burns',
		role: 'student',
		email: 'ja.bu@shu.ac.uk',
		course: 'Computer Science',
		password: 'password'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7df1',
		name: 'Martin Rushton',
		role: 'student',
		email: 'ma.ru@shu.ac.uk',
		course: 'Computer Science',
		password: 'password'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7df2',
		name: 'Tom Hanson',
		role: 'student',
		email: 'to.ha@shu.ac.uk',
		course: 'Computer Science',
		password: 'password'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7df3',
		name: 'Ehsan Hussain',
		role: 'student',
		email: 'eh.hu@shu.ac.uk',
		course: 'Computer Science',
		password: 'password'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7df4',
		name: 'Curtis Bailey',
		role: 'student',
		email: 'cu.ba@shu.ac.uk',
		course: 'Computer Science',
		password: 'password'
	}, {
		_id: '56cb76ecd5b3f4b6be5d7df5',
		name: 'Akeem Khan',
		role: 'student',
		email: 'ak.kh@shu.ac.uk',
		course: 'Computer Science',
		password: 'password'
	}, {
		_id: '56cb76edd5b3f4b6be5d7df6',
		name: 'Henry Rowland',
		role: 'student',
		email: 'he.ro@shu.ac.uk',
		course: 'Computer Science',
		password: 'password'
	}, {
		_id: '56cb76edd5b3f4b6be5d7df7',
		role: 'student',
		name: 'Lee Coddington',
		email: 'lcoddington@shu.ac.uk',
		password: 'password'
	}, {
		_id: '56cb76edd5b3f4b6be5d7df8',
		role: 'student',
		name: 'Simon Clark',
		email: 'sclark@shu.ac.uk',
		password: 'password'
	}, {
		_id: '56cb76edd5b3f4b6be5d7df9',
		role: 'student',
		name: 'Brian Irwin',
		email: 'birwin@shu.ac.uk',
		password: 'password'
	}, function() {
		// console.log('finished populating users');
		Module.find({}).remove(function() {
			Module.create({
				_id: '56cb7c2e7bbe028ebfbe56a2',
				course: 'Software Engineering',
				students: [{
					user: '56a7bf8a800c479155488fcb'
				}, {
					user: '56a7bf8a800c479155488fce'
				}, {
					user: '56cb76ecd5b3f4b6be5d7ddf'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de0'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de1'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de2'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de3'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de4'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de5'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de6'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de7'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de8'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de9'
				}, {
					user: '56cb76ecd5b3f4b6be5d7dea'
				}, {
					user: '56cb76ecd5b3f4b6be5d7deb'
				}, {
					user: '56cb76ecd5b3f4b6be5d7dec'
				}, {
					user: '56cb76ecd5b3f4b6be5d7ded'
				}, {
					user: '56cb76edd5b3f4b6be5d7df7'
				}, {
					user: '56cb76edd5b3f4b6be5d7df8'
				}, {
					user: '56cb76edd5b3f4b6be5d7df9'
				}],
				tutors: [{
					user: '56a7d95746b9e7db57417309'
				}, {
					user: '56cb76ebd5b3f4b6be5d7dd4'
				}, {
					user: '56cb76ebd5b3f4b6be5d7dd6'
				}, {
					user: '56cb76ebd5b3f4b6be5d7dd7'
				}, {
					user: '56cb76ecd5b3f4b6be5d7ddb'
				}],
				level: 6,
				deleted: false
			}, {
				_id: '56cb7c2e7bbe028ebfbe56a3',
				course: 'Computer Science',
				students: [{
					user: '56cb76ecd5b3f4b6be5d7def'
				}, {
					user: '56cb76ecd5b3f4b6be5d7df0'
				}, {
					user: '56cb76ecd5b3f4b6be5d7df1'
				}, {
					user: '56cb76ecd5b3f4b6be5d7df2'
				}, {
					user: '56cb76ecd5b3f4b6be5d7df3'
				}, {
					user: '56cb76ecd5b3f4b6be5d7df4'
				}, {
					user: '56cb76ecd5b3f4b6be5d7df5'
				}, {
					user: '56cb76edd5b3f4b6be5d7df6'
				}],
				tutors: [{
					user: '56cb76ebd5b3f4b6be5d7dd7'
				}, {
					user: '56cb76ecd5b3f4b6be5d7ddc'
				}, {
					user: '56cb76ecd5b3f4b6be5d7ddb'
				}, {
					user: '56cb76ecd5b3f4b6be5d7ddd'
				}, {
					user: '56cb76ecd5b3f4b6be5d7dde'
				}],
				level: 6,
				deleted: false
			}, function(err) {
				if (err) console.log(err);
				// console.log('finished populating modules');
				Lecture.find({}).remove(function() {
					Lecture.create({
						_id: '56d1ca2e4f6973280ce025e6',
						author: '56cb76ecd5b3f4b6be5d7ddb', // 56a7bf8a800c479155488fce
						title: "WAD Week 1",
						desc: "Descriptive element for WAD no1",
						collaborators: [{
							user: '56a7d95746b9e7db57417309'
						}],
						url: '',
						attachments: []
					}, {
						_id: '56d1ca2e4f6973280ce025e7',
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "WAD Week 2",
						desc: "Descriptive element for WAD no2",
						collaborators: [{
							user: '56a7d95746b9e7db57417309'
						}],
						url: '',
						attachments: []
					}, {
						_id: '56d1ca2e4f6973280ce025e8',
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "WAD Week 3",
						desc: "Descriptive element for WAD no3",
						collaborators: [{
							user: '56a7d95746b9e7db57417309'
						}],
						url: '',
						attachments: []
					}, {
						_id: '56d1ca2e4f6973280ce025e9',
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "WAD Week 4",
						desc: "Descriptive element for WAD no4",
						collaborators: [{
							user: '56a7d95746b9e7db57417309'
						}],
						url: '',
						attachments: []
					}, {
						_id: '56d1ca2e4f6973280ce025ea',
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "WAD Week 5",
						desc: "Descriptive element for WAD no5",
						collaborators: [{
							user: '56a7d95746b9e7db57417309'
						}],
						url: '',
						attachments: []
					}, {
						_id: '56d1ca2e4f6973280ce025eb',
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "WAD Week 6",
						desc: "Descriptive element for WAD no6",
						collaborators: [{
							user: '56a7d95746b9e7db57417309'
						}],
						url: '',
						attachments: []
					}, {
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "WAD Week 7",
						desc: "Descriptive element for WAD no7",
					}, {
						_id: "56c868096bd3f7b730a051f4",
						author: '56a7d95746b9e7db57417309',
						title: "WAD Week 8",
						desc: "Basic Information about this lecture, including the description, runtime, collaborators & live registration. This place here is reserved for a description of the lecture itself. Continuing text to see what it would look like when the word wrap is active.",
						collaborators: [{
							user: "56cb76ecd5b3f4b6be5d7ddb"
						}],
						url: 'http://www.mustbebuilt.co.uk/SHU/WAD/wad-wk8-lecture16.html#/step-1',
						attachments: [{
							"loc": "/Applications/XAMPP/xamppfiles/htdocs/Website/UniQA/server/storage/lectures/56a7d95746b9e7db57417309/Application_Demo_Marking_Scheme(1).pdf",
							"url": "/api/storage/lectures/56a7d95746b9e7db57417309/Application_Demo_Marking_Scheme(1).pdf",
							"_id": "5702d39c4826bef0959ebadf",
							"type": "file-pdf"
						}, {
							"loc": "/Applications/XAMPP/xamppfiles/htdocs/Website/UniQA/server/storage/lectures/56a7d95746b9e7db57417309/childcare_proof.pdf",
							"url": "/api/storage/lectures/56a7d95746b9e7db57417309/childcare_proof.pdf",
							"_id": "5702d39c4826bef0959ebade",
							"type": "file-pdf"
						}],
					}, {
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "WAD Week 9",
						desc: "Descriptive element for WAD no9",
						collaborators: [{
							user: '56a7d95746b9e7db57417309'
						}],
						url: '',
						attachments: []
					}, {
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "MAD No1",
						desc: "Descriptive element for MAD no2",
						collaborators: [{
							user: '56a7d95746b9e7db57417309'
						}],
						url: '',
						attachments: []
					}, {
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "CSSD No1",
						desc: "Descriptive element for Case Studies No1",
						collaborators: [{
							user: '56a7d95746b9e7db57417309'
						}],
						url: '',
						attachments: []
					}, {
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "CSSD No2",
						desc: "Descriptive element for Case Studies No2",
						collaborators: [{
							user: '56a7d95746b9e7db57417309'
						}],
						url: '',
						attachments: []
					}, {
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "CSSD No3",
						desc: "Descriptive element for Case Studies No3",
						collaborators: [{
							user: '56a7d95746b9e7db57417309'
						}],
						url: '',
						attachments: []
					}, {
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "MAD No2",
						desc: "Descriptive element for no3",
						collaborators: [{
							user: '56a7d95746b9e7db57417309'
						}],
						url: '',
						attachments: []
					}, {
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "SEGM No1",
						desc: "Descriptive element for SEGM No1",
						collaborators: [],
						url: '',
						attachments: []
					}, {
						author: '56a7d95746b9e7db57417309',
						title: "UniQA - Week 1",
						desc: "Descriptive element for SEGM No1",
						collaborators: [],
						url: '',
						attachments: []
					}, {
						author: '56a7d95746b9e7db57417309',
						title: "UniQA - Week 2",
						desc: "Descriptive element for SEGM No1",
						collaborators: [],
						url: '',
						attachments: []
					}, {
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "SEGM No2",
						desc: "Descriptive element for SEGM No2",
						collaborators: [],
						url: '',
						attachments: []
					}, {
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "AAF No1",
						desc: "Descriptive element for AAF No1",
						collaborators: [],
						url: '',
						attachments: []
					}, {
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "AAF No2",
						desc: "Descriptive element for AAF No2",
						collaborators: [],
						url: '',
						attachments: []
					}, {
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "AAF No3",
						desc: "Descriptive element for AAF No3",
						collaborators: [],
						url: '',
						attachments: []
					}, {
						author: '56cb76ecd5b3f4b6be5d7ddb',
						title: "MAD No3",
						desc: "Descriptive element for no12",
						collaborators: [],
						url: '',
						attachments: []
					}, function(error) {
						if (error) {
							console.log(error);
						} else {
							Session.find({}).remove(function() {
								Session.create({
										createdBy: '56a7d95746b9e7db57417309',
										_id: '56c87667bcd6f3c431cb8681',
										lecture: '56c868096bd3f7b730a051f4',
										startTime: moment("27-08-2016 14:30:00", "DD-MM-YYYY HH:mm:ss").utc(),
										endTime: moment("27-08-2016 15:30:00", "DD-MM-YYYY HH:mm:ss").utc(),
										timeAllowance: 5,
										modules: [{
											module: '56cb7c2e7bbe028ebfbe56a2'
										}, {
											module: '56cb7c2e7bbe028ebfbe56a3'
										}]
									}, {
										createdBy: '56a7d95746b9e7db57417309',
										lecture: '56d1ca2e4f6973280ce025e6',
										startTime: moment("27-08-2016 16:40:00", "DD-MM-YYYY HH:mm:ss").utc(),
										endTime: moment("27-08-2016 17:30:00", "DD-MM-YYYY HH:mm:ss").utc(),
										timeAllowance: 20,
										modules: [{
											module: '56cb7c2e7bbe028ebfbe56a2'
										}, {
											module: '56cb7c2e7bbe028ebfbe56a3'
										}]
									}, {
										createdBy: '56a7d95746b9e7db57417309',
										lecture: '56d1ca2e4f6973280ce025e7',
										startTime: moment("27-08-2016 18:30:00", "DD-MM-YYYY HH:mm:ss").utc(),
										endTime: moment("27-08-2016 19:30:00", "DD-MM-YYYY HH:mm:ss").utc(),
										timeAllowance: 30,
										modules: [{
											module: '56cb7c2e7bbe028ebfbe56a3'
										}]
									}, {
										createdBy: '56a7d95746b9e7db57417309',
										lecture: '56d1ca2e4f6973280ce025e8',
										startTime: moment("27-08-2016 21:30:00", "DD-MM-YYYY HH:mm:ss").utc(),
										endTime: moment("27-08-2016 22:30:00", "DD-MM-YYYY HH:mm:ss").utc(),
										timeAllowance: 20,
										modules: [{
											module: '56cb7c2e7bbe028ebfbe56a2'
										}]
									}, {
										createdBy: '56a7d95746b9e7db57417309',
										lecture: '56c868096bd3f7b730a051f4',
										startTime: moment("28-08-2016 14:30:00", "DD-MM-YYYY HH:mm:ss").utc(),
										endTime: moment("28-08-2016 15:30:00", "DD-MM-YYYY HH:mm:ss").utc(),
										timeAllowance: 5,
										feedback: [{
											comment: "A good lecture, was interesting to see how AJAX works",
											rating: "4",
											user: "56cb76ecd5b3f4b6be5d7dec"
										}, {
											comment: "I never quite understood sessions until this one!",
											rating: "5",
											user: "56cb76ecd5b3f4b6be5d7dea"
										}, {
											comment: "Your slides are a great way of showing how slideshows can be done without PowerPoint!",
											rating: "5",
											user: "56cb76ecd5b3f4b6be5d7deb"
										}],
										questions: [{
											asker: "56a7886405ab050a54d4eaa6",
											question: "How do I do this?",
											time: "2016-02-12T13:35:00Z",
											_id: "56dc84edd4357803006a440d",
											anon: false
										}, {
											asker: "56c86c25099777e930372eb7",
											question: "more questions...",
											time: "2016-02-12T13:40:00Z",
											_id: "56dc84edd4357803006a440c",
											anon: false
										}, {
											asker: "56a7afd3259ef46f559880c9",
											question: "Ridiculously stupidly incredibily long comment to test out how it looks",
											time: "2016-02-12T13:50:00Z",
											_id: "56dc84edd4357803006a440b",
											anon: false
										}, {
											question: "Send message",
											asker: "56a7bf8a800c479155488fcb",
											time: "2016-03-06T19:30:13Z",
											_id: "56dc8545d4357803006a4414",
											anon: null
										}, {
											question: "lexiva",
											asker: "56a7bf8a800c479155488fcb",
											time: "2016-03-06T19:30:40Z",
											_id: "56dc8560d4357803006a4415",
											anon: null
										}, {
											question: "Hey you guys",
											asker: "56a7bf8a800c479155488fcb",
											time: "2016-03-06T19:35:52Z",
											_id: "56dc8698d4357803006a4416",
											anon: null
										}, {
											question: "Loving the live action",
											asker: "56a7bf8a800c479155488fcb",
											time: "2016-03-06T19:35:59Z",
											_id: "56dc869fd4357803006a4417",
											anon: null
										}, {
											question: "Anon aswell",
											asker: "56a7bf8a800c479155488fcb",
											time: "2016-03-06T19:36:04Z",
											_id: "56dc86a4d4357803006a4418",
											anon: true
										}, {
											question: "Different",
											asker: "56cb76ecd5b3f4b6be5d7df0",
											time: "2016-03-06T19:38:42Z",
											_id: "56dc8742d4357803006a4419",
											anon: null
										}, {
											question: "Try something else",
											asker: "56cb76ecd5b3f4b6be5d7df0",
											time: "2016-03-06T19:40:42Z",
											_id: "56dc87bad4357803006a441a",
											anon: true
										}],
										registered: [{
											user: '56a7bf8a800c479155488fcb'
										}, {
											user: '56a7bf8a800c479155488fce'
										}, {
											user: '56cb76ecd5b3f4b6be5d7ddf'
										}, {
											user: '56cb76ecd5b3f4b6be5d7de0'
										}, {
											user: '56cb76ecd5b3f4b6be5d7de1'
										}, {
											user: '56cb76ecd5b3f4b6be5d7de2'
										}, {
											user: '56cb76ecd5b3f4b6be5d7de3'
										}, {
											user: '56cb76ecd5b3f4b6be5d7de4'
										}, {
											user: '56cb76ecd5b3f4b6be5d7de5'
										}, {
											user: '56cb76ecd5b3f4b6be5d7de6'
										}, {
											user: '56cb76ecd5b3f4b6be5d7de7'
										}, {
											user: '56cb76ecd5b3f4b6be5d7de8'
										}, {
											user: '56cb76ecd5b3f4b6be5d7de9'
										}, {
											user: '56cb76ecd5b3f4b6be5d7dea'
										}, {
											user: '56cb76ecd5b3f4b6be5d7deb'
										}, {
											user: '56cb76ecd5b3f4b6be5d7dec'
										}, {
											user: '56cb76ecd5b3f4b6be5d7ded'
										}],
										modules: [{
											module: '56cb7c2e7bbe028ebfbe56a2'
										}, {
											module: '56cb7c2e7bbe028ebfbe56a3'
										}]
									}, {
										createdBy: '56a7d95746b9e7db57417309',
										lecture: '56c868096bd3f7b730a051f4',
										startTime: moment.utc([2016, 8, 21, 16, 0, 0]),
										endTime: moment.utc([2016, 8, 21, 17, 30, 0]),
										timeAllowance: 10,
										modules: [{
											module: '56cb7c2e7bbe028ebfbe56a3'
										}]
									}, {
										createdBy: '56a7d95746b9e7db57417309',
										lecture: '56c868096bd3f7b730a051f4',
										startTime: moment.utc([2016, 9, 22, 10, 0, 0]),
										endTime: moment.utc([2016, 9, 22, 11, 0, 0]),
										timeAllowance: 20,
										registered: [{
											user: '56cb76ecd5b3f4b6be5d7def'
										}, {
											user: '56cb76ecd5b3f4b6be5d7df0'
										}, {
											user: '56cb76ecd5b3f4b6be5d7df1'
										}, {
											user: '56cb76ecd5b3f4b6be5d7df2'
										}, {
											user: '56cb76ecd5b3f4b6be5d7df3'
										}, {
											user: '56cb76ecd5b3f4b6be5d7df4'
										}, {
											user: '56cb76ecd5b3f4b6be5d7df5'
										}, {
											user: '56cb76edd5b3f4b6be5d7df6'
										}],
										feedback: [{
											comment: "A good lecture, was interesting to see how AJAX works",
											rating: "4",
											user: "56cb76ecd5b3f4b6be5d7df0"
										}, {
											comment: "I never quite understood sessions until this one!",
											rating: "5",
											user: "56a7bf8a800c479155488fcb"
										}, {
											comment: "Your slides are a great way of showing how slideshows can be done without PowerPoint!",
											rating: "5",
											user: "56cb76ecd5b3f4b6be5d7def"
										}],
										modules: [{
											module: '56cb7c2e7bbe028ebfbe56a2'
										}, {
											module: '56cb7c2e7bbe028ebfbe56a3'
										}]
									}, {
										createdBy: '56a7d95746b9e7db57417309',
										lecture: '56d1ca2e4f6973280ce025eb',
										startTime: moment.utc([2016, 10, 28, 12, 0, 0]),
										endTime: moment.utc([2016, 10, 28, 14, 0, 0]),
										timeAllowance: 20,
										altAccess: '',
										modules: [{
											module: '56cb7c2e7bbe028ebfbe56a2'
										}, {
											module: '56cb7c2e7bbe028ebfbe56a3'
										}]
									}, {
										createdBy: '56a7d95746b9e7db57417309',
										lecture: '56d1ca2e4f6973280ce025e7',
										startTime: moment.utc([2016, 10, 29, 12, 0, 0]),
										endTime: moment.utc([2016, 10, 29, 14, 0, 0]),
										timeAllowance: 30,
										modules: [{
											module: '56cb7c2e7bbe028ebfbe56a3'
										}]
									}, {
										createdBy: '56a7d95746b9e7db57417309',
										lecture: '56d1ca2e4f6973280ce025e7',
										startTime: moment.utc([2016, 10, 29, 14, 30, 0]),
										endTime: moment.utc([2016, 10, 29, 16, 0, 0]),
										timeAllowance: 30,
										modules: [{
											module: '56cb7c2e7bbe028ebfbe56a3'
										}]
									}, {
										createdBy: '56a7d95746b9e7db57417309',
										lecture: '56d1ca2e4f6973280ce025e7',
										startTime: moment.utc([2016, 5, 27, 12, 0, 0]),
										endTime: moment.utc([2016, 5, 27, 14, 0, 0]),
										timeAllowance: 30,
										modules: [{
											module: '56cb7c2e7bbe028ebfbe56a3'
										}]
									}, {
										createdBy: '56a7d95746b9e7db57417309',
										lecture: '56d1ca2e4f6973280ce025e7',
										startTime: moment.utc([2016, 10, 28, 12, 0, 0]),
										endTime: moment.utc([2016, 10, 28, 14, 0, 0]),
										timeAllowance: 30,
										modules: [{
											module: '56cb7c2e7bbe028ebfbe56a3'
										}]
									},
									function(err, sessions) {
										if (err)
											console.log(err);
										// populate QRs for these lectures
										Session.find({}, function(err, sessions) {
											sessions.forEach(function(session) {
												if (err) {
													console.info(err);
												} else {
													//   console.log(lecture.name);
													Thing.find({
														name: 'accessCodeLen'
													}, function(err, thing) {
														var altAccKeyLen = thing[0].content; // just the one
														createUniqueAccKey(altAccKeyLen, function(altAccessKey) {
															session.altAccess = altAccessKey;

															// var url = String('http://' + process.env.DOMAIN + '/qr/register/' + session._id);
															var url = String('http://uniqa-shu.herokuapp.com/qr/register/' + session._id);


															// currently in Sync...? :(
															var qrSvgString = qrEncoder.imageSync(url, {
																type: 'svg',
																ec_level: 'Q',
																parse_url: false,
																margin: 1,
																size: 4
															});
															// REMOVE Inject elements on svg, problem with plugin

															qrSvgString = qrSvgString.replace('<svg xmlns="http://www.w3.org/2000/svg" width="172" height="172" viewBox="0 0 43 43">', "");
															qrSvgString = qrSvgString.replace('</svg>', "");
															qrSvgString = qrSvgString.replace('\"', "\'");
															qrSvgString = qrSvgString.replace('\"/', "\'/");

															session.qr.url = '/qr/register/' + session._id;
															session.qr.svg = qrSvgString;

															session.save(function(err) {
																if (err) {
																	console.info(err);
																}

															});
														});
													});
												}
											});
											// console.log('finished populating Sessions');
										});
									});

							});
						}
					});
				});
			});
		});
	});
});