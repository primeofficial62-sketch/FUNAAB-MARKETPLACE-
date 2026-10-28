/* KAMPZA cloud layer. Add ONE line to store.html, right before </body>:
   <script src="kampza-cloud.js"></script>
   Moves catalog, orders, quotes and wallet to Supabase. Prices, stock and balances are decided by the server. */
(()=>{
const FRIENDLY={WALLET_LOW:'Wallet balance is too low. Fund your wallet first.',UNAVAILABLE:'An item in your cart is no longer available.',EMPTY:'Your cart is empty.',BAD_DETAILS:'Enter your phone number and delivery address.',AUTH:'Please log in again.'};
const friendly=m=>{m=String(m||'');if(m.includes('OUT_OF_STOCK:'))return m.split('OUT_OF_STOCK:')[1].trim()+' is out of stock.';for(const k in FRIENDLY)if(m.includes(k))return FRIENDLY[k];return 'Something went wrong. Please try again.'};
const T=s=>Date.parse(s)||Date.now();
const typing=()=>/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'');
const mapP=r=>({id:r.id,n:r.name,e:r.emoji||'🛍️',p:Number(r.price),o:r.old_price?Number(r.old_price):undefined,c:r.category,d:r.description,s:r.specs||{},img:r.image||undefined,imgs:Array.isArray(r.images)?r.images:[],b:r.brand||undefined,r:r.rating||undefined,st:r.stock??undefined});

/* ---- catalog: Supabase first, deals.json as fallback ---- */
loadCatalog=async function(){
 try{const{data,error}=await sb.from('products').select('*').eq('active',true).order('created_at');
  if(!error&&data&&data.length){P=data.map(mapP);FLASH=data.filter(r=>r.flash).map(r=>r.id);if(!q.trim()&&!typing())view();return}}catch{}
 try{const r=await fetch(CATALOG_URL,{cache:'no-cache'});if(!r.ok)return;const j=await r.json();
  if(Array.isArray(j.products)&&j.products.length){P=j.products;FLASH=Array.isArray(j.flash)?j.flash:FLASH;if(!q.trim()&&!typing())view()}}catch{}};

/* ---- orders, quotes, wallet: load from the server ---- */
async function hydrate(){
 if(!sb||!U)return;
 try{
  const[o,qt,w,t]=await Promise.all([
   sb.from('orders').select('*').eq('user_id',U.id).order('created_at',{ascending:false}).limit(50),
   sb.from('quotes').select('*').eq('user_id',U.id).order('created_at',{ascending:false}).limit(50),
   sb.from('wallets').select('balance').eq('user_id',U.id).maybeSingle(),
   sb.from('wallet_tx').select('*').eq('user_id',U.id).order('created_at',{ascending:false}).limit(50)]);
  if(o.error||qt.error)return;
  const oldO=Object.fromEntries(S.orders.map(x=>[x.id,x.status])),oldQ=Object.fromEntries(S.quotes.map(x=>[x.id,x.status]));
  S.orders=o.data.map(r=>({id:r.id,at:T(r.created_at),items:(r.items||[]).map(i=>({n:i.n,q:i.q,p:i.p})),total:Number(r.total),pay:r.pay,ph:r.phone,ad:r.address,status:r.status}));
  S.quotes=qt.data.map(r=>({id:r.id,item:r.item,qty:r.qty,budget:r.budget,note:r.note,at:T(r.created_at),raw:r.status,status:r.status+(r.reply_price?' · '+fmt(r.reply_price):''),reply:r.reply_note}));
  S.orders.forEach(x=>{if(oldO[x.id]&&oldO[x.id]!==x.status)notif('Order update',x.id+' is now '+x.status)});
  S.quotes.forEach(x=>{if(oldQ[x.id]&&oldQ[x.id]!==x.status)notif('Quote update',x.id+': '+x.status+(x.reply?' — '+x.reply:''))});
  S.wallet={bal:Number(w.data?.balance||0),tx:(t.data||[]).map(x=>({t:x.title,a:Number(x.amount),at:T(x.created_at)}))};
  store();badges();nav();if(!typing())view();
 }catch(e){console.error('KAMPZA sync',e)}}
const _ls=loadState;loadState=function(){_ls();hydrate()};
setInterval(()=>{if(!document.hidden)hydrate()},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)hydrate()});

/* ---- intercept the three money actions before the old local code runs ---- */
async function place(btn){
 const ph=v('ph'),ad=v('ad'),pay=document.querySelector('input[name=pay]:checked')?.value||'cod';
 if(ph.replace(/\D/g,'').length<7){toast('Enter a valid phone number');return}
 if(ad.length<5){toast('Address is too short. Add hostel, room and campus, e.g. "Hall 3, Room 12, FUNAAB"');return}
 const items=Object.keys(S.cart).filter(byId).map(id=>({id,q:S.cart[id]}));
 if(!items.length){toast('Your cart is empty');return}
 btn.disabled=true;
 const{data,error}=await sb.rpc('place_order',{p_items:items,p_pay:pay,p_phone:ph,p_address:ad});
 btn.disabled=false;
 if(error){toast(friendly(error.message));return}
 S.cart={};U.phone=ph;U.meta.address=ad;U.meta.phone=ph;
 sb.auth.updateUser({data:{phone:ph,address:ad}});
 await hydrate();
 notif('Order placed ✅',data.id+' · '+fmt(data.total));
 if(S.prefs.email)callFn(MAIL_FN,{type:'order',token:TOKEN,orderId:data.id}).catch(()=>{});
 tab='account';pg='orders';draw();toast('Order placed')}
async function quote(btn){
 const item=v('qi');if(item.length<3){toast('Describe what you need');return}
 const id='QT-'+Date.now().toString(36).toUpperCase(),b=Number(v('qb'));
 btn.disabled=true;
 const{error}=await sb.from('quotes').insert({id,user_id:U.id,item,qty:Math.max(1,parseInt(v('qq'))||1),budget:b>0?b:null,note:v('qn')||null});
 btn.disabled=false;
 if(error){toast('Could not send your request. Try again.');return}
 await hydrate();notif('Quote requested',id+' · '+item);draw();toast('Quote request sent')}
function fund(){
 const a=Math.floor(Number(v('amt')));if(!(a>=100)){toast('Minimum is ₦100');return}
 if(PAYSTACK_KEY.startsWith('YOUR_')||!window.PaystackPop){toast('Payments are not set up yet');return}
 const ref='KZ'+Date.now()+Math.random().toString(36).slice(2,6).toUpperCase();
 PaystackPop.setup({key:PAYSTACK_KEY,email:U.email,amount:a*100,currency:'NGN',ref,metadata:{user_id:U.id},
  callback:function(r){confirmPay(r.reference)},onClose:function(){}}).openIframe()}
async function confirmPay(ref){
 toast('Confirming your payment…');
 for(let i=0;i<3;i++){
  try{const j=await callFn(['paystack-verify'],{token:TOKEN,reference:ref});
   if(j.ok){await hydrate();notif('Wallet funded',fmt(j.amount)+' added to your wallet.');toast('Wallet funded');return}
   if(j.error!=='not_successful')break}catch{}
  await new Promise(r=>setTimeout(r,2000))}
 toast('We could not confirm payment yet. If you were charged, your wallet updates shortly. Ref '+ref)}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-place],[data-quote],[data-fund]');if(!b)return;
 e.stopImmediatePropagation();e.preventDefault();
 if(b.hasAttribute('data-place'))place(b);else if(b.hasAttribute('data-quote'))quote(b);else fund()},true);
})();
