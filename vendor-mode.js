/* =========================================================
   FUNAAB Marketplace · Vendor mode for the main site
   ---------------------------------------------------------
   Load this on EVERY page of the main site.

   In your HTML, mark elements like this:
     data-vendor-only   -> shown only to approved vendors
                           (e.g. the "Vendor Dashboard" button)
     data-hide-vendor   -> hidden from approved vendors
                           (e.g. "Become a Vendor", the
                            "Apply now" banner)
   Everything else stays visible, because vendors can still shop.

   This only changes what is SHOWN. Your backend must still
   check the vendor role on every vendor request.
   ========================================================= */
(function () {
  function isApprovedVendor(user) {
    return !!user && Array.isArray(user.roles) && user.roles.includes('vendor');
  }

  function apply(user) {
    var vendor = isApprovedVendor(user);
    document.documentElement.classList.toggle('is-vendor', vendor);
    document.querySelectorAll('[data-vendor-only]').forEach(function (el) { el.hidden = !vendor; });
    document.querySelectorAll('[data-hide-vendor]').forEach(function (el) { el.hidden = vendor; });
    return vendor;
  }

  function toast(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.setAttribute('role', 'status');
    t.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#064e3b;color:#fff;padding:12px 18px;border-radius:12px;font:500 15px system-ui;z-index:9999;box-shadow:0 18px 30px -12px rgba(0,0,0,.4)';
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 5000);
  }

  var wasVendor = null;

  // Call this whenever you learn the user's current roles
  // (on page load, and again when the backend says they changed).
  function update(user) {
    var now = apply(user);
    if (wasVendor === false && now) {
      toast('Your vendor application was approved. Your dashboard is ready.');
    }
    wasVendor = now;
  }

  window.FunaabVendorMode = { update: update };

  /* ---- Wire it up (replace with your own auth/backend) ----
     1) On page load, fetch the signed-in user and call:
          FunaabVendorMode.update(user)      // user = { roles: ['customer','vendor'] }

     2) For the instant switch on approval, listen for changes to
        that user's roles from your backend, then fetch the user
        again and call update(user). Example with Supabase realtime:

          supabase.channel('my-roles')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'user_roles',
                  filter: 'user_id=eq.' + user.id },
                async function () {
                  var fresh = await fetchCurrentUser();
                  FunaabVendorMode.update(fresh);
                })
            .subscribe();

        If you don't have realtime, poll every 20-30 seconds while the
        user's application status is "Submitted" or "Under Review".
  ------------------------------------------------------------ */
})();
