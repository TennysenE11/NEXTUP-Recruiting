"""Builds seed-programs.csv. Coach data copied from official athletics staff pages on 2026-11-17."""
import csv
D = "2026-11-17"
H = ["School","Division","Conference","State","Head coach","Pitching or recruiting coach","Coach email","Source URL",
     "Date checked","Date emailed","Status","Replied","Next follow-up","Follow-ups sent","Personalization","Notes",
     "Roster season","Pitchers on roster","Pitchers leaving","Roster URL","Program fact","Business major","ID"]

# Pitcher counts parsed from each official roster page on 2026-11-17.
# "Leaving" = pitchers gone before fall 2027: on a 2027 roster, seniors/grad students
# (JUCO: sophomores); on a 2026 roster, juniors and older.
ROSTER = {"acu":("2026",20,17),"apu":("2026",20,14),"asu":("2026",24,12),"bushnell":("2027",25,6),"chapman":("2026",13,5),
 "chico":("2027",10,5),"clu":("2026",17,8),"cms":("2026",24,14),"cmu":("2026",24,14),"cofi":("2026",24,9),"corban":("2026",20,12),
 "cpp":("2027",21,7),"csi":("2027",22,3),"cwu":("2027",21,6),"hiu":("2027",16,11),"linfield":("2026",16,6),"masters":("2026",21,16),
 "oit":("2027",23,5),"ouaz":("2026",24,20),"oxy":("2026",19,10),"plnu":("2026",13,7),"pomona":("2026",17,8),"redlands":("2026",14,7),
 "regis":("2027",30,7),"slcc":("2027",25,14),"trinity":("2026",17,7),"txwes":("2026",11,9),"ups":("2026",26,18),"westmont":("2026",27,5),
 "whitworth":("2026",19,5)}
KEY = {"sagehens.com":"pomona","cmsathletics.org":"cms","athletics.chapman.edu":"chapman","clusports.com":"clu","goredlands.com":"redlands",
 "oxyathletics.com":"oxy","whitworthpirates.com":"whitworth","loggerathletics.com":"ups","golinfieldwildcats.com":"linfield",
 "athletics.georgefox.edu":"georgefox","trinitytigers.com":"trinity","plnusealions.com":"plnu","athletics.westmont.edu":"westmont",
 "athletics.apu.edu":"apu","broncoathletics.com":"cpp","chicowildcats.com":"chico","cmumavericks.com":"cmu","regisrangers.com":"regis",
 "wildcatsports.com":"cwu","angelosports.com":"asu","lcwarriors.com":"lcsc","yoteathletics.com":"cofi","oregontechowls.com":"oit",
 "corbanwarriors.com":"corban","bushnellbeacons.com":"bushnell","acufirestorm.com":"acu","ouazspirit.com":"ouaz","gomustangs.com":"masters",
 "hiuroyals.com":"hiu","ramsports.net":"txwes","athletics.csi.edu":"csi","slccbruins.com":"slcc"}
# One program fact per school, written to the coach. From the schools' own athletics sites via search; check before sending.
FACT = {
 "pomona":"Coach Pericolosi is the winningest coach in program history.",
 "cms":"Your back-to-back 35-15 seasons in 2025 and 2026 stood out to me.",
 "chapman":"Your 2019 Division III national championship is a big reason Chapman is on my list.",
 "clu":"I like that Coach Scherer played for the Kingsmen before leading the program.",
 "redlands":"Congratulations on your staff being named 2026 SCIAC Coaching Staff of the Year.",
 "oxy":"",
 "whitworth":"Congratulations on the 2025 NWC tournament championship.",
 "ups":"Your back-to-back postseason trips, a first in program history, caught my attention.",
 "linfield":"I know Coach Harlow played on Linfield's 2013 national championship team.",
 "georgefox":"I noticed your program has earned the ABCA Team Academic Excellence Award every year under Coach Kopple.",
 "trinity":"I know Coach Scannell was the 2016 ABCA Division III National Coach of the Year.",
 "plnu":"Five straight NCAA West Regional appearances is a big reason PLNU is near the top of my list.",
 "westmont":"",
 "apu":"Winning the first PacWest tournament title in 2023 caught my attention.",
 "cpp":"Congratulations to Coach Torres on being named 2026 ABCA Division II National Assistant Coach of the Year.",
 "chico":"I know Coach Taylor is the winningest coach in Chico State history and was the Wildcats' pitching coach before that.",
 "cmu":"Coach Hanks passing 1,000 wins says a lot about how consistent your program is.",
 "regis":"Congratulations to Coach Lautz on being named head coach this summer.",
 "cwu":"I noticed Coach Vaughn pitched for the Wildcats before taking over as head coach.",
 "wou":"Five GNAC regular-season titles under Coach Walker caught my attention.",
 "asu":"Your 2023 Division II national championship is a big reason Angelo State is on my list.",
 "lcsc":"Congratulations on your 45-9 season in 2026.",
 "cofi":"Coach Humberger passing 700 wins says a lot about the program.",
 "oit":"Your 2024 team's 39 wins and first NAIA tournament trip caught my attention.",
 "corban":"",
 "bushnell":"",
 "acu":"Your 2024 NAIA World Series run caught my attention.",
 "ouaz":"",
 "masters":"Coach Brooks reaching nearly 900 wins over 30 seasons says a lot about the program.",
 "hiu":"Congratulations on the 2024 NAIA national championship.",
 "txwes":"Congratulations on your 42-12 season and SAC regular-season title in 2026.",
 "yavapai":"Your history at the JUCO World Series is a big reason Yavapai is on my list.",
 "cac":"Your 2022 NJCAA national championship caught my attention.",
 "occ":"",
 "cypress":"",
 "lcc":"Congratulations on another NWAC championship this year.",
 "lbcc":"Congratulations to Coach Peterson on being named 2024 NWAC Coach of the Year.",
 "mclennan":"Your 2021 NJCAA national championship caught my attention.",
 "csi":"",
 "slcc":"Your JUCO World Series championship under Coach Nelson is a big reason SLCC is on my list.",
}
OTHER = {"wouwolves.com":"wou","goroughriders.com":"yavapai","vaquerosports.com":"cac","occpirateathletics.com":"occ",
 "cypresschargers.com":"cypress","lccreddevils.com":"lcc","athletics.linnbenton.edu":"lbcc","mclennanathletics.com":"mclennan"}
NO_BUSINESS = {"pomona","oxy","cms"}
# school, division, conference, state, head coach, pitching/recruiting coach, email, url, notes
R = [
# ---- NCAA D3 ----
("Pomona-Pitzer Colleges","NCAA D3","SCIAC","CA","Frank Pericolosi","Michael Surina (Asst. Coach / Recruiting Coordinator)","Michael.Surina@pomona.edu","https://sagehens.com/sports/baseball/coaches","Head coach email on page: frank.pericolosi@pomona.edu. Page lists no pitching coach title."),
("Claremont-Mudd-Scripps","NCAA D3","SCIAC","CA","Bill Walkenbach","Quinn Heiner (Asst. Coach / Recruiting Coordinator)","quinn.heiner@cms.claremont.edu","https://cmsathletics.org/sports/baseball/coaches","Head coach: bill.walkenbach@cms.claremont.edu. Keith Walker (keith.walker@cms.claremont.edu) may work with pitchers per his bio; page title is only 'Assistant Coach', verify."),
("Chapman University","NCAA D3","SCIAC","CA","Scott Laverty","Dave Edwards (Assoc. Head Coach / Pitching Coach)","baseball@chapman.edu","https://athletics.chapman.edu/sports/baseball/coaches","Page lists one shared program inbox (baseball@chapman.edu) for all coaches."),
("California Lutheran University","NCAA D3","SCIAC","CA","Erik Scherer","Collin Crowl (Recruiting Coordinator)","ccrowl@callutheran.edu","https://clusports.com/sports/baseball/coaches","Head coach: escherer@callutheran.edu. Pitching Development: Joey Romano (no email on page)."),
("University of Redlands","NCAA D3","SCIAC","CA","Aaron Holley","Chris Hernandez (Asst. Coach / Recruiting Coordinator)","chris_hernandez@redlands.edu","https://goredlands.com/sports/baseball/coaches","Head coach: aaron_holley@redlands.edu."),
("Occidental College","NCAA D3","SCIAC","CA","Luke Wetmore","Cameron McMullen (Asst. Coach / Recruiting Coordinator)","cmcmullen@oxy.edu","https://oxyathletics.com/sports/baseball/coaches","Head coach: wetmorel@oxy.edu."),
("Whitworth University","NCAA D3","Northwest Conference","WA","CJ Perry","","cperry@whitworth.edu","https://whitworthpirates.com/sports/baseball/coaches","Email is the head coach's. Page names no pitching coach or recruiting coordinator; verify who handles pitchers."),
("University of Puget Sound","NCAA D3","Northwest Conference","WA","Jeff Halstead","AJ Morioka (Asst. Coach / Recruiting Coordinator)","amorioka@pugetsound.edu","https://loggerathletics.com/sports/baseball/coaches","Head coach: jhalstead@pugetsound.edu. Pitching coach: Michael Johnson (no email on page)."),
("Linfield University","NCAA D3","Northwest Conference","OR","Jordan Harlow","","jharlow@linfield.edu","https://golinfieldwildcats.com/sports/baseball/coaches","Email is the head coach's. Aug 2026 news says Ethan Krupp will run the pitching staff for 2027, but he is not on the staff page yet; verify."),
("George Fox University","NCAA D3","Northwest Conference","OR","Kevin Kopple","","kkopple@georgefox.edu","https://athletics.georgefox.edu/sports/baseball/coaches","Email is the head coach's. All assistants titled 'Assistant Coach'; Brandon Rupp (brupp@georgefox.edu) is described as pitching assistant in his bio, verify."),
("Trinity University","NCAA D3","SAA","TX","Tim Scannell","Dave Smith (Pitching Coach)","dsmith4@trinity.edu","https://trinitytigers.com/sports/baseball/coaches","Head coach: tscannel@trinity.edu."),
# ---- NCAA D2 ----
("Point Loma Nazarene University","NCAA D2","PacWest","CA","Justin James","Jack Gonzales (Pitching Coach)","jgonzal2@pointloma.edu","https://plnusealions.com/sports/baseball/coaches","Head coach: justinjames@pointloma.edu."),
("Westmont College","NCAA D2","PacWest","CA","Paul Svagdis","","psvagdis@westmont.edu","https://athletics.westmont.edu/sports/baseball/coaches","Email is the head coach's. No pitching coach title on page (older bios name Rick Hubbard; he is not listed now); verify. Program inbox on page: baseball@westmont.edu."),
("Azusa Pacific University","NCAA D2","PacWest","CA","Kirk Nieuwenhuis","Jerry Peña (Asst. Coach / Recruiting Coordinator)","gpena@apu.edu","https://athletics.apu.edu/sports/baseball/coaches","Head coach: knieuwenhuis@apu.edu. Pitching coach: Bobby O'Neill (no email on page)."),
("Cal Poly Pomona","NCAA D2","CCAA","CA","Randy Betten","","rbetten@cpp.edu","https://broncoathletics.com/sports/baseball/coaches","Email is the head coach's. Associate head coach Jenzen Torres: jenzentorres@cpp.edu. Page gives no pitching or recruiting title; verify."),
("Chico State","NCAA D2","CCAA","CA","Dave Taylor","","dmtaylor@csuchico.edu","https://chicowildcats.com/sports/baseball/coaches","Email is the head coach's. Assistants titled 'Assistant Baseball Coach' only; verify who handles pitchers."),
("Colorado Mesa University","NCAA D2","RMAC","CO","Chris Hanks","Jeff Rodgers (Pitching Coach)","chanks@coloradomesa.edu","https://cmumavericks.com/sports/baseball/coaches","Pitching coach has no email on page, so email is the head coach's."),
("Regis University","NCAA D2","RMAC","CO","Matt Lautz","","rlautz@regis.edu","https://regisrangers.com/sports/baseball/coaches","Email is the head coach's (new head coach, July 2026). Page lists Mike Newton with a personal gmail address; not used. Verify pitching coach."),
("Central Washington University","NCAA D2","GNAC","WA","Aaron Vaughn","Garrison Becker (Pitching Coach / Recruiting Coordinator)","Garrison.Becker@cwu.edu","https://wildcatsports.com/sports/baseball/coaches","Head coach (new 2026): Aaron.Vaughn@cwu.edu."),
("Western Oregon University","NCAA D2","GNAC","OR","Kellen Walker","","","https://wouwolves.com/sports/baseball/coaches","VERIFY: official page refused automated access. Head coach name from search results citing wouwolves.com; email not checked, so left blank."),
("Angelo State University","NCAA D2","Lone Star Conference","TX","Kevin Brooks","","kevin.brooks@angelo.edu","https://angelosports.com/sports/baseball/coaches","Email is the head coach's. Adam Foster (adam.foster@angelo.edu) is the pitching coach per his bio but titled 'Assistant Coach' on the page; verify."),
# ---- NAIA ----
("Lewis-Clark State College","NAIA","Cascade Collegiate Conference","ID","Jeremiah Robbins","","jwrobbins@lcsc.edu","https://lcwarriors.com/sports/baseball/coaches","Email is the head coach's. Page lists assistants with no pitching or recruiting title; verify."),
("College of Idaho","NAIA","Cascade Collegiate Conference","ID","Shawn Humberger","Oliver Massie (Asst. Pitching Coach)","shumberger@collegeofidaho.edu","https://yoteathletics.com/sports/baseball/coaches","Pitching coach has no email on page, so email is the head coach's. Assoc. head coach Brian Schweiger: bschweiger@collegeofidaho.edu."),
("Oregon Tech","NAIA","Cascade Collegiate Conference","OR","Ricky Walker","John Kemp (Pitching Coach / Recruiting Coordinator)","ricky.walker@oit.edu","https://oregontechowls.com/sports/baseball/coaches","John Kemp has no email on page, so email is the head coach's."),
("Corban University","NAIA","Cascade Collegiate Conference","OR","Ryan Harris","","rharris@corban.edu","https://corbanwarriors.com/sports/baseball/coaches","Email is the head coach's. Assistants titled 'Assistant Coach' only; verify."),
("Bushnell University","NAIA","Cascade Collegiate Conference","OR","Jamie Womack","Ethan Stacy (Hitting Coach / Recruiting Coordinator)","estacy@bushnell.edu","https://bushnellbeacons.com/sports/baseball/coaches","Head coach: jawomack@bushnell.edu. Pitching coach: Cameron Kundig (no email on page)."),
("Arizona Christian University","NAIA","GSAC","AZ","Joe McDonald","Jacob Carson (Pitching Coach)","joe.mcdonald@arizonachristian.edu","https://acufirestorm.com/sports/baseball/coaches","Pitching coach has no email on page, so email is the head coach's."),
("Ottawa University Arizona","NAIA","GSAC","AZ","Tim Montez","Tanner Wickham (Asst. Head Coach / Recruiting Coordinator)","tanner.wickham@ottawa.edu","https://ouazspirit.com/sports/baseball/coaches","Head coach: tim.montez@ottawa.edu. Pitching coach: Artie Cox (no email on page)."),
("The Master's University","NAIA","GSAC","CA","Monte Brooks","Rob Winslow (Pitching Coach)","rwinslow@masters.edu","https://gomustangs.com/sports/baseball/coaches","Head coach: mbrooks@masters.edu. Recruiting coordinator Sean Harris is listed with a personal gmail; not used."),
("Hope International University","NAIA","GSAC","CA","Larry Mahoney","Steven Phillips (Sr. Assoc. Head Coach / Exec. Director of Recruiting)","sphillips@hiu.edu","https://hiuroyals.com/sports/baseball/coaches","Head coach: lmmahoney@hiu.edu. Pitching development: Vince Payne, vmpayne@hiu.edu."),
("Texas Wesleyan University","NAIA","Sooner Athletic Conference","TX","Bobby Garza","","robertgarza@txwes.edu","https://ramsports.net/sports/baseball/coaches","Email is the head coach's. Conference from news (SAC), verify."),
# ---- JUCO ----
("Yavapai College","JUCO","ACCAC (NJCAA)","AZ","Marc MacMillan","Chris Jimenez (pitchers/catchers, Recruiting Coordinator)","","https://goroughriders.com/sports/baseball/coaches","VERIFY: official page refused automated access. Names from search results citing goroughriders.com; email left blank."),
("Central Arizona College","JUCO","ACCAC (NJCAA)","AZ","","","","https://vaquerosports.com/sports/bsb/coaches/index","VERIFY: official page refused automated access, and sources conflict on the head coach (Sean Cashman vs. John 'JoJo' Howie). Left blank."),
("Orange Coast College","JUCO","Orange Empire Conference (CCCAA)","CA","Nate Johnson","","","https://occpirateathletics.com/sports/bsb/coaches/index","VERIFY: official page refused automated access. Head coach from search results citing the official site; email left blank."),
("Cypress College","JUCO","Orange Empire Conference (CCCAA)","CA","Anthony Hutting","Steve Lambright (Pitching Coach)","","https://cypresschargers.com/sports/bsb/coaches/index","VERIFY: official page refused automated access. Names from search results citing cypresschargers.com; email left blank."),
("Lower Columbia College","JUCO","NWAC","WA","Kurt Lupinski","","","https://lccreddevils.com/sports/baseball/coaches","VERIFY: official page refused automated access. Head coach from search results citing lccreddevils.com; email left blank."),
("Linn-Benton Community College","JUCO","NWAC","OR","Andy Peterson","","","https://athletics.linnbenton.edu/sports/bsb/coaches/index","VERIFY: official page refused automated access. Head coach from search results; email left blank."),
("McLennan Community College","JUCO","NJCAA Region V","TX","Tyler Johnson","Peter Stark (Asst. / Pitching Coach)","","https://mclennanathletics.com/sports/bsb/coaches/index","VERIFY: official page refused automated access. Names from search results citing mclennanathletics.com; email left blank."),
("College of Southern Idaho","JUCO","Scenic West (NJCAA)","ID","Boomer Walker","Bruer Webster (Asst. Coach / Recruiting Coordinator)","bwebster2@csi.edu","https://athletics.csi.edu/sports/baseball/coaches","Head coach: bwalker@csi.edu."),
("Salt Lake Community College","JUCO","Scenic West (NJCAA)","UT","David Nelson","Glen Spencer (Recruiting Coordinator / Defense)","david.nelson@slcc.edu","https://slccbruins.com/sports/baseball/coaches","Recruiting coordinator has no email on page, so email is the head coach's. Page still lists Dusty Nielsen, who news says left for Utah Valley; verify."),
]
assert len(R) == 40, len(R)
with open("seed-programs.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(H)
    for s,dv,cf,st,hc,pc,em,url,notes in R:
        host = url.split("/")[2]
        k = KEY.get(host) or OTHER.get(host)
        season, npit, leave = ROSTER.get(k, ("", "", ""))
        rurl = url.replace("/coaches", "/roster") if k in ROSTER else ""
        biz = "no (economics instead)" if k in NO_BUSINESS else "likely, verify"
        if k in NO_BUSINESS:
            notes += " No undergraduate business major (economics instead); check fit."
        w.writerow([s,dv,cf,st,hc,pc,em,url,D,"","Not contacted","no","","0","",notes,
                    season,npit,leave,rurl,FACT.get(k,""),biz,""])
print("wrote", len(R))
