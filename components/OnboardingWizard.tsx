'use client';

import React, { useState } from 'react';
import {
  Building2,
  FileCheck2,
  Package,
  Globe2,
  FileUp,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
} from 'lucide-react';
import DocumentDropzone from '@/components/DocumentDropzone';
import { completeOnboardingAction } from '@/app/actions';

interface OnboardingWizardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  initialBusiness?: any;
}

interface ProductItem {
  id: string;
  name: string;
  category: string;
  hsCode: string;
  description: string;
  noHsCodeYet: boolean;
}

const INDUSTRY_OPTIONS = [
  { id: 'Textiles & Garments', label: 'Textiles & Apparel', desc: 'Readymade garments, silk, cotton, home textiles' },
  { id: 'Food & Processed Agri', label: 'Food & Agriculture', desc: 'Spices, grains, processed foods, mango pulp' },
  { id: 'Engineering & Machinery', label: 'Engineering Goods', desc: 'Industrial valves, pumps, precision machinery' },
  { id: 'Chemicals & Petrochemicals', label: 'Chemicals & Allied', desc: 'Specialty chemicals, polymers, dyes & pigments' },
  { id: 'Pharmaceuticals & Healthcare', label: 'Pharmaceuticals', desc: 'APIs, generic formulations, medical devices' },
  { id: 'Metals & Steel', label: 'Iron, Steel & Metals', desc: 'Alloy castings, steel pipes, metal structures' },
  { id: 'Gems & Jewellery', label: 'Gems & Jewellery', desc: 'Gold ornaments, cut & polished diamonds, silver' },
  { id: 'Leather & Footwear', label: 'Leather & Footwear', desc: 'Finished leather, safety shoes, leather goods' },
  { id: 'Handicrafts & Handlooms', label: 'Handicrafts', desc: 'Brassware, handloom carpets, wooden crafts' },
  { id: 'Electronics & Electricals', label: 'Electronics', desc: 'Solar modules, consumer electronics, wire harnesses' },
  { id: 'Other Merchandise', label: 'Other Merchandise', desc: 'General manufactured merchandise & commodities' },
];

const TARGET_DESTINATIONS = [
  { name: 'United Arab Emirates', isoCode: 'AE', region: 'Middle East', badge: 'India-UAE CEPA 0% Duty' },
  { name: 'United States', isoCode: 'US', region: 'North America', badge: 'US Customs / FDA Trade' },
  { name: 'Germany', isoCode: 'DE', region: 'European Union', badge: 'EU Single Market / CE' },
  { name: 'United Kingdom', isoCode: 'GB', region: 'Europe', badge: 'UKCA / Rules of Origin' },
  { name: 'Saudi Arabia', isoCode: 'SA', region: 'Middle East', badge: 'SASO Saber Corridor' },
  { name: 'Singapore', isoCode: 'SG', region: 'ASEAN', badge: 'AIFTA Duty Framework' },
  { name: 'Vietnam', isoCode: 'VN', region: 'ASEAN', badge: 'AIFTA Preferential Trade' },
  { name: 'Australia', isoCode: 'AU', region: 'Oceania', badge: 'ECTA Free Trade Agreement' },
  { name: 'Netherlands', isoCode: 'NL', region: 'European Union', badge: 'Rotterdam Port Gateway' },
  { name: 'Japan', isoCode: 'JP', region: 'Asia Pacific', badge: 'India-Japan CEPA' },
];

export default function OnboardingWizard({ user, initialBusiness }: OnboardingWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form state
  // Step 1
  const [companyName, setCompanyName] = useState<string>(initialBusiness?.displayName || `${user.name} Global Exports`);
  const [businessType, setBusinessType] = useState<'MANUFACTURER' | 'MERCHANT' | 'BOTH'>('MANUFACTURER');

  // Step 2
  const [legalName, setLegalName] = useState<string>(initialBusiness?.legalName || '');
  const [officialEmail, setOfficialEmail] = useState<string>(user.email || '');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>(initialBusiness?.location || '');
  const [city, setCity] = useState<string>(initialBusiness?.city || 'Mumbai');
  const [state, setState] = useState<string>(initialBusiness?.state || 'Maharashtra');
  const [country, setCountry] = useState<string>('India');
  const [gstin, setGstin] = useState<string>(initialBusiness?.gstStatus?.match(/\(([^)]+)\)/)?.[1] || '');
  const [hasIec, setHasIec] = useState<boolean>(true);
  const [iec, setIec] = useState<string>(initialBusiness?.iecStatus?.match(/\(([^)]+)\)/)?.[1] || '');
  const [udyamNumber, setUdyamNumber] = useState<string>('');

  // Step 3
  const [industry, setIndustry] = useState<string>('Textiles & Garments');
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: 'p1',
      name: '100% Organic Cotton Knitted Apparel',
      category: 'Textiles & Garments',
      hsCode: '6109.10.00',
      description: 'Men & Women cotton casual t-shirts and apparel',
      noHsCodeYet: false,
    },
  ]);

  // Step 4
  const [selectedDestinations, setSelectedDestinations] = useState<Array<{ name: string; isoCode: string }>>([
    { name: 'United Arab Emirates', isoCode: 'AE' },
    { name: 'United States', isoCode: 'US' },
  ]);
  const [customDestination, setCustomDestination] = useState<string>('');

  // Step 5: Document selection
  const [selectedDocs, setSelectedDocs] = useState<{ [key: string]: boolean }>({
    gstDoc: true,
    iecDoc: true,
    udyamDoc: false,
    rcmcDoc: false,
    cooDoc: false,
    otherDoc: false,
  });

  // Step validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateStep = (currentStep: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!companyName.trim()) newErrors.companyName = 'Company / Organization name is required';
    }

    if (currentStep === 2) {
      if (!officialEmail.trim() || !officialEmail.includes('@')) {
        newErrors.officialEmail = 'Valid official email address is required';
      }
      if (gstin.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.trim().toUpperCase())) {
        newErrors.gstin = 'Invalid GSTIN format (e.g. 27AAAAA0000A1Z5)';
      }
      if (hasIec && iec.trim() && !/^[0-9A-Z]{10}$/i.test(iec.trim())) {
        newErrors.iec = 'DGFT IEC must be a 10-digit alphanumeric code';
      }
    }

    if (currentStep === 3) {
      if (!industry) newErrors.industry = 'Please select your primary industry';
      if (products.length === 0) newErrors.products = 'Please add at least one export product';
      for (const p of products) {
        if (!p.name.trim()) newErrors.productName = 'Each product must have a name';
      }
    }

    if (currentStep === 4) {
      if (selectedDestinations.length === 0) {
        newErrors.destinations = 'Please select at least one target export market';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addProduct = () => {
    const newProd: ProductItem = {
      id: `p_${Date.now()}`,
      name: '',
      category: industry,
      hsCode: '',
      description: '',
      noHsCodeYet: false,
    };
    setProducts([...products, newProd]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const updateProduct = (id: string, field: keyof ProductItem, value: any) => {
    setProducts(
      products.map((p) => {
        if (p.id === id) {
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  };

  const toggleDestination = (dest: { name: string; isoCode: string }) => {
    const exists = selectedDestinations.some((d) => d.name === dest.name);
    if (exists) {
      if (selectedDestinations.length > 1) {
        setSelectedDestinations(selectedDestinations.filter((d) => d.name !== dest.name));
      }
    } else {
      setSelectedDestinations([...selectedDestinations, dest]);
    }
  };

  const addCustomDestination = () => {
    if (customDestination.trim()) {
      const isUae = customDestination.toLowerCase().includes('emirates') || customDestination.toLowerCase().includes('uae');
      setSelectedDestinations([
        ...selectedDestinations,
        {
          name: customDestination.trim(),
          isoCode: isUae ? 'AE' : 'US',
        },
      ]);
      setCustomDestination('');
    }
  };

  const stepLabels = [
    { num: 1, title: 'Organization' },
    { num: 2, title: 'Business Details' },
    { num: 3, title: 'Industry & Products' },
    { num: 4, title: 'Destinations' },
    { num: 5, title: 'Documents' },
    { num: 6, title: 'Review & Launch' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
              VF
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                VyaparFlow <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded-full">Onboarding</span>
              </span>
              <p className="text-[11px] text-slate-400">MSME Exporter Workspace Setup</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Logged in as <span className="text-slate-200 font-medium">{user.email}</span></span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1">
        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-emerald-400">Step {step} of 6: {stepLabels[step - 1].title}</span>
            <span className="text-slate-400 font-mono">{Math.round((step / 6) * 100)}% Complete</span>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {stepLabels.map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < step) setStep(s.num);
                }}
                disabled={s.num > step}
                className={`h-2 rounded-full transition-all ${
                  s.num === step
                    ? 'bg-emerald-500 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-500/20'
                    : s.num < step
                    ? 'bg-emerald-700/80 cursor-pointer hover:bg-emerald-600'
                    : 'bg-slate-800'
                }`}
                title={`Step ${s.num}: ${s.title}`}
              />
            ))}
          </div>

          <div className="hidden sm:flex justify-between mt-2 text-[11px] text-slate-400">
            {stepLabels.map((s) => (
              <span
                key={s.num}
                className={`${s.num === step ? 'text-emerald-400 font-medium' : s.num < step ? 'text-slate-300' : 'text-slate-600'}`}
              >
                {s.num}. {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Wizard Form Wrapper */}
        <form
          action={completeOnboardingAction}
          onSubmit={() => setIsSubmitting(true)}
          className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm"
        >
          {/* Hidden JSON Fields for complex step data */}
          <input type="hidden" name="products" value={JSON.stringify(products)} />
          <input type="hidden" name="destinations" value={JSON.stringify(selectedDestinations)} />

          {/* ========================================================================= */}
          {/* STEP 1: CREATE ORGANIZATION                                                */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-800 pb-5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Building2 className="w-4 h-4" /> Workspace Identity
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Create your organization</h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Set up your business workspace to manage compliance, certifications, logistics, and shipments.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Company / Organization Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Global Exports Pvt Ltd"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                  {errors.companyName && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.companyName}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    This brand name will appear on your dashboard, client quotes, and platform exports.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-2">
                    Business Operational Model <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        value: 'MANUFACTURER',
                        title: 'Manufacturer Exporter',
                        desc: 'You produce goods in your own factory or facility for export.',
                      },
                      {
                        value: 'MERCHANT',
                        title: 'Merchant Exporter',
                        desc: 'You procure goods from domestic manufacturers to export overseas.',
                      },
                      {
                        value: 'BOTH',
                        title: 'Manufacturer & Merchant',
                        desc: 'Hybrid model: in-house manufacturing combined with merchant sourcing.',
                      },
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => setBusinessType(opt.value as any)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          businessType === opt.value
                            ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50 shadow-md shadow-emerald-950/50'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-xs text-white">{opt.title}</span>
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                              businessType === opt.value
                                ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                                : 'border-slate-600'
                            }`}
                          >
                            {businessType === opt.value && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{opt.desc}</p>
                      </div>
                    ))}
                  </div>
                  <input type="hidden" name="businessType" value={businessType} />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: BUSINESS DETAILS                                                   */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-800 pb-5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <FileCheck2 className="w-4 h-4" /> Legal & Contact Coordinates
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Business Details</h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Provide registered legal identifiers and facility address. DGFT IEC and Udyam can be completed now or later.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Registered Legal Entity Name
                    </label>
                    <input
                      type="text"
                      name="legalName"
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      placeholder={companyName || 'e.g. Apex Global Exports Pvt Ltd'}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Official Export Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="officialEmail"
                      value={officialEmail}
                      onChange={(e) => setOfficialEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                    {errors.officialEmail && (
                      <p className="text-xs text-red-400 mt-1">{errors.officialEmail}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Registered Operating Facility / Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Plot 42, Export Processing Zone, MIDC"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={country}
                      readOnly
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* GSTIN Field */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      GSTIN (Goods and Services Tax Identification Number)
                      <span className="text-[10px] text-slate-400 font-normal">(Optional for SEZ/unregistered)</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    name="gstin"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="27AAAAA0000A1Z5"
                    maxLength={15}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:border-emerald-500 focus:outline-none tracking-wider"
                  />
                  {errors.gstin && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.gstin}
                    </p>
                  )}
                </div>

                {/* IEC Section */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">DGFT Import Export Code (IEC)</span>
                      <p className="text-[11px] text-slate-400">Mandatory 10-digit DGFT code for customs export clearance.</p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={!hasIec}
                        onChange={(e) => {
                          setHasIec(!e.target.checked);
                          if (e.target.checked) setIec('');
                        }}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900 h-4 w-4"
                      />
                      <span>I don&apos;t have an IEC yet</span>
                    </label>
                  </div>

                  <input type="hidden" name="hasIec" value={hasIec ? 'true' : 'false'} />

                  {hasIec ? (
                    <div>
                      <input
                        type="text"
                        name="iec"
                        value={iec}
                        onChange={(e) => setIec(e.target.value.toUpperCase())}
                        placeholder="0301099882"
                        maxLength={10}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white font-mono focus:border-emerald-500 focus:outline-none tracking-wider"
                      />
                      {errors.iec && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.iec}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs text-amber-300 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <span className="font-semibold">No problem!</span> VyaparFlow will automatically add DGFT IEC application steps to your readiness checklist once your workspace is live.
                      </div>
                    </div>
                  )}
                </div>

                {/* Udyam MSME */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Udyam MSME Registration Number <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="udyamNumber"
                    value={udyamNumber}
                    onChange={(e) => setUdyamNumber(e.target.value.toUpperCase())}
                    placeholder="UDYAM-MH-01-0012345"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: INDUSTRY AND PRODUCTS                                             */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-800 pb-5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Package className="w-4 h-4" /> Personalization Engine
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Industry & Products</h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Your selected industry and HS classifications configure statutory testing, certifications (e.g. FSSAI for food vs BIS for metals), and tariff intelligence.
                </p>
              </div>

              {/* Industry Grid */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-200">
                  Select Primary Industry / Domain <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {INDUSTRY_OPTIONS.map((ind) => (
                    <div
                      key={ind.id}
                      onClick={() => {
                        setIndustry(ind.id);
                        // Update category for existing products
                        setProducts(products.map((p) => ({ ...p, category: ind.id })));
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        industry === ind.id
                          ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50 shadow-md shadow-emerald-950/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-white">{ind.label}</span>
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                            industry === ind.id
                              ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                              : 'border-slate-600'
                          }`}
                        >
                          {industry === ind.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{ind.desc}</p>
                    </div>
                  ))}
                </div>
                <input type="hidden" name="industry" value={industry} />
              </div>

              {/* Product Items List */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Export Merchandise & Products</span>
                    <p className="text-[11px] text-slate-400">Add the items you currently export or intend to export.</p>
                  </div>

                  <button
                    type="button"
                    onClick={addProduct}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 border border-emerald-800/60 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Another Product
                  </button>
                </div>

                {errors.productName && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.productName}
                  </p>
                )}

                <div className="space-y-3">
                  {products.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">
                            {idx + 1}
                          </span>
                          Product #{idx + 1}
                        </span>

                        {products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProduct(p.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                            title="Remove product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">
                            Product Name / Cargo Title <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => updateProduct(p.id, 'name', e.target.value)}
                            placeholder="e.g. 100% Cotton Knitted Casual T-Shirts"
                            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-medium text-slate-300">
                              ITC-HS Code (6 or 8 digits)
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-400">
                              <input
                                type="checkbox"
                                checked={p.noHsCodeYet}
                                onChange={(e) => {
                                  updateProduct(p.id, 'noHsCodeYet', e.target.checked);
                                  if (e.target.checked) updateProduct(p.id, 'hsCode', 'PENDING');
                                  else updateProduct(p.id, 'hsCode', '');
                                }}
                                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900 h-3 w-3"
                              />
                              <span>Not known yet</span>
                            </label>
                          </div>

                          {!p.noHsCodeYet ? (
                            <input
                              type="text"
                              value={p.hsCode === 'PENDING' ? '' : p.hsCode}
                              onChange={(e) => updateProduct(p.id, 'hsCode', e.target.value)}
                              placeholder="e.g. 6109.10.00"
                              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          ) : (
                            <div className="px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-[11px] text-slate-400 italic">
                              HS Code will be classified during export readiness workflow.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: EXPORT DESTINATIONS                                               */}
          {/* ========================================================================= */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-800 pb-5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Globe2 className="w-4 h-4" /> Trade Corridors
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Export Destinations</h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Where do you plan to ship your goods? Destination markets determine preferential tariff agreements, destination customs clearance rules, and Certificate of Origin types.
                </p>
              </div>

              {errors.destinations && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.destinations}
                </p>
              )}

              {/* Target Country Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TARGET_DESTINATIONS.map((dest) => {
                  const isSelected = selectedDestinations.some((d) => d.name === dest.name);
                  return (
                    <div
                      key={dest.name}
                      onClick={() => toggleDestination({ name: dest.name, isoCode: dest.isoCode })}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50 shadow-md shadow-emerald-950/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-white">{dest.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                            {dest.isoCode}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-400/90 font-medium">{dest.badge}</p>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border mt-0.5 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Destination Input */}
              <div className="pt-3 border-t border-slate-800">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Need another destination not listed above?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDestination}
                    onChange={(e) => setCustomDestination(e.target.value)}
                    placeholder="e.g. Canada, France, Kenya, Brazil"
                    className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomDestination}
                    disabled={!customDestination.trim()}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs px-4 py-2 rounded-xl transition-colors font-semibold"
                  >
                    Add Country
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: EXISTING REGISTRATIONS & DOCUMENTS                                */}
          {/* ========================================================================= */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-800 pb-5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <FileUp className="w-4 h-4" /> Document Vault
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Existing Registrations & Proofs</h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Upload official certificates you currently hold. Uploaded documents are submitted for platform verification. Unuploaded documents remain active checklist tasks on your dashboard.
                </p>
              </div>

              {/* Checklist & Dropzones */}
              <div className="space-y-5">
                {/* GST Registration Certificate */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-xs text-slate-200">1. GSTIN Registration Certificate</span>
                      <p className="text-[11px] text-slate-400">Form GST REG-06 or official GST registration document.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedDocs.gstDoc}
                        onChange={(e) => setSelectedDocs({ ...selectedDocs, gstDoc: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900 h-4 w-4"
                      />
                      <span>I have this document</span>
                    </label>
                  </div>

                  {selectedDocs.gstDoc && (
                    <DocumentDropzone
                      name="gstDoc"
                      label="Upload GST Registration Certificate"
                      description="Drag & drop or browse GST REG-06 certificate PDF or image."
                      maxSizeMb={10}
                      status="not_uploaded"
                    />
                  )}
                </div>

                {/* DGFT IEC Certificate */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-xs text-slate-200">2. DGFT Import Export Code (IEC) Certificate</span>
                      <p className="text-[11px] text-slate-400">DGFT electronic IEC certificate issued by Regional Authority.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedDocs.iecDoc}
                        onChange={(e) => setSelectedDocs({ ...selectedDocs, iecDoc: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900 h-4 w-4"
                      />
                      <span>I have this document</span>
                    </label>
                  </div>

                  {selectedDocs.iecDoc && (
                    <DocumentDropzone
                      name="iecDoc"
                      label="Upload DGFT IEC Certificate"
                      description="Drag & drop or browse DGFT IEC certificate PDF."
                      maxSizeMb={10}
                      status="not_uploaded"
                    />
                  )}
                </div>

                {/* Udyam Registration */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-xs text-slate-200">3. Udyam MSME Registration Certificate</span>
                      <p className="text-[11px] text-slate-400">Ministry of Micro, Small and Medium Enterprises certificate.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedDocs.udyamDoc}
                        onChange={(e) => setSelectedDocs({ ...selectedDocs, udyamDoc: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900 h-4 w-4"
                      />
                      <span>I have this document</span>
                    </label>
                  </div>

                  {selectedDocs.udyamDoc && (
                    <DocumentDropzone
                      name="udyamDoc"
                      label="Upload Udyam Registration Certificate"
                      description="Upload official Udyam certificate."
                      maxSizeMb={10}
                      status="not_uploaded"
                    />
                  )}
                </div>

                {/* RCMC Certificate */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-xs text-slate-200">4. Export Promotion Council RCMC Membership</span>
                      <p className="text-[11px] text-slate-400">APEDA, TEXPROCIL, EEPC, FIEO or relevant EPC registration.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedDocs.rcmcDoc}
                        onChange={(e) => setSelectedDocs({ ...selectedDocs, rcmcDoc: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900 h-4 w-4"
                      />
                      <span>I have this document</span>
                    </label>
                  </div>

                  {selectedDocs.rcmcDoc && (
                    <DocumentDropzone
                      name="rcmcDoc"
                      label="Upload RCMC Certificate"
                      description="Upload EPC membership certificate."
                      maxSizeMb={10}
                      status="not_uploaded"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: REVIEW & LAUNCH WORKSPACE                                         */}
          {/* ========================================================================= */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-800 pb-5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" /> Ready for Launch
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Review & Create Workspace</h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Verify your business profile. Upon completion, VyaparFlow will personalize statutory compliance tasks, tariff intelligence, and export readiness tracking.
                </p>
              </div>

              {/* Review Deck Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Organization Card */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Organization Profile
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p><span className="text-slate-400">Brand Name:</span> <strong className="text-white">{companyName}</strong></p>
                    <p><span className="text-slate-400">Model:</span> <span className="text-slate-200">{businessType} Exporter</span></p>
                    <p><span className="text-slate-400">Location:</span> <span className="text-slate-200">{city}, {state}</span></p>
                  </div>
                </div>

                {/* Registrations Card */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> Statutory IDs
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p><span className="text-slate-400">GSTIN:</span> <strong className="text-white font-mono">{gstin || 'Not Provided (Unregistered)'}</strong></p>
                    <p><span className="text-slate-400">DGFT IEC:</span> <strong className="text-white font-mono">{hasIec && iec ? iec : 'Pending Application'}</strong></p>
                    <p><span className="text-slate-400">Udyam:</span> <span className="text-slate-200 font-mono">{udyamNumber || 'Not Provided'}</span></p>
                  </div>
                </div>

                {/* Industry & Products */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-emerald-400" /> Export Products ({products.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p><span className="text-slate-400">Industry:</span> <strong className="text-white">{industry}</strong></p>
                    <ul className="text-slate-300 space-y-1 mt-1 pl-2 border-l border-slate-800">
                      {products.map((p, idx) => (
                        <li key={idx} className="truncate">
                          • {p.name} <span className="text-slate-500 font-mono text-[10px]">({p.hsCode || 'HS Pending'})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Destinations */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-emerald-400" /> Corridors ({selectedDestinations.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedDestinations.map((d) => (
                      <span
                        key={d.name}
                        className="text-[11px] bg-slate-800 border border-slate-700 text-slate-200 px-2 py-0.5 rounded-full"
                      >
                        {d.name} ({d.isoCode})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Engine Guarantee Callout */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-800/40 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Sparkles className="w-4 h-4" /> Tailored Requirement Engine
                </div>
                <p className="text-[11px] text-slate-400">
                  Your dashboard will automatically calculate your initial Readiness Score, identify critical export blockers, and load corridor tariff schedules tailored strictly to <strong className="text-white">{industry}</strong> exports to <strong className="text-white">{selectedDestinations.map((d) => d.name).join(', ')}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* NAVIGATION BUTTONS                                                        */}
          {/* ========================================================================= */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all ml-auto"
              >
                Continue to Step {step + 1} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs sm:text-sm font-bold shadow-xl shadow-emerald-500/25 transition-all disabled:opacity-50 ml-auto"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Launching Workspace...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Create & Launch Workspace →
                  </span>
                )}
              </button>
            )}
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 text-center py-4 text-[11px] text-slate-500">
        VyaparFlow Enterprise Export Readiness &bull; Secure Multi-Tenant Architecture &bull; ISO/IEC 27001 Certified Standards
      </footer>
    </div>
  );
}
