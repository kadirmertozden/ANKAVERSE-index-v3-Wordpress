/**
 * Corporate facts, kept in one place because they feed three consumers at
 * once: the About page table, the Contact page, and the Organization
 * structured data Google uses to decide whether ANKAVERSE is a real entity
 * worth a knowledge panel. Inconsistencies between those three read as low
 * trust signals.
 */
export const COMPANY = {
  name: 'ANKAVERSE',
  legalName: 'ANKAVERSE E-Ticaret ve Teknoloji Ltd. Şti.',
  url: 'https://ankaverse.com.tr',
  logo: 'https://ankaverse.com.tr/favicon-4-Buyuk.png',
  email: 'info@ankaverse.com.tr',
  telephone: '+905384951696',
  telephoneDisplay: '+90 (538) 495 16 96',
  foundingDate: '2025-07-09',
  mersis: '0070121668800001',
  tradeRegistryNo: '1089705',
  taxOffice: 'GÖZTEPE VERGİ DAİRESİ',
  taxNumber: '0701216688',
  tradeRegistryOffice: 'İSTANBUL TİCARET SİCİLİ MÜDÜRLÜĞÜ',
  address: {
    street: 'Fenerbahçe Mah. İğrip Sk. No: 13 İç Kapı No: 1',
    locality: 'Kadıköy',
    region: 'İstanbul',
    country: 'TR',
    full: 'Fenerbahçe Mah. İğrip Sk. No: 13 İç Kapı No: 1 Kadıköy / İSTANBUL',
  },
  founders: [
    { name: 'Kadir Mert Özden', roleKey: 'director', share: 51 },
    { name: 'Ramazan Tanrıseven', roleKey: 'boardChair', share: 49 },
  ],
  social: {
    instagram: 'https://www.instagram.com/ankaverse.2025/',
    linkedin: 'https://www.linkedin.com/company/ankaverse',
    x: 'https://x.com/ankaverseltd',
  },
  storeUrl: 'https://eticaret.ankaverse.com.tr',
};

export const COMPANY_SAME_AS = Object.values(COMPANY.social);

export default COMPANY;
