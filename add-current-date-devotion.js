const fs = require('fs');
const path = require('path');

// Get current date in YYYY-MM-DD format
const currentDate = new Date().toISOString().split('T')[0];

// Devotion data for each language
const devotionsData = {
  en: {
    id: `${currentDate}-morning`,
    date: currentDate,
    timeOfDay: 'morning',
    title: "Today's Morning Devotion",
    signOfTheCross: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
    confession: "Most merciful God, we confess that we have sinned against you in thought, word, and deed, by what we have done, and by what we have left undone. We have not loved you with our whole heart; we have not loved our neighbors as ourselves. We are truly sorry and we humbly repent. For the sake of your Son Jesus Christ, have mercy on us and forgive us; that we may delight in your will, and walk in your ways, to the glory of your Name. Amen.",
    psalmForTheDay: {
      reference: "Psalm 119:105",
      title: "Your Word is a Lamp",
      text: "Your word is a lamp to my feet and a light to my path."
    },
    gloriaPatri: "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
    readings: {
      oldTestament: {
        reference: "Psalm 23",
        title: "The Lord is My Shepherd",
        text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He leads me in paths of righteousness for his name's sake. Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me. You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows. Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the Lord forever."
      },
      canticle1: {
        reference: "Canticle of the Sun",
        title: "Canticle of St. Francis",
        text: "Most high, all-powerful, all-good Lord! All praise is Yours, all glory, all honor, and all blessing. To You, alone, Most High, do they belong. No mortal lips are worthy to pronounce Your Name. Praised be You, my Lord, through all your creatures, especially through my lord Brother Sun, who brings the day; and You give light through him. And he is beautiful and radiant in all his splendor! Of You, Most High, he bears the likeness. Praised be You, my Lord, through Sister Moon and the stars; in the heavens You have made them bright, precious and beautiful."
      },
      newTestament: {
        reference: "Matthew 5:1-12",
        title: "The Beatitudes",
        text: "Seeing the crowds, he went up on the mountain, and when he sat down, his disciples came to him. And he opened his mouth and taught them, saying: \"Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they shall be comforted. Blessed are the meek, for they shall inherit the earth. Blessed are those who hunger and thirst for righteousness, for they shall be satisfied. Blessed are the merciful, for they shall receive mercy. Blessed are the pure in heart, for they shall see God. Blessed are the peacemakers, for they shall be called sons of God. Blessed are those who are persecuted for righteousness' sake, for theirs is the kingdom of heaven. Blessed are you when others revile you and persecute you and utter all kinds of evil against you falsely on my account. Rejoice and be glad, for your reward is great in heaven, for so they persecuted the prophets who were before you.\""
      },
      canticle2: {
        reference: "Canticle of Mary",
        title: "Magnificat",
        text: "My soul magnifies the Lord, and my spirit rejoices in God my Savior, because he has looked on the humble estate of his servant. For behold, from now on all generations will call me blessed; for he who is mighty has done great things for me, and holy is his name. And his mercy is for those who fear him from generation to generation. He has shown strength with his arm; he has scattered the proud in the thoughts of their hearts; he has brought down the mighty from their thrones and exalted those of humble estate; he has filled the hungry with good things and sent the rich away empty. He has helped his servant Israel, remembering his mercy, as he spoke to our fathers, to Abraham and to his offspring forever."
      },
      gospel: {
        reference: "John 3:16-17",
        title: "For God So Loved the World",
        text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life. For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him."
      }
    },
    apostlesCreed: "I believe in God, the Father almighty, creator of heaven and earth. I believe in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried; he descended to the dead. On the third day he rose again; he ascended into heaven, he is seated at the right hand of the Father, and he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and the life everlasting. Amen.",
    prayers: {
      lordsPrayer: "Our Father, who art in heaven, hallowed be thy name. Thy kingdom come, thy will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. For thine is the kingdom, and the power, and the glory, forever and ever. Amen.",
      prayerToStMichael: "St. Michael the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil; May God rebuke him, we humbly pray; And do thou, O Prince of the Heavenly Host, by the power of God, thrust into hell Satan and all evil spirits who wander through the world for the ruin of souls. Amen.",
      collect: "Almighty God, we thank you for the gift of this day. As we begin our journey through this day, grant us the wisdom to see your hand in all things, the courage to follow your will, and the faith to trust in your providence. May this day be filled with your peace, your joy, and your abundant blessings. Through Jesus Christ our Lord. Amen."
    },
    signOfTheCrossEnd: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
    reflection: "As we begin this day, let us remember God's love for us as shown through His Word and His Son Jesus Christ. May we walk in His light and follow His guidance throughout all our days.",
    metadata: {
      liturgicalSeason: "ordinary",
      feast: "",
      source: "Book of Common Prayer",
      sourceReference: "Prayer Guide PDF, Pages 8-20",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  et: {
    id: `${currentDate}-morning`,
    date: currentDate,
    timeOfDay: 'morning',
    title: "Tänane hommikupalve",
    signOfTheCross: "Isa, Poja ja Pühase Vaimu nimel. Aamen.",
    confession: "Halastav meie Jumal, me tunnistame, et oleme pattu teinud Sinu vastu mõttes, sõnas ja teos, selle läbi, mida oleme teinud, ja selle läbi, mida oleme jätnud tegemata. Me ei ole armastanud Sind kogu oma südamega; me ei ole armastanud oma ligimesi nagu iseennast. Me kahetseme tõeliselt ja sügavalt. Oma Poja Jeesuse Kristuse pärast halasta meile ja anna meile andeks; et me võiksime rõõmustada Sinu tahtes ja käia Sinu teedel, Sinu nime auks. Aamen.",
    psalmForTheDay: {
      reference: "Psalm 119:105",
      title: "Sinu sõna on kaug",
      text: "Sinu sõna on kaug minu jalule ja valgus minu teele."
    },
    gloriaPatri: "Au olgu Isale ja Pojale ja Pühale Vaimule, nagu oli alguses, on nüüd ja jääb igavesti, maailmata lõpuni. Aamen.",
    readings: {
      oldTestament: {
        reference: "Psalm 23",
        title: "Issand on mu lammasotsija",
        text: "Issand on mu lammasotsija; mul ei ole puudust. Ta teeb mind magama rohelistel õedel. Ta viibib mind vaiksete veede kõrval. Ta värskendab mu hingi. Ta viibib mind õiguse teedel oma nime auks. Isegi kui ma kõndin surma varju orus, ma ei karda kurju, sest sa oled minuga; sinu ridu ja sinu staf, nad meeldivad mind. Sa valmistad mulle lauda minu vaenlaste ees; sa maitsed mu pea õliga; mu tassi üleb ümber. Kindlasti heaolu ja halastus järgib mind kõikide minu elupäevade jooksul, ja ma elan Issanda majas igavesti."
      },
      canticle1: {
        reference: "Päike kaantikeel",
        title: "Püha Franciscuse kaantikeel",
        text: "Kõigevägev, kõigivõimeline, kõigihuviline Issand! Kõik kiitus on sulle, kõik au, kõik auks ja kõik õnnistus. Sinule, üksinda, kõigevägevale, kuuluvad nad. Ei ole surnukate huult, mis väärtusega on Sinu nime välja ütlemiseks. Kiidetud saad, mu Issand, kõikide Sinu loomade kaudu, eriti mu herra vend Päike, kes toob päeva; ja sa annad valgust tema kaudu. Ja ta on ilus ja särav kogu oma maagilisus! Sinu, kõigevägevale, ta kannab võrdlus. Kiidetud saad, mu Issand, õde Kuu ja tähtede kaudu; taevas Sa olete teinud neid heledaks, väärtuslikuks ja ilusaks."
      },
      newTestament: {
        reference: "Matteuse 5:1-12",
        title: "Beatitudid",
        text: "Nähes rahvahulk, ta läks mäele, ja kui ta istus alla, tulid tema jüngrid temasse. Ja ta avas oma suud ja õpetas neile, ütlevad: \"Õnnistatud on need, kes on vaimus vaesed, sest nende jaoks on taevase riigi. Õnnistatud on need, kes kaastundavad, sest nad saavad lohutust. Õnnistatud on need, kes on nõrgad, sest nad pärinevad maa. Õnnistatud on need, kes nälgivad ja jooksevad õiguse pärast, sest nad saavad rahulolekut. Õnnistatud on need, kes on halastavad, sest nad saavad halastust. Õnnistatud on need, kes on südamelt puhased, sest nad näevad Jumalat. Õnnistatud on rahuloodjad, sest nad saavad kutsutud Jumala pojadeks. Õnnistatud on need, kes on õiguse pärast tagakiusatud, sest nende jaoks on taevase riigi. Õnnistatud sa oled, kui teised teid vääritavad ja tagakiusavad teid ja ütlevad kõik sortsi pahad asjad teie vastu valesti minu nimel. Õnnistatud ja õnnistatud, sest teie palk on suur taevas, sest nad tagakiusasid prohvetteid, kes olid teie ees."
      },
      canticle2: {
        reference: "Maaria kaantikeel",
        title: "Magnificat",
        text: "Minu hing ülistab Issandat, ja minu vaim rõõmustab Jumalas, minu Päästjas, sest Ta on vaadanud oma teenija ühine elu. Sest näha, alates nüüdst kõigi põlvkondadeks kutsutakse mind õnnistatud; sest see, kes on vägev, on teinud minu jaoks suuri asju, ja tema nimi on püha. Ja tema halastus on neile, kes teda karda põlvkondadest põlvkonda. Ta on näidanud jõudu oma käärme kaudu; Ta on hajutanud uhked oma südame mõttetes; Ta on võidnud vägevad oma troonidest ja tõstnud üles ühise elu inimesi; Ta on täitnud nälgid head asjadega ja saatnud jõude tühjaks. Ta on aidanud oma teenijale Iisraelile, meenutades oma halastust, nagu Ta rääkis meie isaadele, Abrahamile ja tema järglastele igavesti."
      },
      gospel: {
        reference: "Johanese 3:16-17",
        title: "Sest Jumal armastas maailma nii palju",
        text: "Sest Jumal armastas maailma nii palju, et Ta andis oma ainusündinud Poja, et kõik, kes teda usuvad, ei hukuks, vaid igavest elu saaks. Sest Jumal ei saanud oma Poja maailma ette, et maailma mõistaks, vaid et maailm võiks Ta kaudu päästuda."
      }
    },
    apostlesCreed: "Ma usun Jumalasse, kõigeväelisse Isasse, taeva ja maa Loojasse. Ja Jeesusesse Kristusesse, Tema ainusündinud Pojasse, meie Issandasse, kes on saadud Pühast Vaimust, sündinud neitsist Maarjast, kannatanud Pontius Pilatuse all, risti löödud, surnud ja maetud, läinud alla põrgusse, kolmandal päeval üles tõusnud surnuist, läinud üles taevasse, istub Jumala, kõigeväelise Isa paremal käel, sealt Ta tuleb kohut mõistma elavate ja surnute üle. Ma usun Pühasse Vaimusse, pühasse üldkirikusse, pühade osadust, pattude andeksandmist, ihu ülesärkamist ja igavest elu. Aamen.",
    prayers: {
      lordsPrayer: "Meie Isa, kes Sa oled taevas! Pühitsetud olgu Sinu nimi. Sinu riik tulgu. Sinu tahtmine sündigu nagu taevas, nõnda ka maa peal. Meie igapäevast leiba anna meile täna. Ja anna meile andeks meie võlad, nagu meiegi andeks anname oma võlglastele. Ja ära saada meid kiusatusse, vaid päästa meid kurjast. Sest Sinu on riik ja vägi ja au igavesti. Aamen.",
      prayerToStMichael: "Püha Mihkel, arhangels, kaitsege meid sõjas. Ole meie kaitsmine kurjuse ja kurjuse vaimude vastu; Las Jumal teda krahvaks, me alandlikult palvetame; Ja sa, O Taeva armee prints, Jumala väe kaudu, lükkake põrgu Satan ja kõik kurjad vaimud, kes ringlevad maailmas hinge hävitamiseks. Aamen.",
      collect: "Kõigevägev Jumal, me täname Sind selle päeva eest. Kui alustame meie teekonda selle päeva läbi, anna meile tarkust näha Sinu käest kõikides asjadest, jõudu järgida Sinu tahtele ja usku, et usaldada Sinu valitsemist. Või see päev on täidetud Sinu rahuga, Sinu rõõmuga ja Sinu piisavalt õnnistustega. Jeesuse Kristuse, meie Issanda kaudu. Aamen."
    },
    signOfTheCrossEnd: "Isa, Poja ja Pühase Vaimu nimel. Aamen.",
    reflection: "Kui alustame seda päeva, las me meenutame Jumala armastust meie vastu, nagu see on nähtud Tema Sõna ja Tema Poja Jeesus Kristuse kaudu. Või me kõndida Sinu valguses ja järgida Sinu juhtimist kõikide meie päevade jooksul.",
    metadata: {
      liturgicalSeason: "tavaline",
      feast: "",
      source: "Ühine palveraamat",
      sourceReference: "Prayer Guide PDF, Leheküljed 8-20",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  tl: {
    id: `${currentDate}-morning`,
    date: currentDate,
    timeOfDay: 'morning',
    title: "Ang Pangunahing Panalangin Ngayon",
    signOfTheCross: "Sa pangalan ng Ama, at ng Anak, at ng Banal na Espiritu. Amen.",
    confession: "Maawain naming Diyos, inamin namin na nagkasala kami laban sa Inyo sa pamamagitan ng aming isip, salita, at gawa, sa mga ginawa namin, at sa mga hindi namin ginawa. Hindi namin minahal kayo ng buong puso; hindi namin minahal ang aming kapwa tulad ng pagmamahal namin sa aming sarili. Tunay kaming nagsisisi at lubos kaming nagsisisi. Dahil sa inyong Anak na si Jesucristo, maawa kayo sa amin at patawarin kami; upang kami ay matuwa sa Inyong kalooban, at lumakad sa Inyong mga daan, sa kaluwalhatian ng Inyong Pangalan. Amen.",
    psalmForTheDay: {
      reference: "Awit 119:105",
      title: "Ang Iyong Salita ay isang Lampara",
      text: "Ang iyong salita ay isang lampara sa aking mga paa at ilaw sa aking daan."
    },
    gloriaPatri: "Luwalhati sa Diyos sa kaitaasan, at sa lupa ay kapayapaan sa mga taong may mabuting kalooban. Pinupuri namin Kayo, pinagmamalaki namin Kayo, sinasamba namin Kayo, niluluwalhati namin Kayo, nagpapasalamat kami sa Inyo dahil sa inyong dakila at malaking kaluwalhatian.",
    readings: {
      oldTestament: {
        reference: "Awit 23",
        title: "Ang Panginoon ang Aking Mag aalaga ng mga Tupa",
        text: "Ang Panginoon ang aking mag-aalaga ng mga tupa; hindi ako magkakaroon ng kakulangan. Ginagawa niya akong humiga sa luntiang pastulan. Pinapunta niya ako sa tabi ng malalambing na tubig. Pinapagaling niya ang aking kaluluwa. Pinapunta niya ako sa daan ng katuwiran para sa kanyang pangalan. Kahit na ako ay maglalakad sa lambak ng anino ng kamatayan, hindi ako matatakot sa kasamaan, dahil ikaw ay kasama ko; ang iyong tungkod at iyong staff, ang iyong mga sandata ay nagpapalagay sa akin ng kapanatagan. Naghahanda ka ng mesa para sa akin sa harap ng aking mga kaaway; inaani mo ang aking ulo ng langis; ang aking tasa ay umaapaw. Tiyak na ang kabutihan at awa ay susunod sa akin sa lahat ng araw ng aking buhay, at ako ay maninirahan sa bahay ng Panginoon magpakailanman."
      },
      canticle1: {
        reference: "Canticle of the Sun",
        title: "Canticle ni San Francis",
        text: "Pinakamataas na, pinakamakapangyarihan, pinakabuti na Panginoon! Lahat ng papuri ay para sa iyo, lahat ng kaluwalhatian, lahat ng karangalan, at lahat ng pagpapala. Sa iyo, nag-iisa, Pinakamataas na, ang mga ito ay kabilang. Walang makapagbibigay ng wastong pagbabasa sa iyong pangalan. Pinupuri ka, aking Panginoon, sa pamamagitan ng lahat ng iyong mga nilalang, lalo na sa pamamagitan ng aking kapatid na si Kapatid na Araw, na nagdadala ng araw; at ikaw ay nagbibigay ng liwanag sa pamamagitan niya. At siya ay maganda at maliliwanag sa lahat ng kanyang kagandahan! Sa iyo, Pinakamataas na, siya ay nagbibigay ng pagkakahalintulad. Pinupuri ka, aking Panginoon, sa pamamagitan ng kapatid na Buwan at ng mga bituin; sa langit mo sila ginawang maliliwanag, mahalaga at maganda."
      },
      newTestament: {
        reference: "Mateo 5:1-12",
        title: "Ang Mga Beatitudo",
        text: "Nakita niya ang mga tao, tumayo siya sa bundok, at kapag siya ay umupo, ang kanyang mga alagad ay lumapit sa kanya. At binuksan niya ang kanyang bibig at tinuruan sila, na sinasabi: \"Mapalad ang mga mahirap sa espiritu, dahil sa kanila ang kaharian ng langit. Mapalad ang mga nagdadalamhati, dahil sila ay pagpapalain. Mapalad ang mga mahina, dahil sila ay manunuluyan sa lupa. Mapalad ang mga nagugutom at nauuhaw sa katuwiran, dahil sila ay mabibigyan ng kasiyahan. Mapalad ang mga magpapatawad, dahil sila ay magkakaroon ng kapatawaran. Mapalad ang mga malinis sa puso, dahil sila ay makikita ang Diyos. Mapalad ang mga gumagawa ng kapayapaan, dahil sila ay tatawaging mga anak ng Diyos. Mapalad ang mga tinuturing na masama para sa katuwiran, dahil sa kanila ang kaharian ng langit. Mapalad ka kapag ibang tao ay nagsasabi ng masama sa iyo at tinuturing ka na masama sa aking pangalan. Magalak at magalak, dahil ang iyong gantimpala ay malaki sa langit, dahil sa ganito sila tinuring ng mga propeta na nauna sa iyo.\""
      },
      canticle2: {
        reference: "Canticle of Mary",
        title: "Magnificat",
        text: "Ang aking kaluluwa ay nagpupuri sa Panginoon, at ang aking espiritu ay nagnanais sa Diyos na aking Tagapagligtas, dahil tinignan niya ang kahinaan ng kanyang lingkod. Dahil ngayon, lahat ng mga henerasyon ay tatawagin akong mapalad; dahil ang makapangyarihan ay gumawa ng malalaking bagay para sa akin, at banal ang kanyang pangalan. At ang kanyang awa ay para sa mga takot sa kanya mula sa mga henerasyon hanggang sa mga henerasyon. Nagpakita siya ng lakas sa pamamagitan ng kanyang bisig; pinaghiwa-hiwalay niya ang mga mapagmataas sa mga pag-iisip ng kanilang mga puso; ibaba niya ang mga makapangyarihan mula sa kanilang mga trono at itinaas ang mga may mababang estado; pinuno niya ng mabubuting bagay ang mga nagugutom at pinapunta ang mayaman na walang laman. Tumulong siya sa kanyang lingkod na si Israel, naaalala ang kanyang awa, bilang sinabi niya sa aming mga ama, kay Abraham at sa kanyang mga inapo magpakailanman."
      },
      gospel: {
        reference: "Juan 3:16-17",
        title: "Dahil Tumatanggi ang Diyos sa Mundo",
        text: "Dahil tumatanggi ang Diyos sa mundo, na ibigay ang kanyang bugtong na Anak, upang ang sinumang nananampalataya sa kanya ay hindi malagay sa impyerno ngunit magkaroon ng buhay na walang hanggan. Dahil hindi ipinadala ng Diyos ang kanyang Anak sa mundo upang parusahan ang mundo, kundi upang ang mundo ay maligtas sa pamamagitan niya."
      }
    },
    apostlesCreed: "Sumasampalataya ako sa Diyos Ama na Makapangyarihan sa lahat, na Lumikha ng langit at lupa. At kay Jesucristo, kaisa niyang Anak, Panginoon natin, na ipinaglihi sa pamamagitan ng Espiritu Santo, ipinanganak kay Maria na Birhen, nagdusa sa kapangyarihan ni Poncio Pilato, ipinako sa krus, namatay at inilibing, bumaba sa impyerno, muling nabuhay nang ikatlong araw, umakyat sa langit, nakaupo sa kanan ng Diyos Ama na Makapangyarihan sa lahat, at mula roon ay babalik upang hatulan ang mga buhay at patay. Sumasampalataya ako sa Espiritu Santo, sa banal na Simbahang Katolika, sa pakikipagkakaisa ng mga banal, sa kapatawaran ng mga kasalanan, sa muling pagkabuhay ng katawan, at sa buhay na walang hanggan. Amen.",
    prayers: {
      lordsPrayer: "Ama namin, sumasalangit Ka, sambahin ang ngalan Mo. Mapasaamin ang kaharian Mo. Sundin ang loob Mo, dito sa lupa para nang sa langit. Bigyan Mo kami ngayon ng aming kakanin sa araw-araw. At patawarin Mo kami sa aming mga sala, para nang pagpapatawad namin sa nagsasala sa amin. At huwag Mo kaming ipahintulot sa tukso, at iadya Mo kami sa lahat ng masama. Amen.",
      prayerToStMichael: "San Miguel Arkanghel, ipagtanggol kami sa labanan. Maging aming proteksyon laban sa kasamaan at mga patibong ng diyablo; Maaaring husgahan siya ng Diyos, kami ay nagpapalakas ng aming panalangin; At ikaw, O Prinsipe ng Lahat ng mga Anghel, sa pamamagitan ng kapangyarihan ng Diyos, itulak sa impyerno si Satanas at lahat ng mga masasamang espiritu na gumagala sa mundo para sa pagkasira ng mga kaluluwa. Amen.",
      collect: "Makapangyarihang Diyos, nagpapasalamat kami sa Inyo sa regalo ng araw na ito. Habang nagsisimula kami sa aming paglalakbay sa araw na ito, bigyan kami ng karunungan upang makita ang iyong kamay sa lahat ng bagay, ang lakas upang sundin ang iyong kalooban, at ang pananampalataya upang maniwala sa iyong pagpapala. Nawa'y ang araw na ito ay puno ng iyong kapayapaan, iyong kasiyahan, at iyong maraming pagpapala. Sa pamamagitan ni Jesucristo, aming Panginoon. Amen."
    },
    signOfTheCrossEnd: "Sa pangalan ng Ama, at ng Anak, at ng Banal na Espiritu. Amen.",
    reflection: "Habang nagsisimula kami sa araw na ito, hayaan tayong mag-isip-isip sa pag-ibig ng Diyos para sa amin tulad ng ipinakita sa Kanyang Salita at sa Kanyang Anak na si Jesucristo. Nawa'y tayo ay maglakad sa Kanyang liwanag at sundin ang Kanyang gabay sa lahat ng aming mga araw.",
    metadata: {
      liturgicalSeason: "ordinary",
      feast: "",
      source: "Book of Common Prayer",
      sourceReference: "Prayer Guide PDF, Mga Pahina 8-20",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
};

// Function to add devotion to a file
function addDevotionToFile(language, devotionData) {
  const filePath = path.join(__dirname, 'src', 'data', 'devotions', `${language}.json`);
  
  try {
    const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Check if devotion for this date already exists
    const existingDevotionIndex = existingData.devotions.findIndex(
      (d) => d.date === currentDate && d.timeOfDay === 'morning'
    );
    
    if (existingDevotionIndex !== -1) {
      // Update existing devotion
      existingData.devotions[existingDevotionIndex] = devotionData;
      console.log(`Updated existing devotion for ${language.toUpperCase()} on ${currentDate}`);
    } else {
      // Add new devotion
      existingData.devotions.push(devotionData);
      console.log(`Added new devotion for ${language.toUpperCase()} on ${currentDate}`);
    }
    
    // Write updated data back to file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
  } catch (error) {
    console.error(`Error updating ${language.toUpperCase()} devotions:`, error.message);
  }
}

// Update each language file
Object.keys(devotionsData).forEach(language => {
  addDevotionToFile(language, devotionsData[language]);
});

console.log('\n✅ All devotion files updated successfully!');
console.log(`📅 Devotion for ${currentDate} added/updated in all languages`);
