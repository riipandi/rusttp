import * as stylex from '@stylexjs/stylex'
import {
  fontFamilyVar,
  fontLetterSpacing,
  fontLineHeight,
  fontSize,
  fontWeightVar
} from './tokens.stylex'

/**
 * One recipe per Text variant, reading the typography role vars (`fontFamilyVar`, `fontSize`,
 * `fontWeightVar`, `fontLineHeight`, `fontLetterSpacing`). A component text part composes the role
 * it names, as `stylex.props(type.body1, s.title)`, so a theme that retunes a role retunes the part
 * too. Compose it before the part's own style, which may set a weight or a color. Text does the
 * same for its `variant`; it keeps its own copy only because its responsive styles key a whole
 * style on a media query, which StyleX resolves only from the file that declares the constant.
 */
export const type = stylex.create({
  headline1: {
    fontFamily: fontFamilyVar.headline1,
    fontSize: fontSize.headline1,
    fontWeight: fontWeightVar.headline1,
    letterSpacing: fontLetterSpacing.headline1,
    lineHeight: fontLineHeight.headline1
  },
  headline2: {
    fontFamily: fontFamilyVar.headline2,
    fontSize: fontSize.headline2,
    fontWeight: fontWeightVar.headline2,
    letterSpacing: fontLetterSpacing.headline2,
    lineHeight: fontLineHeight.headline2
  },
  headline3: {
    fontFamily: fontFamilyVar.headline3,
    fontSize: fontSize.headline3,
    fontWeight: fontWeightVar.headline3,
    letterSpacing: fontLetterSpacing.headline3,
    lineHeight: fontLineHeight.headline3
  },
  featured1: {
    fontFamily: fontFamilyVar.featured1,
    fontSize: fontSize.featured1,
    fontWeight: fontWeightVar.featured1,
    letterSpacing: fontLetterSpacing.featured1,
    lineHeight: fontLineHeight.featured1
  },
  featured2: {
    fontFamily: fontFamilyVar.featured2,
    fontSize: fontSize.featured2,
    fontWeight: fontWeightVar.featured2,
    letterSpacing: fontLetterSpacing.featured2,
    lineHeight: fontLineHeight.featured2
  },
  featured3: {
    fontFamily: fontFamilyVar.featured3,
    fontSize: fontSize.featured3,
    fontWeight: fontWeightVar.featured3,
    letterSpacing: fontLetterSpacing.featured3,
    lineHeight: fontLineHeight.featured3
  },
  featured4: {
    fontFamily: fontFamilyVar.featured4,
    fontSize: fontSize.featured4,
    fontWeight: fontWeightVar.featured4,
    letterSpacing: fontLetterSpacing.featured4,
    lineHeight: fontLineHeight.featured4
  },
  featured5: {
    fontFamily: fontFamilyVar.featured5,
    fontSize: fontSize.featured5,
    fontWeight: fontWeightVar.featured5,
    letterSpacing: fontLetterSpacing.featured5,
    lineHeight: fontLineHeight.featured5
  },
  featured6: {
    fontFamily: fontFamilyVar.featured6,
    fontSize: fontSize.featured6,
    fontWeight: fontWeightVar.featured6,
    letterSpacing: fontLetterSpacing.featured6,
    lineHeight: fontLineHeight.featured6
  },
  body1: {
    fontFamily: fontFamilyVar.body1,
    fontSize: fontSize.body1,
    fontWeight: fontWeightVar.body1,
    letterSpacing: fontLetterSpacing.body1,
    lineHeight: fontLineHeight.body1
  },
  body2: {
    fontFamily: fontFamilyVar.body2,
    fontSize: fontSize.body2,
    fontWeight: fontWeightVar.body2,
    letterSpacing: fontLetterSpacing.body2,
    lineHeight: fontLineHeight.body2
  },
  caption1: {
    fontFamily: fontFamilyVar.caption1,
    fontSize: fontSize.caption1,
    fontWeight: fontWeightVar.caption1,
    letterSpacing: fontLetterSpacing.caption1,
    lineHeight: fontLineHeight.caption1
  },
  caption2: {
    fontFamily: fontFamilyVar.caption2,
    fontSize: fontSize.caption2,
    fontWeight: fontWeightVar.caption2,
    letterSpacing: fontLetterSpacing.caption2,
    lineHeight: fontLineHeight.caption2
  }
})
