import type { IngestOpportunity } from './types';

type Catalog = Omit<IngestOpportunity, 'externalId'> & { externalId: string };
const base = (externalId:string,title:string,organization:string,country:string,url:string,description:string,type:'SCHOLARSHIP'|'INTERNSHIP'='SCHOLARSHIP'): Catalog => ({
  externalId,title,type,organization,description,field:'Higher Education / Research',country,region:null,city:null,latitude:0,longitude:0,workMode:type==='INTERNSHIP'?'On-site':'On-campus',experienceRequired:null,salary:null,currency:null,eligibility:'International applicants; eligibility varies by program',deadline:null,applicationUrl:url,sourceUrl:url,sourceName:organization,verified:true,language:'en'
});

export const scholarshipCatalog: Catalog[] = [
base('csc','Chinese Government Scholarship (CSC)','China Scholarship Council','China','https://www.csc.edu.cn','Chinese Government Scholarship programs for international students.'),
base('beijing-government','Beijing Government Scholarship','China Scholarship Council','China','https://www.csc.edu.cn','Scholarship support for international students studying in Beijing.'),
base('silk-road','Silk Road Scholarship','China Scholarship Council','China','https://www.csc.edu.cn','CSC scholarship pathway targeting students from Belt and Road countries.'),
base('mext','MEXT Scholarship','MEXT / Government of Japan','Japan','https://www.mext.go.jp','Japanese government scholarship programs for international students.'),
base('jasso','JASSO Scholarship','JASSO','Japan','https://www.jasso.go.jp','Scholarship and student support programs for international students in Japan.'),
base('gks','Global Korea Scholarship (GKS)','Government of South Korea','South Korea','https://www.studyinkorea.go.kr','Korean government scholarship program for international students.'),
base('gist-global-internship','GIST Global Internship Program','Gwangju Institute of Science and Technology','South Korea','https://www.gist.ac.kr','Research internship opportunities at GIST.','INTERNSHIP'),
base('iccr','ICCR Scholarships','Indian Council for Cultural Relations','India','https://a2ascholarships.iccr.gov.in','International scholarship programs administered through ICCR.'),
base('turkiye','Türkiye Scholarships','Government of Türkiye','Türkiye','https://www.turkiyeburslari.gov.tr','Government scholarship program for international students.'),
base('knb','KNB Scholarship','Government of Indonesia','Indonesia','https://knb.kemdikbud.go.id','Indonesian government scholarship for students from developing countries.'),
base('daad','DAAD Scholarships','DAAD','Germany','https://www.daad.de','Scholarship opportunities for international students and researchers in Germany.'),
base('max-planck','Max Planck Internships','Max Planck Society','Germany','https://www.mpg.de','Research internship opportunities at Max Planck Institutes.','INTERNSHIP'),
base('hzdr','HZDR Dresden Summer Internship','Helmholtz-Zentrum Dresden-Rossendorf','Germany','https://www.hzdr.de','Summer research internship opportunities at HZDR.','INTERNSHIP'),
base('chevening','Chevening Scholarship','UK Government','United Kingdom','https://www.chevening.org','UK government scholarship for international master’s students.'),
base('ireland-iea','Government of Ireland International Education Scholarships','Higher Education Authority','Ireland','https://www.hea.ie','One-year scholarship support for international students in Ireland.'),
base('eiffel','France Excellence Eiffel Scholarship','Campus France / French Ministry of Europe and Foreign Affairs','France','https://www.campusfrance.org','French government scholarship for master’s and PhD students.'),
base('nl-scholarship','NL Scholarship','Study in NL','Netherlands','https://www.studyinnl.org','Scholarship for non-EEA international students.'),
base('maeci','Italian Government Scholarship (MAECI)','Italian Ministry of Foreign Affairs and International Cooperation','Italy','https://studyinitaly.esteri.it','Italian government scholarship programs for international students.'),
base('invest-italy','Invest Your Talent in Italy','Invest Your Talent in Italy','Italy','https://investyourtalentinitaly.it','Scholarship and internship pathway for master’s students.','INTERNSHIP'),
base('si','SI Scholarship for Global Professionals','Swedish Institute','Sweden','https://si.se','Swedish government scholarship for master’s studies.'),
base('erasmus','Erasmus+','European Union','European Union','https://erasmus-plus.ec.europa.eu','EU funding for education, training, youth and sports including study and internships.'),
base('cern-summer','CERN Summer Student Programme','CERN','Switzerland','https://careers.cern','Summer student program for science and engineering undergraduates.','INTERNSHIP'),
base('fulbright','Fulbright Program','Fulbright Program','United States','https://fulbrightprogram.org','International educational exchange scholarships and programs.'),
base('canada-international','Canadian Government International Scholarships','Government of Canada','Canada','https://www.educanada.ca','Canadian government international scholarship and exchange programs.'),
base('vanier','Vanier Canada Graduate Scholarships','Government of Canada','Canada','https://vanier.gc.ca','Doctoral scholarship program in Canada.'),
base('mitacs','Mitacs Globalink Research Internship','Mitacs','Canada','https://www.mitacs.ca','Research internship for eligible international undergraduates.','INTERNSHIP'),
base('rtp','Australian Government Research Training Program (RTP)','Australian Government','Australia','https://www.dese.gov.au','Research training support including tuition offsets and stipends.'),
base('manaaki','Manaaki New Zealand Scholarships','New Zealand Government','New Zealand','https://www.nzscholarships.govt.nz','New Zealand government scholarships for eligible developing-country applicants.'),
base('pec-pg','PEC-PG Program','CAPES / Government of Brazil','Brazil','https://www.gov.br/capes','Brazilian government postgraduate scholarship program for foreign students.'),
base('gcub','GCUB-Mob Scholarship','GCUB','Brazil','https://www.gcub.org.br','Master’s and PhD scholarship opportunities in Brazil.'),
base('mexico','Mexican Government Excellence Scholarships for Foreigners','Government of Mexico','Mexico','https://www.gob.mx/sre','Mexican government scholarship program for international students.'),
base('unesco','UNESCO U-STEP Traineeship Program','UNESCO','International','https://www.unesco.org','Traineeship and professional development opportunities at UNESCO.','INTERNSHIP'),
base('iaea','IAEA Internship Program','IAEA','International','https://www.iaea.org','Internship opportunities in nuclear science and technology applications.','INTERNSHIP'),
base('cern-openlab','CERN OpenLab','CERN','Switzerland','https://openlab.cern','Computing-focused student internship opportunities at CERN.','INTERNSHIP')
];
