export const VERSION = 1;
export const EXPENSE_CATEGORIES = ['Food','Transport','Shopping','Bills','Home','Health','Education','Entertainment','Other'];
export const INCOME_CATEGORIES = ['Salary','Business','Freelance','Gift','Other'];
export const COLORS = {
  Food:'#8362f4', Transport:'#f59e82', Shopping:'#ef87be', Bills:'#5ba4dc',
  Home:'#50bda7', Health:'#f1a847', Education:'#7384e4', Entertainment:'#b38dda', Other:'#9ba0b6',
  Salary:'#5aa78b', Business:'#78a2d1', Freelance:'#af8bde', Gift:'#e9a45d'
};
export const DEFAULT_BUDGETS = {Food:0,Transport:0,Shopping:0,Bills:0,Home:0,Health:0,Education:0,Entertainment:0,Other:0};
export function todayISO(date = new Date()) { const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`; }
export function monthKey(dateString) {return String(dateString).slice(0,7);}
export function monthLabel(key, locale='en-US') {const [y,m] = key.split('-').map(Number);return new Intl.DateTimeFormat(locale,{month:'long',year:'numeric'}).format(new Date(y,m-1,1));}
export function shiftMonth(key, delta) {const [y,m]=key.split('-').map(Number);const d=new Date(y,m-1+delta,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}
export function formatMoney(value,currency='PKR',compact=false) {
  const num=Number(value)||0;
  const locale=currency==='PKR'?'en-PK':currency==='INR'?'en-IN':'en-US';
  try { return new Intl.NumberFormat(locale,{style:'currency',currency,maximumFractionDigits:0,notation:compact&&Math.abs(num)>=100000?'compact':'standard'}).format(num); }
  catch {return `${currency} ${num.toLocaleString('en-US',{maximumFractionDigits:0})}`;}
}
export function roundMoney(value){return Math.round((Number(value)+Number.EPSILON)*100)/100;}
export function escapeHtml(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function uid(){return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);}
export function makeInitialData(){return {version:VERSION,settings:{currency:'PKR',theme:'light',name:'My Wallet',openingBalance:0},transactions:[],budgets:{...DEFAULT_BUDGETS},goals:[],recurring:[]};}
export function isValidISODate(d) {if(typeof d!=='string'||!/^(\d{4})-(\d\d)-(\d\d)$/.test(d)) return false;const date=new Date(`${d}T12:00:00Z`);return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===d;}
export function validateTransaction(t){return Boolean(t&&typeof t.id==='string'&&t.id.length<150&&['income','expense'].includes(t.type)&&typeof t.title==='string'&&t.title.trim().length>0&&t.title.length<=120&&typeof t.category==='string'&&t.category.length<=60&&Number.isFinite(t.amount)&&t.amount>0&&t.amount<=1e12&&isValidISODate(t.date)&&(!t.note||typeof t.note==='string'&&t.note.length<=500));}
export function calculateTotals(transactions,month=null,openingBalance=0){let income=0,expense=0;for(const t of transactions){if(month&&monthKey(t.date)!==month)continue;if(t.type==='income')income+=t.amount;else expense+=t.amount;}return {income:roundMoney(income),expense:roundMoney(expense),balance:roundMoney(income-expense+(month?0:openingBalance))};}
export function categoryExpenses(transactions,month){const sums={};for(const t of transactions){if(t.type!=='expense'||monthKey(t.date)!==month)continue;sums[t.category]=roundMoney((sums[t.category]||0)+t.amount);}return sums;}
export function budgetSummary(budgets,transactions,month){const spent=categoryExpenses(transactions,month);return Object.entries(budgets).filter(([,cap])=>cap>0).map(([category,limit])=>({category,limit,spent:spent[category]||0,remaining:roundMoney(limit-(spent[category]||0)),percent:Math.round(((spent[category]||0)/limit)*100)}));}
export function getGoalProgress(goal){return goal.target>0?Math.round(goal.saved/goal.target*100):0;}
export function recurringDueDate(rec,month){const [year,m]=month.split('-').map(Number);const lastDay=new Date(year,m,0).getDate();return `${month}-${String(Math.min(rec.day,lastDay)).padStart(2,'0')}`;}
export function recurringIsDue(rec,month,today=todayISO()){return recurringDueDate(rec,month)<=today&&rec.lastRecordedMonth!==month;}
export function escapeCSVCell(value){let v=String(value??'');if(/^[\s]*[=+@\-\t\r]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';}
export function csvTransactions(rows){return ['Date,Type,Category,Title,Amount,Note',...rows.map(t=>[t.date,t.type,t.category,t.title,t.amount,t.note||''].map(escapeCSVCell).join(','))].join('\r\n');}
export function parseBackup(json){
  const obj=typeof json==='string'?JSON.parse(json):json;
  if(!obj||obj.version!==VERSION||!Array.isArray(obj.transactions)||!Array.isArray(obj.goals)||!Array.isArray(obj.recurring)||typeof obj.budgets!=='object'||!obj.budgets||!obj.settings||typeof obj.settings!=='object')throw new Error('This is not a supported KharchaBanao backup.');
  if(obj.transactions.length>100000||obj.goals.length>10000||obj.recurring.length>10000)throw new Error('Backup is too large.');
  if(obj.transactions.some(t=>!validateTransaction(t)))throw new Error('Backup has invalid transactions.');
  const ids=new Set(obj.transactions.map(t=>t.id));if(ids.size!==obj.transactions.length)throw new Error('Backup contains duplicate transactions.');
  const budgets={...DEFAULT_BUDGETS};for(const [k,v] of Object.entries(obj.budgets)){if(!Object.hasOwn(budgets,k)||!Number.isFinite(v)||v<0||v>1e12)throw new Error('Backup has invalid budgets.');budgets[k]=v;}
  const goals=obj.goals.map(g=>{if(!g||typeof g.id!=='string'||typeof g.name!=='string'||!g.name.trim()||g.name.length>100||!Number.isFinite(g.target)||g.target<=0||g.target>1e12||!Number.isFinite(g.saved)||g.saved<0||g.saved>1e12||g.saved>g.target)throw new Error('Backup has invalid savings goals.');return {id:g.id,name:g.name,target:g.target,saved:g.saved,emoji:typeof g.emoji==='string'&&g.emoji.length<10?g.emoji:'🎯'};});
  const recurring=obj.recurring.map(r=>{if(!r||typeof r.id!=='string'||typeof r.title!=='string'||!r.title.trim()||r.title.length>120||!['income','expense'].includes(r.type)||typeof r.category!=='string'||r.category.length>60||!Number.isFinite(r.amount)||r.amount<=0||r.amount>1e12||!Number.isInteger(r.day)||r.day<1||r.day>31||!(r.lastRecordedMonth==null||/^\d{4}-\d{2}$/.test(r.lastRecordedMonth)))throw new Error('Backup has invalid recurring records.');return {id:r.id,title:r.title,type:r.type,category:r.category,amount:r.amount,day:r.day,lastRecordedMonth:r.lastRecordedMonth||null};});
  const s=obj.settings;const currencies=['PKR','USD','INR','AED','GBP','EUR'];const currency=currencies.includes(s.currency)?s.currency:'PKR';const openingBalance=Number.isFinite(s.openingBalance)&&Math.abs(s.openingBalance)<=1e12?s.openingBalance:0;
  return {version:VERSION,settings:{currency,theme:s.theme==='dark'?'dark':'light',name:typeof s.name==='string'?s.name.slice(0,80):'My Wallet',openingBalance},transactions:obj.transactions.map(t=>({id:t.id,title:t.title,type:t.type,date:t.date,category:t.category,amount:t.amount,note:t.note||''})),budgets,goals,recurring};
}
