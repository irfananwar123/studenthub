(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool;
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var status = document.getElementById('ct-status');
    function message() {
      var name = T.value('ct-name'), email = T.value('ct-email');
      return 'Subject: ' + T.value('ct-subject') + '\n\n' + document.getElementById('ct-message').value +
        '\n\n---\nName: ' + (name || 'Not provided') + '\nEmail: ' + (email || 'Not provided');
    }
    function validate() {
      var subject = T.value('ct-subject'), body = document.getElementById('ct-message').value.trim();
      var email = document.getElementById('ct-email');
      if (!subject || !body) { status.textContent = 'Add a subject and a message.'; return false; }
      if (email.value && !email.checkValidity()) { status.textContent = 'Enter a valid email address or leave the field empty.'; return false; }
      status.textContent = '';
      return true;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;
      var address = (SH.config && SH.config.contactEmail) || '';
      if (!address) {
        status.textContent = 'No contact address is configured yet. Use Copy message, or set StudentHub.config.contactEmail in assets/js/config.js before publishing.';
        return;
      }
      var subject = encodeURIComponent(T.value('ct-subject'));
      var body = encodeURIComponent(message());
      window.location.href = 'mailto:' + encodeURIComponent(address) + '?subject=' + subject + '&body=' + body;
      status.textContent = 'Your email app should open with the message ready to send.';
    });
    document.getElementById('ct-copy').addEventListener('click', function () {
      if (!validate()) return;
      T.copyText(message(), this);
    });
  });
})();
