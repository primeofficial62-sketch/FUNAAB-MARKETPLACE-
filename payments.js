/* ============================================================
   payments.js  ·  FUNAAB Marketplace
   Three ways to pay, all plugged into your existing cart/checkout:
     1. cod      Pay on pickup / delivery
     2. transfer Bank transfer, the vendor confirms they received it
     3. gateway  Paystack OR Flutterwave (set CFG.GATEWAY below)

   Load it BEFORE your main <script> block:
     <script src="payments.js"></script>

   It uses your page's own helpers ($, esc, naira, toast, sb, S, SESSION,
   loadOrders, loadVendorData, rerender, route, chrome, currentCur,
   errText, vFriendly), so nothing else is needed.
   Everything lives under one name: PX
   ============================================================ */
const PX = (() => {

  /* ---------- SETTINGS: edit only this block ---------- */
  const CFG = {
    ENABLED: ['cod', 'transfer', 'gateway'],   // remove one to hide it from checkout
    GATEWAY: 'paystack',                       // 'paystack' or 'flutterwave'
    PAYSTACK_KEY: 'pk_test_REPLACE_ME',        // PUBLIC key only
    FLW_KEY: 'FLWPUBK_TEST-REPLACE_ME',        // PUBLIC key only
    VERIFY_FN: 'verify-payment'                // name of your Supabase Edge Function
  };
  const BANKS = ['Access Bank','Citibank','Ecobank','Fidelity Bank','First Bank','FCMB','GTBank','Keystone Bank','Kuda','Moniepoint','Opay','Palmpay','Polaris Bank','Stanbic IBTC','Sterling Bank','UBA','Union Bank','Wema Bank','Zenith Bank'];
  const GW_NAME = () => CFG.GATEWAY === 'flutterwave' ? 'Flutterwave' : 'Paystack';
  const METHODS = {
    cod:      { icon:'🤝', title:'Pay on pickup or delivery', sub:'Pay the vendor in cash or by transfer when you get your order' },
    transfer: { icon:'🏦', title:'Bank transfer',             sub:'Send money to the vendor\'s account. They confirm before they proceed' },
    gateway:  { icon:'💳', title:'Pay online',                sub:'Card, bank transfer or USSD, confirmed instantly' }
  };
  const state = { method: 'cod', tf: null };
  let onClose = null;

  /* ---------- styles (injected once, uses your colours) ---------- */
  const style = document.createElement('style');
  style.textContent = `
.px-opts{display:grid;gap:10px}
.px-opt{display:flex;gap:12px;align-items:center;text-align:left;width:100%;padding:14px;border-radius:16px;border:1.5px solid var(--line);background:#fff;transition:background-color .18s,border-color .18s,box-shadow .18s}
.px-opt:hover{background:var(--mist)}
.px-opt.on{border-color:var(--emerald);background:var(--mist);box-shadow:0 0 0 3px rgba(52,211,153,.25)}
.px-ico{font-size:1.4rem;width:44px;height:44px;display:grid;place-items:center;border-radius:12px;background:var(--mint);flex:none}
.px-opt b{display:block;font-size:.95rem}
.px-opt small{display:block;color:var(--ink-soft);font-weight:500;font-size:.8rem;line-height:1.35;margin-top:2px}
.px-dot{margin-left:auto;width:20px;height:20px;border-radius:50%;border:2px solid var(--line);flex:none}
.px-opt.on .px-dot{border-color:var(--emerald);background:radial-gradient(var(--emerald) 45%,transparent 50%)}
.px-note{font-size:.8rem;color:var(--ink-soft);margin-top:10px}
.px-modal{position:fixed;inset:0;z-index:80;background:rgba(3,40,27,.55);display:grid;place-items:end center}
.px-sheet{width:100%;max-width:520px;max-height:92vh;overflow:auto;background:#fff;border-radius:24px 24px 0 0;padding:22px 20px calc(22px + env(safe-area-inset-bottom,0px))}
@media(min-width:640px){.px-modal{place-items:center;padding:20px}.px-sheet{border-radius:24px}}
.px-bank{border:1.5px solid var(--line);border-radius:16px;padding:14px;margin:12px 0}
.px-row{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:6px 0;font-size:.92rem}
.px-row span:first-child{color:var(--ink-soft)}
.px-row b{text-align:right;word-break:break-all}
.px-copy{padding:4px 10px;border-radius:999px;border:1.5px solid var(--line);font-size:.78rem;font-weight:700;background:#fff}
.px-box{border-radius:14px;padding:12px;margin:10px 0;font-size:.88rem;background:var(--mist);border:1px solid var(--line)}
.px-box.warn{background:#fff7ed;border-color:#fed7aa}
.px-box.ok{background:#ecfdf5;border-color:#a7f3d0}
.px-wait{font-size:.85rem;font-weight:600;color:var(--ink-soft)}
.px-pick{display:grid;gap:10px;margin:14px 0}
`;
  document.head.appendChild(style);

  /* ---------- small helpers ---------- */
  const fail = e => {
    console.error('Payment error:', errText(e));
    const m = errText(e);
    if (/PGRST202|could not find the function|does not exist/i.test(m)) toast('Payments are not set up yet. Run payments.sql in Supabase.');
    else toast(vFriendly(e));
  };
  const loadScript = (src, test) => new Promise((res, rej) => {
    if (test()) return res();
    const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('script'));
    document.head.appendChild(s);
  });
  const keepInputs = fn => {
    const ids = ['#ckName', '#ckPhone', '#ckAddr'];
    const vals = ids.map(s => ($(s) || {}).value);
    fn();
    ids.forEach((s, i) => { const el = $(s); if (el && vals[i]) el.value = vals[i]; });
  };
  const copy = async text => {
    try { await navigator.clipboard.writeText(String(text)); toast('Copied'); }
    catch (e) { toast('Copy failed. Select and copy it by hand.'); }
  };
  const orderOf = ref => (S.orders || []).find(o => o.ref === ref);

  /* ---------- modal ---------- */
  function openModal(html){
    closeModal(true);
    const m = document.createElement('div');
    m.className = 'px-modal'; m.id = 'pxModal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = `<div class="px-sheet" id="pxSheet">${html}</div>`;
    m.addEventListener('click', e => { if (e.target === m) closeModal(); });
    document.body.appendChild(m); document.body.style.overflow = 'hidden';
  }
  function setSheet(html){ const s = $('#pxSheet'); if (s) s.innerHTML = html; }
  function closeModal(silent){
    const m = $('#pxModal'); if (m) m.remove();
    document.body.style.overflow = '';
    if (!silent && onClose){ const f = onClose; onClose = null; f(); }
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#pxModal')) closeModal(); });

  /* ============================================================
     CHECKOUT: the three-option panel
     ============================================================ */
  const note = () => ({
    cod: 'You pay the vendor directly when you collect or receive your order.',
    transfer: 'Place your order, then send the exact amount to the vendor\'s account and tap "I\'ve sent the money". The vendor confirms before they proceed.',
    gateway: `Pay securely with card, bank transfer or USSD through ${GW_NAME()}.`
  })[state.method];

   const bank = { cache:{}, pending:{} };
function bankCheck(sids){
  const need = sids.filter(id => !(id in bank.cache) && !bank.pending[id]);
  if (!need.length) return;
  need.forEach(id => { bank.pending[id] = true; });
  sb.rpc('stores_with_bank', { p_ids: need }).then(r => {
    if (r.error) throw r.error;
    const ok = new Set((r.data || []).map(x => (x && typeof x === 'object') ? Object.values(x)[0] : x));
    need.forEach(id => { bank.cache[id] = ok.has(id); delete bank.pending[id]; });
    if ($('.px-opts')) keepInputs(() => rerender());
  }).catch(e => { need.forEach(id => { delete bank.pending[id]; }); console.error('Bank check error:', e); });
}

function panel(){
  let sids = [];
  try { sids = Object.keys(groupByStore(cartTotals().lines)); } catch (e) {}
  bankCheck(sids);
  const noBank = sids.filter(id => bank.cache[id] === false);
  const opts = CFG.ENABLED.filter(id => id !== 'transfer' || !noBank.length);
  if (!opts.includes(state.method)) state.method = opts[0];
  return `<div class="panel glass" style="margin-bottom:16px"><h3 style="margin-bottom:10px">Payment method</h3>
      <div class="px-opts">${opts.map(id => { const m = METHODS[id]; return `
        <button type="button" class="px-opt ${state.method === id ? 'on' : ''}" data-px="method" data-id="${id}" aria-pressed="${state.method === id}">
          <span class="px-ico">${m.icon}</span><span><b>${id === 'gateway' ? 'Pay online (' + GW_NAME() + ')' : m.title}</b><small>${m.sub}</small></span><span class="px-dot"></span></button>`; }).join('')}
      </div><p class="px-note">${note()}</p>
      ${noBank.length ? `<p class="px-note">Bank transfer is hidden because ${noBank.length > 1 ? 'some stores in your cart have' : 'this store has'} not added bank details yet.</p>` : ''}</div>`;
}
   
  function panel(){
    if (!CFG.ENABLED.includes(state.method)) state.method = CFG.ENABLED[0];
    return `<div class="panel glass" style="margin-bottom:16px"><h3 style="margin-bottom:10px">Payment method</h3>
      <div class="px-opts">${CFG.ENABLED.map(id => { const m = METHODS[id]; return `
        <button type="button" class="px-opt ${state.method === id ? 'on' : ''}" data-px="method" data-id="${id}" aria-pressed="${state.method === id}">
          <span class="px-ico">${m.icon}</span><span><b>${id === 'gateway' ? 'Pay online (' + GW_NAME() + ')' : m.title}</b><small>${m.sub}</small></span><span class="px-dot"></span></button>`; }).join('')}
      </div><p class="px-note">${note()}</p></div>`;
  }
  const btnLabel = () => state.method === 'gateway' ? 'Pay & place order' : state.method === 'transfer' ? 'Place order & pay by transfer' : 'Place order';

  /* ============================================================
     AFTER THE ORDER IS CREATED
     ============================================================ */
  async function setMethod(refs, m){
    try { const r = await sb.rpc('set_pay_method', { p_refs: refs, p_method: m }); if (r.error) throw r.error; await loadOrders(); return true; }
    catch (e) { fail(e); return false; }
  }

  async function afterOrder(refs, method){
    if (method === 'cod') { await setMethod(refs, 'cod'); return true; }
    if (method === 'transfer') { await setMethod(refs, 'transfer'); await openTransfer(refs); return true; }
    if (method === 'gateway') { await setMethod(refs, 'gateway'); return payGateway(refs); }
    return true;
  }

  /* ---------- 3. Gateway (Paystack / Flutterwave) ---------- */
  async function verify(provider, reference, transactionId, orderRefs){
    const r = await sb.functions.invoke(CFG.VERIFY_FN, { body: { provider, reference, transaction_id: transactionId || null, refs: orderRefs } });
    if (r.error || !r.data || !r.data.verified) throw (r.error || new Error('Not verified'));
    await loadOrders();
  }

  async function payGateway(refs){
    const list = (S.orders || []).filter(o => refs.includes(o.ref) && o.payment_status !== 'paid');
    if (!list.length) return true;
    if (!SESSION || !SESSION.email){ toast('Your account has no email for payment.'); return false; }
    const flw = CFG.GATEWAY === 'flutterwave';
    try {
      if (flw) await loadScript('https://checkout.flutterwave.com/v3.js', () => window.FlutterwaveCheckout);
      else await loadScript('https://js.paystack.co/v1/inline.js', () => window.PaystackPop);
    } catch (e) { toast('Online payment is unavailable. Check your connection.'); return false; }

    const amount = list.reduce((a, o) => a + Number(o.total), 0);
    const orderRefs = list.map(o => o.ref);
    const ref = 'FM' + Date.now() + Math.random().toString(36).slice(2, 7).toUpperCase();
    let done = false;

    return new Promise(resolve => {
      const finish = (provider, reference, txId) => {
        done = true; toast('Confirming your payment…');
        verify(provider, reference, txId, orderRefs)
          .then(() => { toast('Payment confirmed'); resolve(true); })
          .catch(e => { console.error('Verify error:', errText(e)); toast('Could not confirm payment. If you were charged, contact support with ref ' + reference); resolve(false); });
      };
      const cancelled = () => { if (!done){ done = true; toast('Payment cancelled. You can pay later from My orders.'); resolve(false); } };
      try {
        if (flw) {
          FlutterwaveCheckout({
            public_key: CFG.FLW_KEY, tx_ref: ref, amount, currency: 'NGN',
            payment_options: 'card,banktransfer,ussd',
            customer: { email: SESSION.email, name: SESSION.name || USER.name },
            meta: { order_refs: orderRefs.join(',') },
            customizations: { title: BRAND, description: 'Order ' + orderRefs.join(', ') },
            callback: data => {
              if (done) return;
              if (data && (data.status === 'successful' || data.status === 'completed')) finish('flutterwave', ref, data.transaction_id);
              else { done = true; toast('Payment was not completed.'); resolve(false); }
            },
            onclose: cancelled
          });
        } else {
          PaystackPop.setup({
            key: CFG.PAYSTACK_KEY, email: SESSION.email, amount: Math.round(amount * 100), currency: 'NGN', ref,
            metadata: { order_refs: orderRefs },
            callback: res => finish('paystack', res.reference, null),
            onClose: cancelled
          }).openIframe();
        }
      } catch (e) { console.error('Gateway error:', errText(e)); toast('Could not open payment window.'); resolve(false); }
    });
  }

  /* ---------- 2. Bank transfer with vendor confirmation ---------- */
  async function openTransfer(refs){
    const orders = (S.orders || []).filter(o => refs.includes(o.ref) && o.payment_status !== 'paid');
    if (!orders.length) return;
    toast('Getting the vendor\'s bank details…');
    const banks = {};
    await Promise.all(orders.map(async o => {
      try { const r = await sb.rpc('get_order_bank', { p_ref: o.ref }); if (r.error) throw r.error; banks[o.ref] = (r.data && r.data[0]) || null; }
      catch (e) { console.error('Bank details error:', errText(e)); banks[o.ref] = null; }
    }));
    state.tf = { refs: orders.map(o => o.ref), banks };
    return new Promise(resolve => { onClose = resolve; openModal(transferHTML()); });
  }

  function transferHTML(){
    const tf = state.tf;
    const cards = tf.refs.map(ref => {
      const o = orderOf(ref), b = tf.banks[ref]; if (!o) return '';
      const waiting = o.payment_status === 'awaiting_confirmation';
      const has = b && b.account_number;
      return `<div class="px-bank"><b>${esc(o.store_name || (b && b.store_name) || 'Vendor')}</b> <span style="color:var(--ink-soft);font-size:.85rem">· ${esc(o.ref)}</span>
        ${has ? `
          <div class="px-row"><span>Bank</span><b>${esc(b.bank_name)}</b></div>
          <div class="px-row"><span>Account name</span><b>${esc(b.account_name)}</b></div>
          <div class="px-row"><span>Account number</span><b>${esc(b.account_number)}</b><button class="px-copy" data-px="copy" data-v="${esc(b.account_number)}">Copy</button></div>
          <div class="px-row"><span>Amount</span><b>${naira(o.total)}</b><button class="px-copy" data-px="copy" data-v="${esc(o.total)}">Copy</button></div>
          <div class="px-row"><span>Narration</span><b>${esc(o.ref)}</b><button class="px-copy" data-px="copy" data-v="${esc(o.ref)}">Copy</button></div>
          ${o.payment_status === 'rejected' ? `<div class="px-box warn">The vendor did not see this payment. Check your transfer and send it again, or message the vendor.</div>` : ''}
          ${waiting ? `<div class="px-box ok">✅ Sent. Waiting for the vendor to confirm.</div>` : `
            <div class="field" style="margin:10px 0"><label>Name on your account or time you sent it (optional)</label><input class="px-note-in" data-id="${esc(o.ref)}" maxlength="80" placeholder="e.g. Ade B., 2:15pm"></div>
            <button class="btn btn-primary btn-block" data-px="sent" data-id="${esc(o.ref)}">I've sent the money</button>`}
        ` : `
          <div class="px-box warn">This vendor has not added bank details yet. Message them, or pay on pickup or delivery instead.</div>
          <button class="btn btn-ghost btn-block" data-px="tocod" data-id="${esc(o.ref)}">Pay on pickup or delivery instead</button>`}
      </div>`;
    }).join('');
    const allSent = tf.refs.every(r => { const o = orderOf(r); return !o || o.payment_status === 'awaiting_confirmation' || o.payment_status === 'paid'; });
    return `<h2 style="font-size:1.4rem;margin-bottom:6px">Pay by bank transfer</h2>
      <p style="font-size:.88rem;color:var(--ink-soft)">Send the exact amount, use the narration shown, then tap the button. The vendor will confirm and start your order.</p>
      ${cards}
      <button class="btn btn-ghost btn-block" data-px="closemodal">${allSent ? 'Done' : 'I\'ll pay later'}</button>`;
  }

  async function markSent(ref){
    const inp = $$('.px-note-in').find(i => i.dataset.id === ref);
    const note = inp ? inp.value.trim().slice(0, 80) : '';
    try {
      const r = await sb.rpc('submit_transfer', { p_ref: ref, p_note: note || null });
      if (r.error) throw r.error;
      await loadOrders(); toast('Sent to the vendor for confirmation');
      setSheet(transferHTML());
    } catch (e) { fail(e); }
  }

  /* ---------- My orders: "Pay now" ---------- */
  function chooser(ref){
    const o = orderOf(ref); if (!o) return;
    const opts = ['transfer', 'gateway'].filter(m => CFG.ENABLED.includes(m));
    onClose = null;
    openModal(`<h2 style="font-size:1.4rem;margin-bottom:6px">How do you want to pay?</h2>
      <p style="font-size:.88rem;color:var(--ink-soft)">Order ${esc(o.ref)} · ${naira(o.total)}</p>
      <div class="px-pick">${opts.map(id => `<button class="px-opt" data-px="pickpay" data-id="${esc(ref)}" data-m="${id}"><span class="px-ico">${METHODS[id].icon}</span><span><b>${id === 'gateway' ? 'Pay online (' + GW_NAME() + ')' : METHODS[id].title}</b><small>${METHODS[id].sub}</small></span></button>`).join('')}</div>
      <button class="btn btn-ghost btn-block" data-px="closemodal">Not now</button>`);
  }

  async function payNow(ref){
    const o = orderOf(ref); if (!o || o.payment_status === 'paid') return;
    if (o.pay_method === 'transfer' && CFG.ENABLED.includes('transfer')) return openTransfer([ref]);
    if (o.pay_method === 'gateway' && CFG.ENABLED.includes('gateway')) { const ok = await payGateway([ref]); if (ok) rerender(); return; }
    chooser(ref);
  }

  /* ============================================================
     PIECES YOU DROP INTO EXISTING SCREENS
     ============================================================ */
  const tag = o =>
    o.payment_status === 'paid' ? ' · Paid ✓'
    : o.payment_status === 'awaiting_confirmation' ? ' · Awaiting vendor confirmation'
    : o.payment_status === 'rejected' ? ' · Payment not received'
    : o.pay_method === 'transfer' ? ' · Bank transfer pending'
    : o.pay_method === 'gateway' ? ' · Online payment pending'
    : o.pay_method === 'cod' ? ' · Pay on handover' : '';

  function buyerPayBtn(o){
    if (o.payment_status === 'paid') return '';
    if (o.payment_status === 'awaiting_confirmation') return `<span class="px-wait">⏳ Waiting for the vendor to confirm</span>`;
    return `<button class="btn btn-primary btn-sm" data-px="paynow" data-id="${esc(o.ref)}">${o.pay_method === 'transfer' ? 'Pay by transfer' : 'Pay now'}</button>`;
  }

  function successNote(list){
    const os = (S.orders || []).filter(o => list.includes(o.ref));
    if (os.length && os.every(o => o.payment_status === 'paid')) return 'Payment received. Your order was sent to the vendor.';
    if (os.some(o => o.payment_status === 'awaiting_confirmation')) return 'Your order was sent. The vendor will confirm your transfer, then start on it.';
    if (os.some(o => o.pay_method === 'transfer')) return 'Your order was sent. To finish, tap Pay by transfer in My orders and press "I\'ve sent the money".';
    if (os.some(o => o.pay_method === 'gateway')) return 'Your order was sent, but your online payment is not confirmed yet. Tap Pay now in My orders to finish.';
    return 'Your order was sent to the vendor. Pay them directly when you collect or receive it.';
  }

  /* vendor: payment block inside each order card */
  function vendorPay(o){
    if (o.status === 'cancelled') return '';
    const amt = naira(o.total);
    if (o.payment_status === 'paid')
      return `<div class="px-box ok">✅ Payment of ${amt} confirmed${o.pay_method === 'gateway' ? ' online' : ''}. Safe to continue with this order.</div>`;
    if (o.payment_status === 'awaiting_confirmation')
      return `<div class="px-box warn"><b>Customer says they sent ${amt} by bank transfer.</b><br>${o.transfer_note ? 'Note: ' + esc(o.transfer_note) + '<br>' : ''}Check your bank app first. Only confirm when the money is in your account.
        <div class="vact" style="margin-top:10px"><button class="btn btn-primary btn-sm" data-px="confirm" data-id="${o.id}" data-ok="1">Confirm payment</button><button class="btn btn-danger btn-sm" data-px="confirm" data-id="${o.id}" data-ok="0">Not received</button></div></div>`;
    if (o.payment_status === 'rejected')
      return `<div class="px-box warn">You marked this payment as not received. Waiting for the customer to pay again.</div>`;
    if (o.pay_method === 'transfer')
      return `<div class="px-box warn">⏳ Waiting for the customer's bank transfer of ${amt}. Do not deliver until you confirm it.</div>`;
    if (o.pay_method === 'gateway')
      return `<div class="px-box warn">⏳ Online payment of ${amt} not confirmed yet. Do not deliver until it shows as paid.</div>`;
    return `<div class="px-box">🤝 Customer pays ${amt} on ${o.fulfil === 'delivery' ? 'delivery' : 'pickup'}. Collect it when you hand over the order.</div>`;
  }

  async function confirmPay(id, ok){
    if (!confirm(ok ? 'Confirm that this payment is in your account?' : 'Mark this payment as NOT received? The customer will be asked to pay again.')) return;
    try {
      const r = await sb.rpc('confirm_payment', { p_order: String(id), p_ok: ok });
      if (r.error) throw r.error;
      toast(ok ? 'Payment confirmed' : 'Marked as not received');
      await Promise.all([loadOrders(), loadVendorData()]); chrome(currentCur()); route(true);
    } catch (e) { fail(e); }
  }

  /* vendor: bank details form (goes in Settings) */
  function vendorBank(){
    const s = S.vstore || {};
    return `<div class="panel glass" style="max-width:640px;margin-top:16px"><h3 style="margin-bottom:6px">Bank details for transfers</h3>
      <p style="color:var(--ink-soft);font-size:.88rem;margin-bottom:12px">Customers who choose bank transfer will see these details. Use an account in your own name.</p>
      <div class="field"><label for="pxBankName">Bank</label><input id="pxBankName" list="pxBanks" autocomplete="off" value="${esc(s.bank_name)}" placeholder="e.g. Opay"><datalist id="pxBanks">${BANKS.map(b => `<option value="${esc(b)}">`).join('')}</datalist><div class="err" id="ePxBank"></div></div>
      <div class="field"><label for="pxAcctName">Account name</label><input id="pxAcctName" autocomplete="off" value="${esc(s.account_name)}"><div class="err" id="ePxName"></div></div>
      <div class="field"><label for="pxAcctNo">Account number</label><input id="pxAcctNo" inputmode="numeric" maxlength="10" value="${esc(s.account_number)}" placeholder="10 digits"><div class="err" id="ePxNo"></div></div>
      <button class="btn btn-primary" data-px="savebank">Save bank details</button></div>`;
  }

  async function saveBank(btn){
    const bank = $('#pxBankName').value.trim(), name = $('#pxAcctName').value.trim(), no = $('#pxAcctNo').value.replace(/\s/g, '');
    let bad = false;
    $('#ePxBank').textContent = bank.length >= 2 ? '' : (bad = true, 'Enter your bank.');
    $('#ePxName').textContent = name.length >= 3 ? '' : (bad = true, 'Enter the account name.');
    $('#ePxNo').textContent = /^\d{10}$/.test(no) ? '' : (bad = true, 'Account number must be 10 digits.');
    if (bad) return;
    btn.disabled = true; btn.textContent = 'Saving…';
    try {
      const r = await sb.rpc('save_store_bank', { p_bank: bank, p_name: name, p_number: no });
      if (r.error) throw r.error;
      S.vstore = Object.assign({}, S.vstore, { bank_name: bank, account_name: name, account_number: no });
      toast('Bank details saved');
    } catch (e) { fail(e); }
    btn.disabled = false; btn.textContent = 'Save bank details';
  }

  /* ============================================================
     ONE click listener for everything above (data-px="...")
     ============================================================ */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-px]'); if (!t) return;
    const d = t.dataset;
    switch (d.px) {
      case 'method':     state.method = d.id; keepInputs(() => rerender()); break;
      case 'paynow':     payNow(d.id); break;
      case 'pickpay':    { const ref = d.id, m = d.m; closeModal(true); setMethod([ref], m).then(ok => { if (!ok) return; if (m === 'transfer') openTransfer([ref]); else payGateway([ref]).then(done => { if (done) rerender(); }); }); break; }
      case 'sent':       markSent(d.id); break;
      case 'tocod':      setMethod([d.id], 'cod').then(() => { closeModal(); rerender(); }); break;
      case 'copy':       copy(d.v); break;
      case 'closemodal': closeModal(); rerender(); break;
      case 'confirm':    confirmPay(d.id, d.ok === '1'); break;
      case 'savebank':   saveBank(t); break;
    }
  });

  return {
    get method(){ return state.method; }, set method(v){ state.method = v; },
    panel, btnLabel, afterOrder, payNow, tag, buyerPayBtn, successNote, vendorPay, vendorBank
  };
})();
