import { Config } from '@remotion/cli/config'

// Render defaults for the Lumen Labs launch film.
Config.setVideoImageFormat('jpeg')
Config.setCodec('h264')
Config.setOverwriteOutput(true)
Config.setChromiumOpenGlRenderer('angle')
