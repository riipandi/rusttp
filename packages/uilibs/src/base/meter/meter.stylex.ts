// Meter draws the same label, track, and fill as Progress, so it reuses that stylesheet under its
// own names. The two differ only in role (`meter`, `progressbar`) and in the Base UI parts they wrap.
export {
  progressColors as meterColors,
  progressSizes as meterSizes,
  progressStyles as meterStyles
} from '../progress/progress.stylex'
