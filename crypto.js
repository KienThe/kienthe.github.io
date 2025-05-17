import CryptoJS from "crypto-js"

async function fetchAndDecryptContent() {
  const hash = "4269445|HAj2p0lqmNAAfzhaeokwqyxOxXNSnUTDy7YSWT8O"
  const chapterId = 20653088
  let isLoading = false
  let content = ""

  try {
    isLoading = true

    // Fetch chapter details from the API
    const response = await fetch(
      `https://backend.metruyencv.com/api/chapters/${chapterId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hash}`
        }
      }
    )

    if (!response.ok) {
      throw new Error("Failed to fetch chapter details")
    }

    const data = await response.json()
    content = data.data.content

    if (content != null) {
      // Create key for decryption
      const key = btoa(hash + "metruyencv.com").slice(0, 16)

      try {
        // First decode base64 content
        const decodedContent = atob(content).replace(
          /[\u0000-\u001F\u007F-\u009F]/g,
          ""
        ) // Remove control characters

        // Then parse the JSON
        const payload = JSON.parse(decodedContent)

        // Get the IV and value
        const iv = CryptoJS.enc.Base64.parse(payload.iv)
        const value = CryptoJS.enc.Base64.parse(payload.value)

        // AES decrypt
        const decrypted = CryptoJS.AES.decrypt({ ciphertext: value }, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        })

        // Convert decrypted content to string
        const decryptedContent = decrypted.toString(CryptoJS.enc.Utf8)

        // Show decrypted content
        console.log("Decrypted content:", decryptedContent.split("\n"))
        return decryptedContent
      } catch (parseError) {
        console.error("Error parsing content:", parseError)
        return null
      }
    } else {
      console.log("No content found in the chapter details.")
      return null
    }
  } catch (error) {
    console.error("Error fetching or decrypting content:", error)
    return null
  } finally {
    isLoading = false
  }
}

async function main() {
  const decryptedContent = await fetchAndDecryptContent()
  if (decryptedContent) {
    console.log("Decrypted content:", decryptedContent)
  } else {
    console.log("No content to display.")
  }
}

main()
