// Narration — mounts every VO cue as an <Audio> at its start frame
// (CINEMATIC-FILM.md §6). Each MP3 is a single spoken line (no in-point trim),
// so a cue is just <Audio> inside a <Sequence from={startFrame}
// durationInFrames={durationInFrames}>. Remotion muxes the audio into the output
// MP4 via its bundled ffmpeg. Ducking of the music under these windows is owned
// by MusicBed (which reads the same NARRATION config).

import React from 'react'
import { Audio, Sequence, staticFile } from 'remotion'
import { NARRATION } from '../../config/narration'

export const Narration: React.FC = () => {
  return (
    <>
      {NARRATION.map((cue) => (
        <Sequence
          key={cue.id}
          from={cue.startFrame}
          durationInFrames={cue.durationInFrames}
          name={`VO ${cue.id}`}
        >
          <Audio src={staticFile(cue.file)} />
        </Sequence>
      ))}
    </>
  )
}
