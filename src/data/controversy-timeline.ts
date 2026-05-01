/** Category tags for filtering and visual differentiation */
export type EventCategory =
  | 'legislative'
  | 'judicial'
  | 'political'
  | 'civil-society'
  | 'constitutional'
  | 'resolution';

export interface JusticeStance {
  name: string;
  stance: string;
  opinionType: '多數意見' | '協同意見' | '不同意見' | '部分不同意見';
}

/** A single timeline event */
export interface TimelineEvent {
  id: string;
  date: string;
  dateLabel: string;
  title: string;
  summary: string;
  detail: string;
  category: EventCategory;
  significance: 'high' | 'medium' | 'low';
  actors: string[];
  consequence: string;
  justiceStances?: JusticeStance[];
}

/** Category metadata for legend/filtering */
export interface CategoryDef {
  id: EventCategory;
  label: string;
  color: string;
  icon: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'legislative',    label: '立法行動', color: 'blue',   icon: '🏛️' },
  { id: 'judicial',       label: '司法回應', color: 'purple', icon: '⚖️' },
  { id: 'political',      label: '政治角力', color: 'red',    icon: '🔴' },
  { id: 'civil-society',  label: '公民社會', color: 'green',  icon: '📢' },
  { id: 'constitutional', label: '憲政危機', color: 'amber',  icon: '⚠️' },
  { id: 'resolution',     label: '解方與後續', color: 'teal', icon: '✅' },
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'evt-01',
    date: '2024-02-01',
    dateLabel: '2024年2月1日',
    title: '第十一屆立委就職',
    summary: '新國會多數（國民黨＋民眾黨）就任，開始推動「國會改革」法案。',
    detail: '2024年2月，第十一屆立法院正式開議。國民黨與民眾黨合計席次過半，形成新的國會多數。兩黨隨即開始推動一系列以「國會改革」為名的法案，包括擴張國會調查權、強化人事同意權等。這是整場憲政風暴的起點。',
    category: 'legislative',
    significance: 'medium',
    actors: ['立法院', '國民黨', '民眾黨'],
    consequence: '為後續一系列爭議法案埋下伏筆，開啟國會多數與行政權的對抗格局。',
  },
  {
    id: 'evt-02',
    date: '2024-05-17',
    dateLabel: '2024年5月17日',
    title: '國會改革法案二讀混戰',
    summary: '立法院進行《立法院職權行使法》修正案二讀，藍綠爆發激烈肢體衝突，議場陷入混亂。',
    detail: '國民黨與民眾黨聯手以人數優勢，強行推進《立法院職權行使法》修正案二讀程序。修正內容包括：大幅擴張國會調查權（可傳喚任何人）、強化人事同意權（可實質否決總統提名）、增訂「藐視國會罪」等。民進黨立委激烈抗議，議場爆發肢體衝突，場面混亂。法案尚未完成三讀（最終於5月28日三讀通過）。',
    category: 'legislative',
    significance: 'high',
    actors: ['立法院', '國民黨', '民眾黨', '民進黨'],
    consequence: '引爆「青鳥行動」群眾運動，社會開始關注國會多數是否濫用權力。',
  },
  {
    id: 'evt-03',
    date: '2024-05-21',
    dateLabel: '2024年5月21日',
    title: '青鳥行動集結立法院外',
    summary: '數萬民眾自發包圍立法院，抗議國會擴權法案。',
    detail: '在社群媒體號召下，數萬名公民自發集結在立法院周圍，以「青鳥行動」為名表達對國會擴權的不滿。參與者來自各年齡層與背景，手持標語要求「退回惡法」。這是2014年太陽花運動以來，最大規模的國會相關群眾運動。',
    category: 'civil-society',
    significance: 'high',
    actors: ['公民團體', '青年世代'],
    consequence: '凸顯社會對國會多數暴力的不滿，但未能阻止法案通過。',
  },
  {
    id: 'evt-04',
    date: '2024-05-28',
    dateLabel: '2024年5月28日',
    title: '國會改革法案三讀通過',
    summary: '立法院三讀通過《立法院職權行使法》與《刑法》藐視國會罪修正。',
    detail: '在持續數日的抗議聲中，立法院仍以多數表決三讀通過《立法院職權行使法》修正案與《刑法》增訂藐視國會罪條文。總統府與行政院隨即表示將聲請釋憲，認為多項條文有違憲疑慮。政治爭議正式進入司法軌道。',
    category: 'legislative',
    significance: 'high',
    actors: ['立法院', '總統府', '行政院'],
    consequence: '總統府與行政院宣布將聲請釋憲，爭議從政治場域轉入憲法法庭。',
  },
  {
    id: 'evt-05',
    date: '2024-06-26',
    dateLabel: '2024年6月26日',
    title: '行政院聲請釋憲與暫時處分',
    summary: '行政院、總統、立法委員分別聲請憲法法庭審理，並聲請暫時處分凍結爭議條文。',
    detail: '行政院、總統府及民進黨立法委員分別向憲法法庭聲請審理國會擴權法案的合憲性。聲請方同時請求憲法法庭作成暫時處分，在判決確定前暫停爭議條文的效力，以免造成不可回復的憲政傷害。這是我國憲政史上少見的行政權正面挑戰立法權的案例。',
    category: 'judicial',
    significance: 'high',
    actors: ['行政院', '總統府', '民進黨立委', '憲法法庭'],
    consequence: '正式將政治爭議導入司法軌道，憲法法庭成為仲裁者。',
  },
  {
    id: 'evt-06',
    date: '2024-07-19',
    dateLabel: '2024年7月19日',
    title: '憲法法庭裁定暫時處分',
    summary: '憲法法庭裁定部分爭議條文暫停適用，國會擴權法案實質凍結。',
    detail: '憲法法庭以大法官多數決，裁定國會擴權法案中多項爭議條文暫停適用。這代表在本案判決作成前，立法院無法行使擴張後的調查權與傳喚權，藐視國會罪也暫不生效。國民黨強烈反彈，批評大法官「越權」、「護航執政黨」。',
    category: 'judicial',
    significance: 'high',
    actors: ['憲法法庭', '國民黨'],
    consequence: '國會擴權法案實質凍結，但也讓「大法官 vs. 國會」的對抗正式浮上檯面。',
  },
  {
    id: 'evt-07',
    date: '2024-10-25',
    dateLabel: '2024年10月25日',
    title: '113年憲判字第9號判決',
    summary: '憲法法庭宣告國會擴權法案多項條文違憲，立法院擴權企圖受挫。',
    detail: '憲法法庭作成113年憲判字第9號判決，宣告《立法院職權行使法》修正案中關於國會調查權的部分規定、強制傳喚權、藐視國會罪等核心條文違憲。判決理由指出，國會調查權不得侵犯司法權核心、不得對一般人民行使強制處分權。此判決確立了國會權力的憲法界限。',
    category: 'judicial',
    significance: 'high',
    actors: ['憲法法庭'],
    consequence: '立法院擴權企圖受挫，但也激化了藍白陣營對憲法法庭本身的攻擊。',
    justiceStances: [],
  },
  {
    id: 'evt-08',
    date: '2024-11-01',
    dateLabel: '2024年10月底至11月',
    title: '立法院醞釀修法反制憲法法庭',
    summary: '國民黨立委提出修改《憲法訴訟法》，企圖從制度面癱瘓憲法法庭。',
    detail: '在國會擴權法案被宣告違憲後，國民黨立委隨即提出修改《憲法訴訟法》的草案。核心策略是：墊高憲法法庭作成判決的門檻（要求更多大法官出席與同意），搭配凍結大法官人事同意權（不審查總統提名人選），讓憲法法庭因人數不足而無法運作。這被稱為「修法加卡人」的雙殺策略。',
    category: 'political',
    significance: 'medium',
    actors: ['國民黨', '立法院'],
    consequence: '企圖從制度面癱瘓憲法法庭，開啟「立法權反制司法權」的新戰線。',
  },
  {
    id: 'evt-09',
    date: '2024-12-20',
    dateLabel: '2024年12月20日',
    title: '《憲法訴訟法》修正案三讀',
    summary: '立法院通過修正案：要求現有大法官總額至少10人參與評議、至少9人同意才能作判決。',
    detail: '立法院三讀通過《憲法訴訟法》修正案，將憲法法庭作成判決的門檻大幅提高為「現有大法官總額中至少10人參與評議、至少9人同意」。這個修法表面上是「提高司法品質」，實際上搭配立法院持續凍結大法官人事同意權（不審查新提名人），等於讓憲法法庭無法達到開庭門檻。',
    category: 'legislative',
    significance: 'high',
    actors: ['立法院', '國民黨', '民眾黨'],
    consequence: '搭配大法官人事凍結，憲法法庭面臨人數不足無法運作的存亡危機。',
  },
  {
    id: 'evt-10',
    date: '2024-10-31',
    dateLabel: '2024年10月31日',
    title: '七位大法官任期屆滿',
    summary: '蔡英文時期提名的七位大法官離任，憲法法庭僅剩八位大法官。',
    detail: '2024年10月31日，蔡英文總統時期提名的七位大法官任期屆滿正式離任，憲法法庭僅剩八位大法官。而修正後的《憲法訴訟法》要求至少10人參與評議，八位大法官根本無法達到門檻，憲法法庭面臨實質停擺。',
    category: 'constitutional',
    significance: 'high',
    actors: ['憲法法庭'],
    consequence: '依新修法門檻，憲法法庭形同癱瘓，違憲審查機制實質停擺。',
  },
  {
    id: 'evt-11',
    date: '2024-12-24',
    dateLabel: '2024年12月24日',
    title: '大法官提名遭否決',
    summary: '賴清德總統提名的大法官人選遭立法院投票否決，第二次提名亦於2025年7月25日遭否決。',
    detail: '賴清德總統依憲法規定提名新任大法官人選送交立法院行使同意權。2024年12月24日，第一次提名遭國民黨與民眾黨控制的立法院投票否決。2025年7月25日，第二次提名再度遭否決。立法院透過否決提名人選，使憲法法庭始終無法補足大法官人數，搭配修法墊高的門檻，憲法法庭持續無法正常運作。',
    category: 'political',
    significance: 'high',
    actors: ['賴清德', '立法院', '國民黨', '民眾黨'],
    consequence: '憲法法庭持續無法達到修法後的開庭門檻，違憲審查機能癱瘓。',
  },
  {
    id: 'evt-12',
    date: '2025-01-23',
    dateLabel: '2025年1月23日',
    title: '憲訴法新制生效，法庭實質停擺',
    summary: '《憲法訴訟法》修正案正式生效，因大法官僅剩8人無法達到10人門檻，憲法法庭實質停擺。',
    detail: '2025年1月23日，《憲法訴訟法》修正案正式生效。新法要求至少10位大法官參與評議，但憲法法庭此時僅剩8位大法官，根本無法達到門檻。憲法法庭因此實質停擺，無法受理新案或作成判決，違憲審查機制陷入癱瘓。',
    category: 'constitutional',
    significance: 'high',
    actors: ['憲法法庭'],
    consequence: '違憲審查機制實質停擺，人民喪失聲請釋憲救濟管道。',
  },
  {
    id: 'evt-13',
    date: '2025-04-01',
    dateLabel: '2025年初至年中',
    title: '社會輿論激烈交鋒',
    summary: '法律學者、公民團體、媒體就「國會多數能否修法癱瘓違憲審查」展開大辯論。',
    detail: '整個2025年上半年，台灣社會圍繞一個核心問題展開激烈辯論：民主多數決的界限在哪裡？支持國會修法者認為，立法院代表民意，有權決定司法制度如何運作。反對者則主張，憲法法庭是保障少數權利、約束多數暴力的最後防線，允許立法多數用程序手段癱瘓違憲審查，等於取消憲法的最高性。這場辯論深化了社會對憲政體制的理解，但也加劇了政治極化。',
    category: 'civil-society',
    significance: 'medium',
    actors: ['法律學者', '公民團體', '媒體'],
    consequence: '公眾對憲法法庭功能的認識提升，但社會極化加深。',
  },
  {
    id: 'evt-14',
    date: '2025-07-01',
    dateLabel: '2025年中',
    title: '大法官陸續退休/離任',
    summary: '更多大法官任期屆滿，新提名人持續遭杯葛，憲法法庭長期維持最低運作人數。',
    detail: '隨著時間推移，更多大法官因任期屆滿而離任。由於立法院持續不行使同意權，新提名人選始終無法上任。憲法法庭長期僅以暫時處分回歸的舊門檻勉強維持運作，但已有數百件待審案件累積，人民的釋憲聲請無法獲得及時處理。這凸顯了制度僵局對人民權利的實質傷害。',
    category: 'constitutional',
    significance: 'medium',
    actors: ['憲法法庭', '立法院'],
    consequence: '數百件待審案件累積，人民釋憲聲請無法獲得及時處理。',
  },
  {
    id: 'evt-15',
    date: '2025-12-19',
    dateLabel: '2025年12月19日',
    title: '114年憲判字第1號判決',
    summary: '憲法法庭由5位大法官宣告《憲法訴訟法》修正案違憲，3位大法官拒絕參與。',
    detail: '憲法法庭就《憲法訴訟法》修正案本案作成判決（114年憲判字第1號），僅5位大法官參與，3位大法官（蔡宗珍、楊惠欽、朱富美）拒絕參與。判決宣告立法院以修法墊高門檻、搭配否決人事來癱瘓憲法法庭的做法違憲。判決指出：違憲審查是憲法的核心制度保障，立法權不得以任何方式實質廢除之。這是台灣憲政史上的里程碑判決，確立了「立法多數的權力界限」這一關鍵原則。張娟芬的評析文章即針對此判決而寫。',
    category: 'resolution',
    significance: 'high',
    actors: ['憲法法庭'],
    consequence: '憲法法庭正式「回歸」正常運作軌道，確立「立法權不得以修法方式實質廢除違憲審查」的憲政原則。',
    justiceStances: [],
  },
];
