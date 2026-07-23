export function escapeHtml(unsafe: string) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function base64EncodeSafe(str: string) {
  // Using escape/unescape to match the requested GAS implementation exactly 
  // so the output script works identical to the original logic
  return btoa(unescape(encodeURIComponent(str)));
}

export function createSVGString(size: number, bgColor: string, textColor: string, text: string) {
  const fontSize = size === 192 ? 90 : 240;
  const yPos = size === 192 ? 120 : 320;
  const center = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${bgColor}"/>
    <text x="${center}" y="${yPos}" font-size="${fontSize}" fill="${textColor}" text-anchor="middle" font-family="sans-serif" font-weight="bold">${text}</text>
  </svg>`;
}

export function getKbSize(str: string) {
  return (new Blob([str]).size / 1024).toFixed(1);
}
