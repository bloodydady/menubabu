export function getDirectImageUrl(url) {
  if (!url) return "";
  const cleanUrl = url.trim();
  
  // Convert Google Drive sharing link to direct image link
  if (cleanUrl.includes("drive.google.com")) {
    let fileId = "";
    if (cleanUrl.includes("/file/d/")) {
      const parts = cleanUrl.split("/file/d/");
      if (parts[1]) {
        fileId = parts[1].split("/")[0];
      }
    } else if (cleanUrl.includes("id=")) {
      const match = cleanUrl.match(/[?&]id=([^&]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }
    
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
  return cleanUrl;
}
