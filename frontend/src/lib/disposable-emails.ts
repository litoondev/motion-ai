// Disposable/temporary email domains – safe to import in both client and server
const BLOCKED_DOMAINS = [
  "mailinator.com","guerrillamail.com","tempmail.com","throwam.com",
  "yopmail.com","sharklasers.com","guerrillamailblock.com","grr.la",
  "guerrillamail.info","guerrillamail.biz","guerrillamail.de","guerrillamail.net",
  "guerrillamail.org","spam4.me","trashmail.com","trashmail.me","trashmail.net",
  "fakeinbox.com","mailnull.com","maildrop.cc","dispostable.com","discard.email",
  "throwaway.email","temp-mail.org","tmpmail.net","getnada.com","getairmail.com",
  "mohmal.com","mailnesia.com","tempr.email","spamgourmet.com","trashmail.io",
];

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return BLOCKED_DOMAINS.includes(domain ?? "");
}
