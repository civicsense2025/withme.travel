import { exec } from "child_process"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Run the download script
console.log("Starting destination image update process...")
exec("tsx scripts/download-destination-images.tsx", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`)
    return
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`)
    return
  }
  console.log(stdout)
})
