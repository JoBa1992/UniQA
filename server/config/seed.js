/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Department = require('../api/department/department.model');
var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var Group = require('../api/group/group.model');
var Lecture = require('../api/lecture/lecture.model');
var Qr = require('../api/qr/qr.model');

// USED FOR QR GENERATION
var fs = require('fs');
var path = require('path');
var qrEncoder = require('qr-image');

var moment = require('moment');

function genFileLoc(name) {
  return path.join(__dirname, '../storage/qrs/', name);
}

//
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
      createUniqueKey();
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
    content: ['admin', 'tutor', 'student']
  }, {
    name: 'accessCodeLen',
    content: 6
  }, {
    name: 'minPassLength',
    content: 8
  }, {
    name: 'qrBaseURL',
    content: "http://uniqa.shu.ac.uk/qr"
  }, {
    name: 'explicitWords',
    content: ["abbo", "abortion", "alla", "allah", "alligatorbait", "anal", "analannie", "analsex", "anus", "arab", "arabs", "areola", "aroused", "arse", "arsehole", "asian", "ass", "assassin", "assassinate", "assassination", "assault", "assbagger", "assblaster", "assclown", "asscowboy", "asses", "assfuck", "assfucker", "asshat", "asshole", "assholes", "asshore", "assjockey", "asskiss", "asskisser", "assklown", "asslick", "asslicker", "asslover", "assman", "assmonkey", "assmunch", "assmuncher", "asspacker", "asspirate", "asspuppies", "assranger", "asswhore", "asswipe", "athletesfoot", "attack", "australian", "babe", "babies", "backdoor", "backdoorman", "backseat", "badfuck", "balllicker", "balls", "ballsack", "banging", "baptist", "barelylegal", "barf", "barface", "barfface", "bast", "bastard", "bazongas", "bazooms", "beaner", "beast", "beastality", "beastial", "beastiality", "beatoff", "beat-off", "beatyourmeat", "beaver", "bestial", "bestiality", "bi", "biatch", "bible", "bicurious", "bigass", "bigbastard", "bigbutt", "bigger", "bisexual", "bi-sexual", "bitch", "bitcher", "bitches", "bitchez", "bitchin", "bitching", "bitchslap", "bitchy", "biteme", "black", "blackman", "blackout", "blacks", "blind", "blow", "blowjob", "boang", "bogan", "bohunk", "bollick", "bollock", "bomb", "bombers", "bombing", "bombs", "bomd", "bondage", "boner", "bong", "boob", "boobies", "boobs", "booby", "boody", "boom", "boong", "boonga", "boonie", "booty", "bootycall", "bountybar", "bra", "brea5t", "breast", "breastjob", "breastlover", "breastman", "brothel", "bugger", "buggered", "buggery", "bullcrap", "bulldike", "bulldyke", "bullshit", "bumblefuck", "bumfuck", "bunga", "bunghole", "buried", "burn", "butchbabes", "butchdike", "butchdyke", "butt", "buttbang", "butt-bang", "buttface", "buttfuck", "butt-fuck", "buttfucker", "butt-fucker", "buttfuckers", "butt-fuckers", "butthead", "buttman", "buttmunch", "buttmuncher", "buttpirate", "buttplug", "buttstain", "byatch", "cacker", "cameljockey", "cameltoe", "canadian", "cancer", "carpetmuncher", "carruth", "catholic", "catholics", "cemetery", "chav", "cherrypopper", "chickslick", "childrens", "chin", "chinaman", "chinamen", "chinese", "chink", "chinky", "choad", "chode", "christ", "christian", "church", "cigarette", "cigs", "clamdigger", "clamdiver", "clit", "clitoris", "clogwog", "cocaine", "cock", "cockblock", "cockblocker", "cockcowboy", "cockfight", "cockhead", "cockknob", "cocklicker", "cocklover", "cocknob", "cockqueen", "cockrider", "cocksman", "cocksmith", "cocksmoker", "cocksucer", "cocksuck", "cocksucked", "cocksucker", "cocksucking", "cocktail", "cocktease", "cocky", "cohee", "coitus", "color", "colored", "coloured", "commie", "communist", "condom", "conservative", "conspiracy", "coolie", "cooly", "coon", "coondog", "copulate", "cornhole", "corruption", "cra5h", "crabs", "crack", "crackpipe", "crackwhore", "crack-whore", "crap", "crapola", "crapper", "crappy", "crash", "creamy", "crime", "crimes", "criminal", "criminals", "crotch", "crotchjockey", "crotchmonkey", "crotchrot", "cum", "cumbubble", "cumfest", "cumjockey", "cumm", "cummer", "cumming", "cumquat", "cumqueen", "cumshot", "cunilingus", "cunillingus", "cunn", "cunnilingus", "cunntt", "cunt", "cunteyed", "cuntfuck", "cuntfucker", "cuntlick", "cuntlicker", "cuntlicking", "cuntsucker", "cybersex", "cyberslimer", "dago", "dahmer", "dammit", "damn", "damnation", "damnit", "darkie", "darky", "datnigga", "dead", "deapthroat", "death", "deepthroat", "defecate", "dego", "demon", "deposit", "desire", "destroy", "deth", "devil", "devilworshipper", "dick", "dickbrain", "dickforbrains", "dickhead", "dickless", "dicklick", "dicklicker", "dickman", "dickwad", "dickweed", "diddle", "die", "died", "dies", "dike", "dildo", "dingleberry", "dink", "dipshit", "dipstick", "dirty", "disease", "diseases", "disturbed", "dive", "dix", "dixiedike", "dixiedyke", "doggiestyle", "doggystyle", "dong", "doodoo", "doo-doo", "doom", "dope", "dragqueen", "dragqween", "dripdick", "drug", "drunk", "drunken", "dumb", "dumbass", "dumbbitch", "dumbfuck", "dyefly", "dyke", "easyslut", "eatballs", "eatme", "eatpussy", "ecstacy", "ejaculate", "ejaculated", "ejaculating", "ejaculation", "enema", "enemy", "erect", "erection", "ero", "escort", "ethiopian", "ethnic", "european", "evl", "excrement", "execute", "executed", "execution", "executioner", "explosion", "facefucker", "faeces", "fag", "fagging", "faggot", "fagot", "failed", "failure", "fairies", "fairy", "faith", "fannyfucker", "fart", "farted", "farting", "farty", "fastfuck", "fat", "fatah", "fatass", "fatfuck", "fatfucker", "fatso", "fckcum", "fear", "feces", "felatio", "felch", "felcher", "felching", "fellatio", "feltch", "feltcher", "feltching", "fetish", "fight", "filipina", "filipino", "fingerfood", "fingerfuck", "fingerfucked", "fingerfucker", "fingerfuckers", "fingerfucking", "fire", "firing", "fister", "fistfuck", "fistfucked", "fistfucker", "fistfucking", "fisting", "flange", "flasher", "flatulence", "floo", "flydie", "flydye", "fok", "fondle", "footaction", "footfuck", "footfucker", "footlicker", "footstar", "fore", "foreskin", "forni", "fornicate", "foursome", "fourtwenty", "fraud", "freakfuck", "freakyfucker", "freefuck", "fu", "fubar", "fuc", "fucck", "fuck", "fucka", "fuckable", "fuckbag", "fuckbuddy", "fucked", "fuckedup", "fucker", "fuckers", "fuckface", "fuckfest", "fuckfreak", "fuckfriend", "fuckhead", "fuckher", "fuckin", "fuckina", "fucking", "fuckingbitch", "fuckinnuts", "fuckinright", "fuckit", "fuckknob", "fuckme", "fuckmehard", "fuckmonkey", "fuckoff", "fuckpig", "fucks", "fucktard", "fuckwhore", "fuckyou", "fudgepacker", "fugly", "fuk", "fuks", "funeral", "funfuck", "fungus", "fuuck", "gangbang", "gangbanged", "gangbanger", "gangsta", "gatorbait", "gay", "gaymuthafuckinwhore", "gaysex", "geez", "geezer", "geni", "genital", "german", "getiton", "gin", "ginzo", "gipp", "girls", "givehead", "glazeddonut", "gob", "god", "godammit", "goddamit", "goddammit", "goddamn", "goddamned", "goddamnes", "goddamnit", "goddamnmuthafucker", "goldenshower", "gonorrehea", "gonzagas", "gook", "gotohell", "goy", "goyim", "greaseball", "gringo", "groe", "gross", "grostulation", "gubba", "gummer", "gun", "gyp", "gypo", "gypp", "gyppie", "gyppo", "gyppy", "hamas", "handjob", "hapa", "harder", "hardon", "harem", "headfuck", "headlights", "hebe", "heeb", "hell", "henhouse", "heroin", "herpes", "heterosexual", "hijack", "hijacker", "hijacking", "hillbillies", "hindoo", "hiscock", "hitler", "hitlerism", "hitlerist", "hiv", "ho", "hobo", "hodgie", "hoes", "hole", "holestuffer", "homicide", "homo", "homobangers", "homosexual", "honger", "honk", "honkers", "honkey", "honky", "hook", "hooker", "hookers", "hooters", "hore", "hork", "horn", "horney", "horniest", "horny", "horseshit", "hosejob", "hoser", "hostage", "hotdamn", "hotpussy", "hottotrot", "hummer", "husky", "hussy", "hustler", "hymen", "hymie", "iblowu", "idiot", "ikey", "illegal", "incest", "insest", "intercourse", "interracial", "intheass", "inthebuff", "israel", "israeli", "israels", "italiano", "itch", "jackass", "jackoff", "jackshit", "jacktheripper", "jade", "jap", "japanese", "japcrap", "jebus", "jeez", "jerkoff", "jesus", "jesuschrist", "jew", "jewish", "jiga", "jigaboo", "jigg", "jigga", "jiggabo", "jigger", "jiggy", "jihad", "jijjiboo", "jimfish", "jism", "jiz", "jizim", "jizjuice", "jizm", "jizz", "jizzim", "jizzum", "joint", "juggalo", "jugs", "junglebunny", "kaffer", "kaffir", "kaffre", "kafir", "kanake", "kid", "kigger", "kike", "kill", "killed", "killer", "killing", "kills", "kink", "kinky", "kissass", "kkk", "knife", "knockers", "kock", "kondum", "koon", "kotex", "krap", "krappy", "kraut", "kum", "kumbubble", "kumbullbe", "kummer", "kumming", "kumquat", "kums", "kunilingus", "kunnilingus", "kunt", "ky", "kyke", "lactate", "laid", "lapdance", "latin", "lesbain", "lesbayn", "lesbian", "lesbin", "lesbo", "lez", "lezbe", "lezbefriends", "lezbo", "lezz", "lezzo", "liberal", "libido", "licker", "lickme", "lies", "limey", "limpdick", "limy", "lingerie", "liquor", "livesex", "loadedgun", "lolita", "looser", "loser", "lotion", "lovebone", "lovegoo", "lovegun", "lovejuice", "lovemuscle", "lovepistol", "loverocket", "lowlife", "lsd", "lubejob", "lucifer", "luckycammeltoe", "lugan", "lynch", "macaca", "mad", "mafia", "magicwand", "mams", "manhater", "manpaste", "marijuana", "mastabate", "mastabater", "masterbate", "masterblaster", "mastrabator", "masturbate", "masturbating", "mattressprincess", "meatbeatter", "meatrack", "meth", "mexican", "mgger", "mggor", "mickeyfinn", "mideast", "milf", "minority", "mockey", "mockie", "mocky", "mofo", "moky", "moles", "molest", "molestation", "molester", "molestor", "moneyshot", "mooncricket", "mormon", "moron", "moslem", "mosshead", "mothafuck", "mothafucka", "mothafuckaz", "mothafucked", "mothafucker", "mothafuckin", "mothafucking", "mothafuckings", "motherfuck", "motherfucked", "motherfucker", "motherfuckin", "motherfucking", "motherfuckings", "motherlovebone", "muff", "muffdive", "muffdiver", "muffindiver", "mufflikcer", "mulatto", "muncher", "munt", "murder", "murderer", "muslim", "naked", "narcotic", "nasty", "nastybitch", "nastyho", "nastyslut", "nastywhore", "nazi", "necro", "negro", "negroes", "negroid", "negros", "nig", "niger", "nigerian", "nigerians", "nigg", "nigga", "niggah", "niggaracci", "niggard", "niggarded", "niggarding", "niggardliness", "niggardlinesss", "niggardly", "niggards", "niggards", "niggaz", "nigger", "niggerhead", "niggerhole", "niggers", "niggers", "niggle", "niggled", "niggles", "niggling", "nigglings", "niggor", "niggur", "niglet", "nignog", "nigr", "nigra", "nigre", "nip", "nipple", "nipplering", "nittit", "nlgger", "nlggor", "nofuckingway", "nook", "nookey", "nookie", "noonan", "nooner", "nude", "nudger", "nuke", "nutfucker", "nymph", "ontherag", "oral", "orga", "orgasim", "orgasm", "orgies", "orgy", "osama", "paki", "palesimian", "palestinian", "pansies", "pansy", "panti", "panties", "payo", "pearlnecklace", "peck", "pecker", "peckerwood", "pee", "peehole", "pee-pee", "peepshow", "peepshpw", "pendy", "penetration", "peni5", "penile", "penis", "penises", "penthouse", "period", "perv", "phonesex", "phuk", "phuked", "phuking", "phukked", "phukking", "phungky", "phuq", "pi55", "picaninny", "piccaninny", "pickaninny", "piker", "pikey", "piky", "pimp", "pimped", "pimper", "pimpjuic", "pimpjuice", "pimpsimp", "pindick", "piss", "pissed", "pisser", "pisses", "pisshead", "pissin", "pissing", "pissoff", "pistol", "pixie", "pixy", "playboy", "playgirl", "pocha", "pocho", "pocketpool", "pohm", "polack", "pom", "pommie", "pommy", "poo", "poon", "poontang", "poop", "pooper", "pooperscooper", "pooping", "poorwhitetrash", "popimp", "porchmonkey", "porn", "pornflick", "pornking", "porno", "pornography", "pornprincess", "pot", "poverty", "premature", "pric", "prick", "prickhead", "primetime", "propaganda", "pros", "prostitute", "protestant", "pu55i", "pu55y", "pube", "pubic", "pubiclice", "pud", "pudboy", "pudd", "puddboy", "puke", "puntang", "purinapricness", "puss", "pussie", "pussies", "pussy", "pussycat", "pussyeater", "pussyfucker", "pussylicker", "pussylips", "pussylover", "pussypounder", "pusy", "quashie", "queef", "queer", "quickie", "quim", "ra8s", "rabbi", "racial", "racist", "radical", "radicals", "raghead", "randy", "rape", "raped", "raper", "rapist", "rearend", "rearentry", "rectum", "redlight", "redneck", "reefer", "reestie", "refugee", "reject", "remains", "rentafuck", "republican", "rere", "retard", "retarded", "ribbed", "rigger", "rimjob", "rimming", "roach", "robber", "roundeye", "rump", "russki", "russkie", "sadis", "sadom", "samckdaddy", "sandm", "sandnigger", "satan", "scag", "scallywag", "scat", "schlong", "screw", "screwyou", "scrotum", "scum", "semen", "seppo", "servant", "sex", "sexed", "sexfarm", "sexhound", "sexhouse", "sexing", "sexkitten", "sexpot", "sexslave", "sextogo", "sextoy", "sextoys", "sexual", "sexually", "sexwhore", "sexy", "sexymoma", "sexy-slim", "shag", "shaggin", "shagging", "shat", "shav", "shawtypimp", "sheeney", "shhit", "shinola", "shit", "shitcan", "shitdick", "shite", "shiteater", "shited", "shitface", "shitfaced", "shitfit", "shitforbrains", "shitfuck", "shitfucker", "shitfull", "shithapens", "shithappens", "shithead", "shithouse", "shiting", "shitlist", "shitola", "shitoutofluck", "shits", "shitstain", "shitted", "shitter", "shitting", "shitty", "shoot", "shooting", "shortfuck", "showtime", "sick", "sissy", "sixsixsix", "sixtynine", "sixtyniner", "skank", "skankbitch", "skankfuck", "skankwhore", "skanky", "skankybitch", "skankywhore", "skinflute", "skum", "skumbag", "slant", "slanteye", "slapper", "slaughter", "slav", "slave", "slavedriver", "sleezebag", "sleezeball", "slideitin", "slime", "slimeball", "slimebucket", "slopehead", "slopey", "slopy", "slut", "sluts", "slutt", "slutting", "slutty", "slutwear", "slutwhore", "smack", "smackthemonkey", "smut", "snatch", "snatchpatch", "snigger", "sniggered", "sniggering", "sniggers", "sniggers", "sniper", "snot", "snowback", "snownigger", "sob", "sodom", "sodomise", "sodomite", "sodomize", "sodomy", "sonofabitch", "sonofbitch", "sooty", "sos", "soviet", "spaghettibender", "spaghettinigger", "spank", "spankthemonkey", "sperm", "spermacide", "spermbag", "spermhearder", "spermherder", "spic", "spick", "spig", "spigotty", "spik", "spit", "spitter", "splittail", "spooge", "spreadeagle", "spunk", "spunky", "squaw", "stagg", "stiffy", "strapon", "stringer", "stripclub", "stroke", "stroking", "stupid", "stupidfuck", "stupidfucker", "suck", "suckdick", "sucker", "suckme", "suckmyass", "suckmydick", "suckmytit", "suckoff", "suicide", "swallow", "swallower", "swalow", "swastika", "sweetness", "syphilis", "taboo", "taff", "tampon", "tang", "tantra", "tarbaby", "tard", "teat", "terror", "terrorist", "teste", "testicle", "testicles", "thicklips", "thirdeye", "thirdleg", "threesome", "threeway", "timbernigger", "tinkle", "tit", "titbitnipply", "titfuck", "titfucker", "titfuckin", "titjob", "titlicker", "titlover", "tits", "tittie", "titties", "titty", "tnt", "toilet", "tongethruster", "tongue", "tonguethrust", "tonguetramp", "tortur", "torture", "tosser", "towelhead", "trailertrash", "tramp", "trannie", "tranny", "transexual", "transsexual", "transvestite", "triplex", "trisexual", "trojan", "trots", "tuckahoe", "tunneloflove", "turd", "turnon", "twat", "twink", "twinkie", "twobitwhore", "uck", "unfuckable", "upskirt", "uptheass", "upthebutt", "urinary", "urinate", "urine", "usama", "uterus", "vagina", "vaginal", "vatican", "vibr", "vibrater", "vibrator", "vietcong", "violence", "virgin", "virginbreaker", "vomit", "vulva", "wab", "wank", "wanker", "wanking", "waysted", "weapon", "weenie", "weewee", "welcher", "welfare", "wetb", "wetback", "wetspot", "whacker", "whash", "whigger", "whiskey", "whiskeydick", "whiskydick", "whit", "whitenigger", "whites", "whitetrash", "whitey", "whiz", "whop", "whore", "whorefucker", "whorehouse", "wigger", "willie", "williewanker", "willy", "wn", "wog", "womens", "wop", "wtf", "wuss", "wuzzie", "xtc", "xxx", "yankee", "yellowman", "zigabo", "zipperhead"]
  }, function() {
    console.log('finished populating things');
  });
});

Department.find({}).remove(function() {
  Department.create({
      name: 'Admin',
      subdepartment: [{
        name: 'Admin'
      }],
      deleted: false
    }, {
      name: 'Development and Society',
      subdepartment: [{
        name: 'Natural and Built Environment'
      }, {
        name: 'SIOE'
      }, {
        name: 'Psychology, Sociology and Politics'
      }, {
        name: 'Humanities'
      }, {
        name: 'Law and Criminology'
      }, {
        name: 'TESOL Centre'
      }],
      deleted: false
    }, {
      _id: '56a7d95746b9e7db57417309',
      name: 'ACES',
      subdepartment: [{
        name: 'Computing',
        _id: '56a784189212039d536d6098',
        groups: [{
          course: 'Software Engineering',
          name: "SE3U",
          users: ["56a7886405ab050a54d4eaa5", "56a7886405ab050a54d4eaa6"],
          tutors: [{
            tutor: "56a35bce4d9999381aa483db"
          }]
        }, {
          course: 'Computer Science',
          name: "CS3U",
          users: ["56a7bf8a800c479155488fce", "56a7afd3259ef46f559880c9"],
          tutors: [{
            tutor: "56a35bce4d9999381aa483db"
          }]
        }]
      }, {
        name: 'Engineering and Mathematics'
      }, {
        name: 'SIA'
      }, {
        name: 'Media Arts and Communication'
      }],
      deleted: false
    }, {
      name: 'Health and Wellbeing',
      subdepartment: [{
        name: 'Allied Health Professions'
      }, {
        name: 'Biosciences'
      }, {
        name: 'Nursing and Midwifery'
      }, {
        name: 'Sport and Physical Activity Academy'
      }, {
        name: 'Social Work and Social Care'
      }],
      deleted: false
    }, {
      name: 'Business',
      subdepartment: [{
        name: 'Finance, Accounting and Business Systems'
      }, {
        name: 'Management'
      }, {
        name: 'Service Sector Management'
      }],
      deleted: false
    },
    function() {
      console.log('finished populating department');
      User.find({}).remove(function() {
        User.create({
          role: 'admin',
          name: 'JoBa',
          email: 'JoBa@uniqa.co.uk',
          password: 'Josh1992',
          department: '56a7d95746b9e7db57417309'
        }, {
          role: 'tutor',
          name: 'Test Teacher',
          email: 'teacher@shu.ac.uk',
          password: 'tutor',
          department: '56a7d95746b9e7db57417309'
        }, {
          name: 'Test Student',
          role: 'student',
          email: 'student@shu.ac.uk',
          password: 'student',
          department: '56a7d95746b9e7db57417309'
        }, {
          _id: '56a7bf8a800c479155488fce',
          name: 'JD',
          role: 'student',
          email: 'jd@shu.ac.uk',
          password: 'jd',
          department: '56a7d95746b9e7db57417309'
        }, {
          name: 'Jack McGlone',
          role: 'student',
          email: 'jack.mcblown@shu.ac.uk',
          password: 'mcblown',
          department: '56a7d95746b9e7db57417309'
        }, {
          name: 'Chad Skimpson',
          role: 'student',
          email: 'chad.simpson@shu.ac.uk',
          password: 'Chad',
          department: '56a7d95746b9e7db57417309'
        }, {
          _id: '56a7afd3259ef46f559880c9',
          name: 'Alexis Parks',
          role: 'student',
          email: 'ap@shu.ac.uk',
          passcode: 9493265230,
          department: '56a7d95746b9e7db57417309'
        }, {
          _id: '56a35bce4d9999381aa483db',
          name: 'JoBa',
          role: 'tutor',
          email: 'JoBa@shu.ac.uk',
          password: 'Josh1992',
          department: '56a7d95746b9e7db57417309'
        }, {
          _id: "56a7886405ab050a54d4eaa5",
          name: 'Jeff',
          role: 'student',
          email: 'jeff@shu.ac.uk',
          passcode: 9493265230,
          department: '56a7d95746b9e7db57417309'
        }, {
          _id: "56a7886405ab050a54d4eaa6",
          name: 'Bill',
          role: 'student',
          email: 'Bill@shu.ac.uk',
          password: 'Bill',
          department: '56a7d95746b9e7db57417309'
        }, {
          name: 'Alex',
          role: 'tutor',
          email: 'alexs@shu.ac.uk',
          passcode: 9493265230,
          department: '56a7d95746b9e7db57417309'
        }, function() {
          console.log('finished populating users');
        });
        // Add groups here?
        //   Group.find({}).remove(function() {
        //     Group.create({
        //         course: 'Software Engineering',
        //         name: "SE3U",
        //         subdep: "56a784189212039d536d6098",
        //         $push: [{
        //           "users": "56a7886405ab050a54d4eaa5"
        //         }, {
        //           "users": "56a7886405ab050a54d4eaa6"
        //         }],
        //         tutor: "56a35bce4d9999381aa483db"
        //       }
        //       /*, {
        //                     createdBy: '56a35bce4d9999381aa483db',
        //                     name: "MAD No1",
        //                     desc: "Descriptive element for MAD no1",
        //                     startTime: moment.utc([2016, 1, 23, 12, 30, 0]),
        //                     endTime: moment.utc([2016, 1, 23, 14, 0, 0]),
        //                     qActiveAllowance: 10
        //       		  }*/
        //       ,
        //       function(error) {
        //         if (error) {
        //           console.log(error);
        //         } else {
        //           console.log('finished populating groups');
        //         }
        //       })
        //   });
        Lecture.find({}).remove(function() {
          Lecture.create({
            createdBy: '56a35bce4d9999381aa483db',
            name: "MAD No1",
            desc: "Descriptive element for MAD no1",
            startTime: moment.utc([2016, 1, 23, 12, 30, 0]),
            endTime: moment.utc([2016, 1, 23, 14, 0, 0]),
            qActiveAllowance: 10
          }, {
            createdBy: '56a35bce4d9999381aa483db',
            name: "MAD No2",
            desc: "Descriptive element for MAD no2",
            startTime: moment.utc([2016, 1, 23, 16, 0, 0]),
            endTime: moment.utc([2016, 1, 23, 17, 0, 0]),
            qActiveAllowance: 10
          }, {
            createdBy: '56a35bce4d9999381aa483db',
            name: "CSSD No1",
            desc: "Descriptive element for Case Studies No1",
            startTime: moment.utc([2016, 3, 20, 12, 0, 0]),
            endTime: moment.utc([2016, 3, 20, 13, 0, 0]),
            qActiveAllowance: 10
          }, {
            createdBy: '56a35bce4d9999381aa483db',
            name: "CSSD No2",
            desc: "Descriptive element for Case Studies No2",
            startTime: moment.utc([2016, 5, 20, 12, 0, 0]),
            endTime: moment.utc([2016, 5, 20, 13, 0, 0]),
            qActiveAllowance: 10
          }, {
            createdBy: '56a35bce4d9999381aa483db',
            name: "CSSD No3",
            desc: "Descriptive element for Case Studies No3",
            startTime: moment.utc([2016, 6, 20, 12, 0, 0]),
            endTime: moment.utc([2016, 6, 20, 13, 0, 0]),
            qActiveAllowance: 10
          }, {
            createdBy: '56a35bce4d9999381aa483db',
            name: "MAD No3",
            desc: "Descriptive element for no3",
            startTime: moment.utc([2016, 7, 20, 12, 0, 0]),
            endTime: moment.utc([2016, 7, 20, 13, 0, 0]),
            qActiveAllowance: 10
          }, {
            createdBy: '56a35bce4d9999381aa483db',
            name: "SEGM No1",
            desc: "Descriptive element for SEGM No1",
            startTime: moment.utc([2016, 8, 20, 12, 0, 0]),
            endTime: moment.utc([2016, 8, 20, 13, 0, 0]),
            qActiveAllowance: 10
          }, {
            createdBy: '56a35bce4d9999381aa483db',
            name: "SEGM No2",
            desc: "Descriptive element for SEGM No2",
            startTime: moment.utc([2016, 9, 20, 12, 0, 0]),
            endTime: moment.utc([2016, 9, 20, 13, 0, 0]),
            qActiveAllowance: 10
          }, {
            createdBy: '56a35bce4d9999381aa483db',
            name: "AAF No1",
            desc: "Descriptive element for AAF No1",
            startTime: moment.utc([2016, 10, 20, 8, 0, 0]),
            endTime: moment.utc([2016, 10, 20, 10, 0, 0]),
            qActiveAllowance: 10
          }, {
            createdBy: '56a35bce4d9999381aa483db',
            name: "AAF No2",
            desc: "Descriptive element for AAF No2",
            startTime: moment.utc([2016, 11, 20, 13, 0, 0]),
            endTime: moment.utc([2016, 11, 20, 14, 0, 0]),
            qActiveAllowance: 10
          }, {
            createdBy: '56a35bce4d9999381aa483db',
            name: "AAF No3",
            desc: "Descriptive element for AAF No3",
            startTime: moment.utc([2016, 7, 11, 15, 0, 0]),
            endTime: moment.utc([2016, 7, 11, 16, 0, 0]),
            qActiveAllowance: 10
          }, {
            createdBy: '56a35bce4d9999381aa483db',
            name: "MAD No12",
            desc: "Descriptive element for no12",
            startTime: moment.utc([2016, 7, 11, 16, 0, 0]),
            endTime: moment.utc([2016, 7, 11, 17, 0, 0]),
            qActiveAllowance: 10
          }, function(error) {
            if (error) {
              console.log(error);
            } else {
              console.log('finished populating Lectures');
              // populate QRs for these lectures
              Lecture.find({}, function(err, lectures) {
                Qr.find({}).remove(function() {
                  lectures.forEach(function(lecture) {
                    // console.info(lecture._id);
                    // console.info(lecture.createdBy);
                    Qr.create({
                      lecture: lecture._id,
                      createdBy: lecture.createdBy
                    }, function(err, qr) {
                      if (err) {
                        console.info(err);
                      } else {
                        Thing.find({
                          name: 'qrBaseURL'
                        }, function(err, thing) {
                          //   console.log(lecture.name);
                          var serverBase = thing[0].content; // just the one
                          Thing.find({
                            name: 'accessCodeLen'
                          }, function(err, thing) {
                            var altAccKeyLen = thing[0].content; // just the one
                            createUniqueAccKey(altAccKeyLen, function(altAccessKey) {
                              lecture.altAccess = altAccessKey;
                              var url = String(serverBase + '/' + qr._id + '/group/' + 'temp' + '/register');

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

                              Qr.findById(qr._id).exec(function(err, uQr) {
                                if (err) {
                                  console.info(err);
                                } else if (!uQr) {

                                } else {
                                  lecture.qr = qr._id;
                                  uQr.url = url;
                                  uQr.svg = qrSvgString;
                                  uQr.save(function(err) {
                                    if (err) {
                                      console.info(err);
                                    }
                                    lecture.qr = qr._id;
                                    lecture.save(function(err, lecture) {
                                      if (err) {
                                        console.info(err);
                                      } else {
                                        console.log('populated qr for ' + lecture.name);
                                      }
                                    });
                                  });
                                }
                              });
                            });
                          });
                        });
                      }
                    });
                  });
                });
              });
            }
          });
        });
      });
    });
});

/*
'2016-2017': [new Date(2016, 09, 26, 23, 59, 59, 0).toISOString(), new Date(2017, 09, 25, 23, 59, 59, 0).toISOString()],
'2015-2016': [new Date(2015, 09, 24, 23, 59, 59, 0).toISOString(), new Date(2016, 09, 23, 23, 59, 59, 0).toISOString()]
*/