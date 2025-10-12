// netlify/functions/scan.js

export const handler = async () => {
  try {
    console.log("⏰ Running Vinted scan...");
    const response = await fetch("https://huntrix.onrender.com/api/scan");
    const result = await response.text();

    console.log("✅ Scan completed:", result);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Scan executed successfully." }),
    };
  } catch (error) {
    console.error("❌ Scan failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};