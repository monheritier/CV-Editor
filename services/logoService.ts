
/**
 * Fetches a company logo from the Clearbit API.
 * @param companyName The name of the company.
 * @returns A promise that resolves to the logo URL or an empty string if not found.
 */
export const findLogo = async (companyName: string): Promise<string> => {
    if (!companyName?.trim()) return '';
    
    // Naive domain generation from company name.
    const domain = companyName.toLowerCase()
        .replace(/ & /g, '')
        .replace(/,/g, '')
        .replace(/\./g, '')
        .replace(/\s+/g, '') + '.com';
        
    const logoUrl = `https://logo.clearbit.com/${domain}`;

    // Use the Image object's onload/onerror to check if the logo exists without a CORS-heavy fetch.
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(logoUrl);
        img.onerror = () => resolve(''); // Resolve with empty string indicates fallback
        img.src = logoUrl;
    });
};
