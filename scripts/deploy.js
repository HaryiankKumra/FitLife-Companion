const { execSync } = require("child_process")

console.log("🚀 Deploying FitLife Companion to Vercel...")

try {
  // Install Vercel CLI if not present
  console.log("📦 Installing Vercel CLI...")
  execSync("npm install -g vercel", { stdio: "inherit" })

  // Deploy to Vercel
  console.log("🌐 Deploying to Vercel...")
  execSync("vercel --prod", { stdio: "inherit" })

  console.log("✅ Deployment completed successfully!")
  console.log("🎉 Your FitLife Companion app is now live!")
} catch (error) {
  console.error("❌ Deployment failed:", error.message)
  process.exit(1)
}
