import React, { useState } from 'react';
import { MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/Seo';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { useLocale } from '@/i18n/LocaleProvider';
import { pathFor } from '@/i18n/routes';
import { submitContactForm } from '@/services/api';
import { COMPANY } from '@/data/company';

/** Contact Form 7 form id in WordPress. */
const FORM_ID = 203;

const EMPTY_FORM = { name: '', email: '', phone: '', subject: '', message: '' };

export default function ContactPage() {
  const { t } = useTranslation('contact');
  const locale = useLocale();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const result = await submitContactForm(FORM_ID, {
        'your-name': formData.name,
        'your-email': formData.email,
        'your-phone': formData.phone,
        'your-subject': formData.subject,
        'your-message': formData.message,
        'your-locale': locale,
      });

      if (result.status === 'mail_sent') {
        setStatus({ type: 'success', message: t('form.success') });
        setFormData(EMPTY_FORM);
      } else {
        setStatus({ type: 'error', message: result.message || t('form.error') });
      }
    } catch {
      setStatus({ type: 'error', message: t('form.error') });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'tel', required: false },
    { name: 'subject', type: 'text', required: true },
  ];

  const contactDetails = [
    { key: 'address', Icon: MapPin, value: COMPANY.address.full },
    { key: 'phone', Icon: Phone, value: COMPANY.telephoneDisplay, href: `tel:${COMPANY.telephone}` },
    { key: 'email', Icon: Mail, value: COMPANY.email, href: `mailto:${COMPANY.email}` },
  ];

  return (
    <>
      <Seo routeKey="contact" />
      <BreadcrumbJsonLd
        items={[
          { name: COMPANY.name, path: pathFor('home', locale) },
          { name: t('title'), path: pathFor('contact', locale) },
        ]}
      />

      <main className="bg-[#1a1b1e] text-white pt-20 min-h-screen">
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-[#d4af37] font-bold tracking-wider text-sm uppercase mb-2 block">
                {t('eyebrow')}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>
            </div>

            <div className="max-w-5xl mx-auto bg-[#25262b] rounded-2xl overflow-hidden shadow-2xl border border-[#333]">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-10 lg:p-12 bg-[#111] text-white flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">{t('info.title')}</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">{t('info.description')}</p>

                    <address className="space-y-6 not-italic">
                      {contactDetails.map((detail) => (
                        <div key={detail.key} className="flex items-start gap-4">
                          <div className="p-3 bg-[#25262b] rounded-lg text-[#d4af37]">
                            <detail.Icon className="h-6 w-6" aria-hidden="true" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">{t(`info.${detail.key}`)}</h3>
                            {detail.href ? (
                              <a
                                href={detail.href}
                                className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
                              >
                                {detail.value}
                              </a>
                            ) : (
                              <p className="text-gray-400 text-sm">{detail.value}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </address>
                  </div>

                  <p className="mt-12 pt-8 border-t border-[#333] text-xs text-gray-500">
                    © {new Date().getFullYear()} {COMPANY.name}
                  </p>
                </div>

                <div className="p-10 lg:p-12 bg-[#1f2024]">
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    {fields.map((field) => (
                      <div key={field.name}>
                        <label
                          htmlFor={`contact-${field.name}`}
                          className="block text-sm font-medium text-gray-400 mb-2"
                        >
                          {t(`form.${field.name}`)}
                        </label>
                        <input
                          id={`contact-${field.name}`}
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          required={field.required}
                          placeholder={t(`form.${field.name}Placeholder`)}
                          className="w-full bg-[#1a1b1e] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                        />
                      </div>
                    ))}

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-sm font-medium text-gray-400 mb-2"
                      >
                        {t('form.message')}
                      </label>
                      <textarea
                        id="contact-message"
                        rows="4"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder={t('form.messagePlaceholder')}
                        className="w-full bg-[#1a1b1e] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                      />
                    </div>

                    {status && (
                      <p
                        role="status"
                        className={`p-4 rounded-lg ${
                          status.type === 'success'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {status.message}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-lg hover:bg-white transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading && <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />}
                      {loading ? t('form.submitting') : t('form.submit')}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
