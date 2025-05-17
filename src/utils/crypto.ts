import CryptoJS from "crypto-js";

async function fetchAndDecryptContent() {
  const hash = '4269445|HAj2p0lqmNAAfzhaeokwqyxOxXNSnUTDy7YSWT8O'
  const userId = 1028654
  const chapterId = 20653088
  try {
    // Fetch chapter details from the API
    const response = await fetch(`https://backend.metruyencv.com/api/chapters/${chapterId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${hash}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch chapter details");
    }

    const chapter = await response.json();

    // Check if content exists
    if (chapter.content) {
      // Generate IV from hash and userId
      const ivStr = btoa(hash + userId).slice(0, 16);

      // Generate key from the API's key (base64)
      const keyRaw = CryptoJS.enc.Base64.parse(chapter.key)
        .toString(CryptoJS.enc.Utf8)
        .slice(0, 16);

      // Parse ciphertext from content
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(chapter.content),
      });

      // Decrypt AES
      const decrypted = CryptoJS.AES.decrypt(cipherParams, CryptoJS.enc.Utf8.parse(keyRaw), {
        iv: CryptoJS.enc.Utf8.parse(ivStr),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }).toString(CryptoJS.enc.Utf8);

      // Return decrypted content
      return decrypted.split("\n");
    }

    return null;
  } catch (error) {
    console.error("Error fetching or decrypting content:", error);
    return null;
  }
}

export { fetchAndDecryptContent };
