/**
 * Sandbox.co.in GST Public API Client & Verification Helper
 * 
 * Uses Sandbox API to fetch taxpayer details from GSTIN.
 * Supports:
 * - Live Sandbox.co.in API (if SANDBOX_API_KEY & SANDBOX_API_SECRET or SANDBOX_ACCESS_TOKEN configured)
 * - Automatic token generation & caching (valid for 24 hours)
 * - Deterministic fallback generator for offline / test GSTINs so local dev & testing works immediately.
 */

export interface GSTDetails {
  gstin: string;
  legalName: string;
  tradeName?: string;
  status: 'Active' | 'Inactive' | 'Cancelled' | 'Suspended';
  constitutionOfBusiness?: string;
  taxpayerType?: string;
  registrationDate?: string;
  address?: {
    buildingName?: string;
    street?: string;
    location?: string;
    city: string;
    district?: string;
    state: string;
    pincode: string;
  };
  isLive: boolean;
  source: string;
}

// In-memory token cache for server lifetime
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Obtain access token from Sandbox.co.in
 */
async function getSandboxAccessToken(apiKey: string, apiSecret: string): Promise<string | null> {
  // If explicitly provided via env
  if (process.env.SANDBOX_ACCESS_TOKEN) {
    return process.env.SANDBOX_ACCESS_TOKEN;
  }

  // Check cache (refresh 5 mins before expiry)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  try {
    const res = await fetch('https://api.sandbox.co.in/authenticate', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'x-api-secret': apiSecret,
        'x-api-version': process.env.SANDBOX_API_VERSION || '1.0.0',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Sandbox.co.in Auth] Authentication failed (${res.status}): ${errText}`);
      return null;
    }

    const data = await res.json();
    const token = data?.access_token || data?.data?.access_token;
    if (token) {
      // 24 hours default expiry
      cachedToken = {
        token,
        expiresAt: Date.now() + 23 * 60 * 60 * 1000,
      };
      return token;
    }
  } catch (error) {
    console.error('[Sandbox.co.in Auth] Network error during authentication:', error);
  }

  return null;
}

/**
 * State code to State Name mapping (Indian GST standard state codes)
 */
const STATE_CODE_MAP: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman & Diu',
  '26': 'Dadra & Nagar Haveli',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
};

/**
 * Fallback generator for test/demo GSTINs when API key is not configured or in test mode.
 */
function getDemoGSTDetails(gstin: string): GSTDetails {
  const cleanGst = gstin.trim().toUpperCase();
  const stateCode = cleanGst.substring(0, 2);
  const stateName = STATE_CODE_MAP[stateCode] || 'Maharashtra';

  // Specific preset demo GSTINs
  if (cleanGst === '27AAACP1234F1Z5') {
    return {
      gstin: cleanGst,
      legalName: 'Apex Agro & Engineering Exports Pvt Ltd',
      tradeName: 'Apex Quality Exports',
      status: 'Active',
      constitutionOfBusiness: 'Private Limited Company',
      taxpayerType: 'Regular',
      registrationDate: '01/07/2017',
      address: {
        buildingName: 'Plot 42, Sector 3',
        street: 'Export Promotion Industrial Park',
        location: 'Western Trade Corridor',
        city: 'Mumbai',
        district: 'Mumbai Suburb',
        state: 'Maharashtra',
        pincode: '400093',
      },
      isLive: false,
      source: 'Sandbox Sandbox Mock (Preset Exporter)',
    };
  }

  // Derive plausible business name based on PAN 4th character
  const pan = cleanGst.substring(2, 12);
  const entityTypeChar = pan.charAt(3);
  let entityType = 'Private Limited Company';
  if (entityTypeChar === 'P') entityType = 'Proprietorship';
  else if (entityTypeChar === 'F') entityType = 'Partnership / LLP';
  else if (entityTypeChar === 'C') entityType = 'Private Limited Company';

  const defaultCity = stateCode === '27' ? 'Mumbai' : stateCode === '24' ? 'Surat' : stateCode === '07' ? 'New Delhi' : stateCode === '33' ? 'Chennai' : 'Bengaluru';

  return {
    gstin: cleanGst,
    legalName: `${pan.substring(0, 4)} Industries (${entityTypeChar === 'P' ? 'Proprietor' : 'Enterprise'})`,
    tradeName: `${pan.substring(0, 4)} Global Trading Co`,
    status: 'Active',
    constitutionOfBusiness: entityType,
    taxpayerType: 'Regular',
    registrationDate: '15/08/2018',
    address: {
      buildingName: 'Survey No. 108, Industrial Estate',
      street: 'Express Highway Complex',
      location: 'Industrial Zone',
      city: defaultCity,
      district: defaultCity,
      state: stateName,
      pincode: stateCode === '27' ? '400001' : '395003',
    },
    isLive: false,
    source: 'Deterministic Verification Fallback (Add SANDBOX_API_KEY for Live GSTN data)',
  };
}

/**
 * Fetch GSTIN details using Sandbox.co.in Public GST API.
 */
export async function fetchGSTDetailsFromSandbox(gstin: string): Promise<{
  success: boolean;
  data?: GSTDetails;
  error?: string;
}> {
  const cleanGst = gstin?.trim().toUpperCase();

  if (!cleanGst || cleanGst.length !== 15) {
    return {
      success: false,
      error: 'GSTIN must be exactly 15 alphanumeric characters.',
    };
  }

  const apiKey = process.env.SANDBOX_API_KEY;
  const apiSecret = process.env.SANDBOX_API_SECRET;

  // If no Sandbox credentials, immediately use deterministic fallback
  if (!apiKey) {
    return {
      success: true,
      data: getDemoGSTDetails(cleanGst),
    };
  }

  // Authenticate & get bearer token
  const token = await getSandboxAccessToken(apiKey, apiSecret || '');
  if (!token) {
    console.warn('[Sandbox.co.in] Unable to authenticate. Using fallback.');
    return {
      success: true,
      data: getDemoGSTDetails(cleanGst),
    };
  }

  // Call Sandbox Public GSTIN endpoint
  // Standard public verify / search endpoints
  const endpoints = [
    'https://api.sandbox.co.in/gst/compliance/public/gstin/search',
    'https://api.sandbox.co.in/gst/compliance/public/gstin/verify',
    'https://api.sandbox.co.in/gsp/public/gstin',
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'authorization': token,
          'x-api-version': process.env.SANDBOX_API_VERSION || '1.0.0',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ gstin: cleanGst }),
      });

      if (res.ok) {
        const json = await res.json();
        const payload = json.data || json;

        // Parse fields across varying sandbox response formats
        const legalName =
          payload.legal_name ||
          payload.lgnm ||
          payload.legalName ||
          payload.trade_name ||
          payload.tradeName ||
          `Entity for ${cleanGst}`;

        const tradeName = payload.trade_name || payload.tradeName || payload.trade_nam;
        const status =
          payload.status ||
          payload.sts ||
          payload.current_status ||
          'Active';

        const addressObj = payload.principal_place_of_business?.address || payload.pradr?.addr || payload.address || {};
        const stateCode = cleanGst.substring(0, 2);
        const stateName = addressObj.state_name || addressObj.state || STATE_CODE_MAP[stateCode] || 'Maharashtra';
        const city = addressObj.city || addressObj.city_name || addressObj.district || addressObj.dst || 'Mumbai';

        return {
          success: true,
          data: {
            gstin: cleanGst,
            legalName: legalName.toUpperCase(),
            tradeName: tradeName ? tradeName.toUpperCase() : undefined,
            status: (status.toLowerCase().includes('act') ? 'Active' : status) as any,
            constitutionOfBusiness: payload.constitution_of_business || payload.ctb,
            taxpayerType: payload.taxpayer_type || payload.dty,
            registrationDate: payload.registration_date || payload.rgdt,
            address: {
              buildingName: addressObj.building_name || addressObj.bno || addressObj.bnm,
              street: addressObj.street || addressObj.st,
              location: addressObj.location || addressObj.loc,
              city,
              district: addressObj.district || addressObj.dst || city,
              state: stateName,
              pincode: addressObj.pincode || addressObj.pncd || '',
            },
            isLive: true,
            source: 'Sandbox.co.in Live GST Public API',
          },
        };
      }
    } catch (err) {
      console.error(`[Sandbox.co.in] Failed on ${endpoint}:`, err);
    }
  }

  // If live calls failed (e.g. rate limit, invalid key on sandbox server), fallback gracefully
  return {
    success: true,
    data: getDemoGSTDetails(cleanGst),
  };
}
