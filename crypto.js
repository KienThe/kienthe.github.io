import CryptoJS from "crypto-js"

async function fetchAndDecryptContent() {
  const token = "4269445|HAj2p0lqmNAAfzhaeokwqyxOxXNSnUTDy7YSWT8O"
  const hash = 1028654
  const chapterId = 20653088

  try {
    const response = await fetch(
      `https://backend.metruyencv.com/api/chapters/${chapterId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      throw new Error("Failed to fetch chapter details")
    }

    const data = await response.json()
    const content = data.data.content

    if (!content) {
      return null
    }

    const key = CryptoJS.MD5(hash + "MeTruyenCVu")
      .toString()
      .slice(0, 16)

    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(content)
    })

    const decrypted = CryptoJS.AES.decrypt(
      cipherParams,
      CryptoJS.enc.Utf8.parse(key),
      {
        iv: CryptoJS.enc.Utf8.parse(key),
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    )

    return decrypted.toString(CryptoJS.enc.Utf16)
  } catch (error) {
    return null
  }
}

async function main() {
  const decryptedContent = await fetchAndDecryptContent()
  if (decryptedContent) {
    console.log(decryptedContent)
  }
}

main()
